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
    activities: [{ name: "Note", summary: "記録", url: "https://note.com/x" }],
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

test("validateData: 活動リスト（profile.activities）が配列でなければエラー", () => {
  const profile = { ...data().profile };
  delete profile.activities;
  const errors = lib.validateData(data({ profile }));
  assert.ok(errors.some((e) => e.startsWith("profile.activities")));
});

test("validateData: 活動の名前・一言が空、URLが https でなければエラー（url は null 可）", () => {
  const withActivities = (activities) => data({ profile: { ...data().profile, activities } });
  assert.deepEqual(lib.validateData(withActivities([{ name: "Meicom", summary: "所属", url: null }])), []);
  assert.deepEqual(lib.validateData(withActivities([])), []);
  const e1 = lib.validateData(withActivities([{ name: "", summary: "s", url: null }]));
  assert.ok(e1.some((e) => e.startsWith("profile.activities[0].name")));
  const e2 = lib.validateData(withActivities([{ name: "n", summary: "", url: null }]));
  assert.ok(e2.some((e) => e.startsWith("profile.activities[0].summary")));
  const e3 = lib.validateData(withActivities([{ name: "n", summary: "s", url: "javascript:alert(1)" }]));
  assert.ok(e3.some((e) => e.startsWith("profile.activities[0].url")));
});

test("collectUrls: 活動リストのURLも集める（重複なし・null は除く）", () => {
  const d = data({
    profile: {
      ...data().profile,
      activities: [
        { name: "a", summary: "s", url: "https://example.com/act" },
        { name: "b", summary: "s", url: "https://note.com/x" },
        { name: "c", summary: "s", url: null },
      ],
    },
    items: [],
  });
  assert.deepEqual(lib.collectUrls(d), ["https://note.com/x", "https://example.com/act"]);
});

test("validateData: リンクの image は null・未指定・相対パスのみ", () => {
  const withLink = (link) =>
    data({ profile: { ...data().profile, links: [{ label: "Note", url: "https://note.com/x", icon: "N", ...link }] } });
  assert.deepEqual(lib.validateData(withLink({ image: "assets/icons/note.png" })), []);
  assert.deepEqual(lib.validateData(withLink({ image: null })), []);
  assert.deepEqual(lib.validateData(withLink({})), []);
  for (const bad of ["/assets/x.png", "https://example.com/x.png", "\\\\host/x.png", ""]) {
    const errors = lib.validateData(withLink({ image: bad }));
    assert.ok(errors.some((e) => e.startsWith("profile.links[0].image")), `${JSON.stringify(bad)} を弾けていない`);
  }
});

test("validateData: avatar と thumb は相対パスのみ（外部URL・絶対パス・バックスラッシュを弾く）", () => {
  assert.deepEqual(lib.validateData(data({ profile: { ...data().profile, avatar: "assets/avatar.jpg" } })), []);
  for (const bad of ["/a.jpg", "https://example.com/a.jpg", "\\\\host/a.jpg", "javascript:alert(1)"]) {
    const e1 = lib.validateData(data({ profile: { ...data().profile, avatar: bad } }));
    assert.ok(e1.some((e) => e.startsWith("profile.avatar")), `avatar ${JSON.stringify(bad)} を弾けていない`);
    const e2 = lib.validateData(data({ items: [item({ thumb: bad })] }));
    assert.ok(e2.some((e) => e.startsWith("items[0].thumb")), `thumb ${JSON.stringify(bad)} を弾けていない`);
  }
});

test("collectUrls: 項目の extraLinks のURLも集める", () => {
  const d = data({
    items: [
      item({
        url: "https://example.com/a",
        extraLinks: [
          { label: "ニコニコ", url: "https://example.com/b" },
          { label: "重複", url: "https://example.com/a" },
        ],
      }),
    ],
  });
  assert.deepEqual(lib.collectUrls(d), ["https://note.com/x", "https://example.com/a", "https://example.com/b"]);
});

test("validateData: extraLinks は省略できる", () => {
  assert.deepEqual(lib.validateData(data({ items: [item({ extraLinks: undefined })] })), []);
});

test("validateData: extraLinks が正しければエラーなし", () => {
  const d = data({ items: [item({ extraLinks: [{ label: "ニコニコ", url: "https://example.com/b" }] })] });
  assert.deepEqual(lib.validateData(d), []);
});

test("validateData: extraLinks が配列でない・labelが空・URLがhttpsでない場合はエラー", () => {
  assert.ok(lib.validateData(data({ items: [item({ extraLinks: "x" })] })).length > 0);
  assert.ok(lib.validateData(data({ items: [item({ extraLinks: [{ label: "", url: "https://example.com/b" }] })] })).length > 0);
  assert.ok(lib.validateData(data({ items: [item({ extraLinks: [{ label: "x", url: "http://example.com/b" }] })] })).length > 0);
  assert.ok(lib.validateData(data({ items: [item({ extraLinks: [null] })] })).length > 0);
});
