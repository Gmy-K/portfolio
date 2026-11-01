const test = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync, execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const script = path.resolve(__dirname, "../scripts/check-privacy.sh");
const noreply = { name: "Gmy-K", email: "1+Gmy-K@users.noreply.github.com" };

function makeRepo(files, patterns, author = noreply) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "privacy-"));
  const env = {
    ...process.env,
    GIT_AUTHOR_NAME: author.name,
    GIT_AUTHOR_EMAIL: author.email,
    GIT_COMMITTER_NAME: author.name,
    GIT_COMMITTER_EMAIL: author.email,
  };
  const git = (...args) => execFileSync("git", args, { cwd: dir, env });
  git("init", "-q", "-b", "main");
  for (const [name, body] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, name), body);
  }
  git("add", "-A");
  git("commit", "-q", "-m", "init");
  const patternsFile = dir + ".patterns";
  if (patterns !== null) fs.writeFileSync(patternsFile, patterns);
  return { dir, patternsFile };
}

function run({ dir, patternsFile }) {
  return spawnSync("bash", [script], {
    cwd: dir,
    env: { ...process.env, PRIVACY_PATTERNS: patternsFile },
    encoding: "utf8",
  });
}

test("検索語が見つからなければ終了コード0", () => {
  const repo = makeRepo({ "index.html": "<p>ぐみゅけ</p>" }, "yamada\n");
  assert.equal(run(repo).status, 0);
});

test("追跡中のファイルに検索語があれば終了コード1で、ファイル名を表示する（大文字小文字は区別しない）", () => {
  const repo = makeRepo({ "index.html": "<p>Yamada Taro</p>" }, "yamada\n");
  const result = run(repo);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /index\.html/);
});

test("未追跡（未addの新規ファイル）の検索語も検出する", () => {
  const repo = makeRepo({ "index.html": "ok" }, "yamada\n");
  fs.writeFileSync(path.join(repo.dir, "new.html"), "yamada");
  const result = run(repo);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /new\.html/);
});

test("コミットの著者メールに検索語があれば終了コード1", () => {
  const repo = makeRepo(
    { "index.html": "ok" },
    "yamada\n",
    { name: "Gmy-K", email: "yamada@example.com" }
  );
  const result = run(repo);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /git log/);
});

test("検索語ファイルがなければ終了コード2（チェックを素通りさせない）", () => {
  const repo = makeRepo({ "index.html": "ok" }, null);
  assert.equal(run(repo).status, 2);
});

test("空行と # で始まる行は検索語として扱わない", () => {
  const repo = makeRepo({ "index.html": "secret" }, "# secret\n\nzzz\n");
  assert.equal(run(repo).status, 0);
});

test("有効な検索語が1つもなければ終了コード2", () => {
  const repo = makeRepo({ "index.html": "ok" }, "# only a comment\n\n");
  assert.equal(run(repo).status, 2);
});

const hasExiftool = spawnSync("exiftool", ["-ver"]).status === 0;
const isRoot = typeof process.getuid === "function" && process.getuid() === 0;

test("バイナリファイルに埋め込まれた検索語も検出する", () => {
  const repo = makeRepo({ "index.html": "ok" }, "yamada\n");
  fs.mkdirSync(path.join(repo.dir, "assets"));
  fs.writeFileSync(
    path.join(repo.dir, "assets", "a.bin"),
    Buffer.concat([Buffer.from([0xff, 0xd8, 0x00, 0x00]), Buffer.from("Artist\0Yamada Taro\0")])
  );
  const result = run(repo);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /a\.bin/);
});

test("過去のコミットにだけ存在した検索語も検出する（公開リポジトリでは履歴も公開される）", () => {
  const repo = makeRepo({ "index.html": "ok", "old.txt": "yamada" }, "yamada\n");
  const env = { ...process.env, GIT_AUTHOR_NAME: "Gmy-K", GIT_AUTHOR_EMAIL: noreply.email, GIT_COMMITTER_NAME: "Gmy-K", GIT_COMMITTER_EMAIL: noreply.email };
  execFileSync("git", ["rm", "-q", "old.txt"], { cwd: repo.dir, env });
  execFileSync("git", ["commit", "-q", "-m", "remove"], { cwd: repo.dir, env });
  const result = run(repo);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /history/);
});

test("ファイル名・パスに検索語があれば終了コード1", () => {
  const repo = makeRepo({ "index.html": "ok" }, "yamada\n");
  fs.writeFileSync(path.join(repo.dir, "yamada-face.png"), "x");
  const result = run(repo);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /yamada-face\.png/);
});

test("読めないファイルがあれば、一致なしとせず終了コード2", { skip: isRoot }, () => {
  const repo = makeRepo({ "index.html": "ok" }, "yamada\n");
  const locked = path.join(repo.dir, "locked.txt");
  fs.writeFileSync(locked, "ok");
  fs.chmodSync(locked, 0o000);
  const result = run(repo);
  fs.chmodSync(locked, 0o644);
  assert.equal(result.status, 2);
});

test("assets の画像にGPS・作者などのEXIFが残っていれば終了コード1", { skip: !hasExiftool }, () => {
  const repo = makeRepo({ "index.html": "ok" }, "yamada\n");
  fs.mkdirSync(path.join(repo.dir, "assets"));
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "base64"
  );
  const image = path.join(repo.dir, "assets", "icon.png");
  fs.writeFileSync(image, png);
  execFileSync("exiftool", ["-q", "-overwrite_original", "-XMP-dc:Creator=someone", image]);
  const result = run(repo);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /icon\.png/);
});

test("EXIFのない画像は通る", { skip: !hasExiftool }, () => {
  const repo = makeRepo({ "index.html": "ok" }, "yamada\n");
  fs.mkdirSync(path.join(repo.dir, "assets"));
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "base64"
  );
  fs.writeFileSync(path.join(repo.dir, "assets", "icon.png"), png);
  assert.equal(run(repo).status, 0);
});
