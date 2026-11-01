#!/usr/bin/env bash
set -u

patterns_file="${PRIVACY_PATTERNS:-.privacy-patterns}"

if [ ! -f "$patterns_file" ]; then
  echo "patterns file not found: $patterns_file" >&2
  exit 2
fi

tmp=$(mktemp)
trap 'rm -f "$tmp"' EXIT
grep -v -e '^[[:space:]]*$' -e '^[[:space:]]*#' "$patterns_file" > "$tmp"

if [ ! -s "$tmp" ]; then
  echo "patterns file has no patterns: $patterns_file" >&2
  exit 2
fi

status=0

while IFS= read -r f; do
  if grep -I -i -n -F -f "$tmp" -- "$f" > /dev/null 2>&1; then
    echo "MATCH in file: $f"
    status=1
  fi
done < <(git ls-files -co --exclude-standard)

if git log --format='%an <%ae>%n%cn <%ce>%n%B' 2> /dev/null | grep -i -F -f "$tmp" > /dev/null; then
  echo "MATCH in git log (author, committer, or message)"
  status=1
fi

exit "$status"
