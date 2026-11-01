const test = require("node:test");
const assert = require("node:assert/strict");
const lib = require("../lib.js");

const item = (over = {}) => ({
  category: "post",
  kind: "Note",
  title: "タイトル",
  summary: "説明",
  date: "2026-01-01",
  url: "https://example.com/",
  thumb: null,
  ...over,
});

const data = (over = {}) => ({
  profile: {
    name: "ぐみゅけ",
    tagline: "ひとこと",
    avatar: null,
    intro: ["自己紹介"],
    links: [{ label: "Note", url: "https://note.com/x", icon: "N" }],
  },
  items: [item()],
  ...over,
});

test("sortItems: 新しい順に並べ、入力は変更せず、同日は元の順を保つ", () => {
  const input = [
    item({ title: "old", date: "2026-01-01" }),
    item({ title: "new-a", date: "2026-03-01" }),
    item({ title: "new-b", date: "2026-03-01" }),
  ];
  const sorted = lib.sortItems(input);
  assert.deepEqual(sorted.map((i) => i.title), ["new-a", "new-b", "old"]);
  assert.deepEqual(input.map((i) => i.title), ["old", "new-a", "new-b"]);
});

test("filterItems: all は全件、post / dev はカテゴリで絞る、空配列でも動く", () => {
  const input = [item({ category: "post" }), item({ category: "dev" })];
  assert.equal(lib.filterItems(input, "all").length, 2);
  assert.equal(lib.filterItems(input, "post").length, 1);
  assert.equal(lib.filterItems(input, "dev")[0].category, "dev");
  assert.deepEqual(lib.filterItems([], "post"), []);
});

test("isLinkable: https のURLだけが true", () => {
  assert.equal(lib.isLinkable(item({ url: "https://example.com/" })), true);
  assert.equal(lib.isLinkable(item({ url: null })), false);
  assert.equal(lib.isLinkable(item({ url: "" })), false);
  assert.equal(lib.isLinkable(item({ url: "http://example.com/" })), false);
  assert.equal(lib.isLinkable(item({ url: "javascript:alert(1)" })), false);
});

test("collectUrls: プロフィールのリンクと項目のURLを重複なしで集め、null は除く", () => {
  const d = data({
    items: [
      item({ url: "https://example.com/a" }),
      item({ url: "https://example.com/a" }),
      item({ url: null }),
    ],
  });
  assert.deepEqual(lib.collectUrls(d), ["https://note.com/x", "https://example.com/a"]);
});

test("validateData: 正しいデータはエラーなし", () => {
  assert.deepEqual(lib.validateData(data()), []);
});

test("validateData: items が空配列でもエラーにしない", () => {
  assert.deepEqual(lib.validateData(data({ items: [] })), []);
});

test("validateData: 必須項目の欠落を検出する", () => {
  const errors = lib.validateData(data({ items: [item({ title: "" })] }));
  assert.ok(errors.some((e) => e.startsWith("items[0].title")));
});

test("validateData: 存在しない日付を検出する", () => {
  const errors = lib.validateData(data({ items: [item({ date: "2026-02-30" })] }));
  assert.ok(errors.some((e) => e.startsWith("items[0].date")));
  const errors2 = lib.validateData(data({ items: [item({ date: "2026/01/01" })] }));
  assert.ok(errors2.some((e) => e.startsWith("items[0].date")));
});

test("validateData: 不正なカテゴリを検出する（constructor 等の継承プロパティも弾く）", () => {
  const errors = lib.validateData(data({ items: [item({ category: "constructor" })] }));
  assert.ok(errors.some((e) => e.startsWith("items[0].category")));
});

test("validateData: javascript: と http:// のURLを弾く", () => {
  const e1 = lib.validateData(data({ items: [item({ url: "javascript:alert(1)" })] }));
  assert.ok(e1.some((e) => e.startsWith("items[0].url")));
  const e2 = lib.validateData(data({ items: [item({ url: "http://example.com/" })] }));
  assert.ok(e2.some((e) => e.startsWith("items[0].url")));
});

test("validateData: サムネイルは相対パスか null のみ（絶対パス・外部URLは弾く）", () => {
  const ok = lib.validateData(data({ items: [item({ thumb: "assets/a.png" })] }));
  assert.deepEqual(ok, []);
  const e1 = lib.validateData(data({ items: [item({ thumb: "/assets/a.png" })] }));
  assert.ok(e1.some((e) => e.startsWith("items[0].thumb")));
  const e2 = lib.validateData(data({ items: [item({ thumb: "https://example.com/a.png" })] }));
  assert.ok(e2.some((e) => e.startsWith("items[0].thumb")));
});

test("validateData: プロフィールの欠落と items が配列でない場合を検出する", () => {
  const e1 = lib.validateData({ items: [] });
  assert.ok(e1.some((e) => e.startsWith("profile")));
  const e2 = lib.validateData(data({ items: undefined }));
  assert.ok(e2.some((e) => e.startsWith("items")));
  const e3 = lib.validateData(
    data({ profile: { ...data().profile, intro: [] } })
  );
  assert.ok(e3.some((e) => e.startsWith("profile.intro")));
});
