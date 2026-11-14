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

test("data.js が GitHub へ張るリンクは、プロフィールとこのリポジトリだけ（古い公開リポジトリへ直接リンクしない）", () => {
  const urls = lib.collectUrls(loadData());
  const github = urls.filter((u) => new URL(u).hostname === "github.com");
  const allowed = (u) => u === "https://github.com/Gmy-K" || u.startsWith("https://github.com/Gmy-K/portfolio");
  assert.deepEqual(github.filter((u) => !allowed(u)), []);
});

test("プロフィールのリンクに GitHub（アイコン画像つき）がある", () => {
  const github = loadData().profile.links.find((l) => l.url === "https://github.com/Gmy-K");
  assert.ok(github, "GitHub のリンクがない");
  assert.ok(github.image, "GitHub の image が未設定");
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

test("4つのカードの日付が、実際の公開時期になっている（未来の日付はない）", () => {
  const items = loadData().items;
  const byUrl = (suffix) => items.find((i) => typeof i.url === "string" && i.url.endsWith(suffix));
  assert.equal(byUrl("how-it-works.html#vault").date, "2026-04-06");
  assert.equal(byUrl("tech.html#skills").date, "2026-06-10");
  assert.equal(byUrl("tech.html#kakeibo").date, "2026-09-22");
  assert.equal(byUrl("how-it-works.html#secretary").date, "2026-11-11");
  for (const i of items) assert.ok(i.date <= "2026-11-14", `${i.title}: 未来の日付 ${i.date}`);
});

test("実画面サムネイル（secretary・kakeibo）は PNG・400KB未満・EXIF/GPSなし", () => {
  const items = loadData().items;
  for (const suffix of ["how-it-works.html#secretary", "tech.html#kakeibo"]) {
    const item = items.find((i) => typeof i.url === "string" && i.url.endsWith(suffix));
    assert.match(item.thumb, /\.png$/, `${suffix}: png ではない`);
    const buf = fs.readFileSync(path.resolve(__dirname, "..", item.thumb));
    assert.ok(buf.length < 400 * 1024, `${item.thumb}: ${buf.length} bytes`);
    const bin = buf.toString("latin1");
    assert.ok(!bin.includes("Exif") && !bin.includes("GPS"), `${item.thumb}: メタデータあり`);
  }
});

test("トップの一言は「何ができる人か」を伝え、プログラミングは勉強中と書き、データ分析とは言わない", () => {
  const { profile } = loadData();
  assert.ok(profile.tagline.includes("小さな自動化"), "tagline に「小さな自動化」がない");
  assert.ok(profile.tagline.includes("プログラミングは勉強中"), "tagline に「プログラミングは勉強中」がない");
  assert.ok(!profile.tagline.includes("データ分析"), "tagline に「データ分析」が含まれている");
  assert.ok(profile.intro[0].includes("自認英国人系大学生"), "自己紹介の最初に人柄の一言が移っていない");
  assert.ok(profile.intro[0].includes("カーディフ大学"), "自己紹介の最初に留学の説明がない");
});

test("profile.skills は指定の4グループを、指定の順・内容で持つ", () => {
  const skills = JSON.parse(JSON.stringify(loadData().profile.skills));
  assert.deepEqual(skills, [
    { group: "プログラミング（勉強中）", items: [{ name: "Python", note: "主に統計。GCIで学んだ範囲" }, { name: "R" }] },
    { group: "やってみたい", items: [{ name: "JavaScript", note: "自分の手で書けるようになりたい" }, { name: "C#", note: "自分の手で書けるようになりたい" }, { name: "ほか（いろいろ）" }] },
    { group: "話せる・使える言語", items: [{ name: "日本語" }, { name: "英語" }, { name: "フランス語（少し）" }] },
    { group: "勉強中の言語", items: [{ name: "フランス語" }, { name: "韓国語" }] }
  ]);
});

test("JavaScript / C# は「やってみたい」だけにあり、勉強中・使えるグループには出ない", () => {
  const skills = loadData().profile.skills;
  const want = skills.find((g) => g.group === "やってみたい");
  const names = want.items.map((i) => i.name);
  assert.ok(names.includes("JavaScript") && names.includes("C#"));
  for (const g of skills.filter((g) => g.group.includes("勉強中") || g.group.includes("使える"))) {
    for (const i of g.items) assert.ok(!/JavaScript|C#/.test(i.name), `${g.group} に ${i.name}`);
  }
});
