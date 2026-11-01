const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const lib = require("../lib.js");

function loadData() {
  const source = fs.readFileSync(path.resolve(__dirname, "../data.js"), "utf8");
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox);
  return sandbox.window.PORTFOLIO;
}

test("data.js は validateData を通る", () => {
  assert.deepEqual(lib.validateData(loadData()), []);
});

test("data.js のプロフィール名は「ぐみゅけ」", () => {
  assert.equal(loadData().profile.name, "ぐみゅけ");
});

test("活動リストに Note・Vlog・開発・Meicom があり、Meicom はリンクなし", () => {
  const activities = loadData().profile.activities;
  const names = activities.map((a) => a.name);
  assert.ok(names.some((n) => n.includes("Note")));
  assert.ok(names.some((n) => n.includes("Vlog")));
  assert.ok(names.some((n) => n.includes("開発")));
  const meicom = activities.find((a) => a.name.includes("Meicom"));
  assert.ok(meicom, "Meicom の項目がない");
  assert.equal(meicom.url, null);
});

test("data.js は GitHub の他リポジトリ（実名が辿れるアカウント）へリンクしない", () => {
  const urls = lib.collectUrls(loadData());
  const github = urls.filter((u) => new URL(u).hostname === "github.com");
  assert.deepEqual(github.filter((u) => !u.startsWith("https://github.com/Gmy-K/portfolio")), []);
});

test("data.js に Note #1 と #2 の記事が載っている", () => {
  const urls = lib.collectUrls(loadData());
  assert.ok(urls.includes("https://note.com/gmk_in_uk/n/n78f4d130b313"));
  assert.ok(urls.includes("https://note.com/gmk_in_uk/n/nc9eab7a3b4ba"));
});

test("data.js のプロフィールに Note と Instagram のリンクがある", () => {
  const links = loadData().profile.links;
  assert.ok(links.some((l) => l.url === "https://note.com/gmk_in_uk"));
  assert.ok(links.some((l) => l.url === "https://www.instagram.com/gmy_k_in_uk/"));
});

test("data.js が参照する画像（avatar・リンクのimage・thumb）はすべて実在する", () => {
  const d = loadData();
  const files = [d.profile.avatar, ...d.profile.links.map((l) => l.image), ...d.items.map((i) => i.thumb)].filter(Boolean);
  for (const f of files) assert.ok(fs.existsSync(path.resolve(__dirname, "..", f)), `${f} が存在しない`);
});

test("アイコン・SNSアイコン・Note記事の画像が設定されている", () => {
  const d = loadData();
  assert.ok(d.profile.avatar, "avatar が未設定");
  for (const link of d.profile.links) assert.ok(link.image, `${link.label} の image が未設定`);
  for (const item of d.items.filter((i) => i.kind === "Note")) assert.ok(item.thumb, `${item.title} の thumb が未設定`);
});

test("京都ガイドのカードは、地名・年・団体名を出さずにぼかした表現にする", () => {
  const guide = loadData().items.find((i) => i.kind === "Guide");
  assert.ok(guide, "Guide の項目がない");
  const text = guide.title + guide.summary;
  for (const word of ["京都", "2026", "Meicom", "試験公開"]) assert.ok(!text.includes(word), `「${word}」が含まれている`);
});

test("すべての項目にサムネイルがある（記事は見出し画像、開発物は簡易アイコン）", () => {
  for (const item of loadData().items) assert.ok(item.thumb, `${item.title} の thumb が未設定`);
});

test("Meicom の説明は、何をしているサークルかをおおまかに書く", () => {
  const meicom = loadData().profile.activities.find((a) => a.name.includes("Meicom"));
  assert.ok(meicom.summary.includes("英語"), "英語を使った活動であることが書かれていない");
  assert.ok(meicom.summary.length >= 15, "説明が短すぎる");
});
