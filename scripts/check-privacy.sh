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
errors=0

files=$(git ls-files -co --exclude-standard)

while IFS= read -r f; do
  [ -n "$f" ] || continue
  grep -a -i -n -F -f "$tmp" -- "$f" > /dev/null 2>&1
  rc=$?
  if [ "$rc" -eq 0 ]; then
    echo "MATCH in file: $f"
    status=1
  elif [ "$rc" -ne 1 ]; then
    echo "ERROR reading file: $f" >&2
    errors=1
  fi
done <<< "$files"

names=$( { printf '%s\n' "$files"; git log --all --name-only --format= 2> /dev/null; } | sort -u)
while IFS= read -r n; do
  [ -n "$n" ] || continue
  if printf '%s\n' "$n" | grep -a -i -F -f "$tmp" > /dev/null; then
    echo "MATCH in file name: $n"
    status=1
  fi
done <<< "$names"

revs=$(git rev-list --all 2> /dev/null)
if [ -n "$revs" ]; then
  # shellcheck disable=SC2086
  git grep -a -i -q -F -f "$tmp" $revs -- > /dev/null 2>&1
  rc=$?
  if [ "$rc" -eq 0 ]; then
    echo "MATCH in git history contents"
    status=1
  elif [ "$rc" -ne 1 ]; then
    echo "ERROR searching git history" >&2
    errors=1
  fi
fi

if git log --format='%an <%ae>%n%cn <%ce>%n%B' 2> /dev/null | grep -a -i -F -f "$tmp" > /dev/null; then
  echo "MATCH in git log (author, committer, or message)"
  status=1
fi

asset_files=$(printf '%s\n' "$files" | grep -E '^assets/' | grep -v -E '(^|/)\.gitkeep$')
if [ -n "$asset_files" ]; then
  if ! command -v exiftool > /dev/null 2>&1; then
    echo "ERROR: exiftool is required to check image metadata in assets/ (brew install exiftool)" >&2
    errors=1
  else
    while IFS= read -r a; do
      flagged=$(exiftool -q -if '$GPSLatitude or $Artist or $OwnerName or $Creator or $Copyright or $Author' -p '$FileName' -- "$a" 2> /dev/null)
      if [ -n "$flagged" ]; then
        echo "MATCH EXIF metadata (GPS/author/copyright) in file: $a"
        status=1
      fi
    done <<< "$asset_files"
  fi
fi

if [ "$errors" -ne 0 ]; then
  exit 2
fi
exit "$status"
