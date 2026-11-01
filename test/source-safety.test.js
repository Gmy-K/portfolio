const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const read = (name) => fs.readFileSync(path.resolve(__dirname, "..", name), "utf8");

test("script.js は文字列をHTMLとして解釈するAPIを使わない", () => {
  const source = read("script.js");
  for (const banned of ["innerHTML", "outerHTML", "insertAdjacentHTML", "document.write", "eval("]) {
    assert.ok(!source.includes(banned), `script.js に ${banned} が含まれている`);
  }
});

test("index.html は data.js → lib.js → script.js の順で読み込む", () => {
  const html = read("index.html");
  const order = ["data.js", "lib.js", "script.js"].map((name) => html.indexOf(`<script src="${name}"></script>`));
  assert.ok(order.every((i) => i >= 0), "3つのscriptタグが揃っていない");
  assert.ok(order[0] < order[1] && order[1] < order[2], "読み込み順が違う");
});

test("index.html は外部リソースを Google Fonts 以外から読み込まない", () => {
  const html = read("index.html");
  const hosts = [...html.matchAll(/(?:src|href)="(https?:\/\/[^"/]+)/g)].map((m) => m[1]);
  const allowed = new Set(["https://fonts.googleapis.com", "https://fonts.gstatic.com"]);
  for (const host of hosts) assert.ok(allowed.has(host), `許可されていない外部ホスト: ${host}`);
});

test("index.html のナビのリンク先は、すべてページ内に存在するIDを指す", () => {
  const html = read("index.html");
  const nav = html.match(/<nav[\s\S]*?<\/nav>/)[0];
  const targets = [...nav.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
  assert.ok(targets.length >= 4, "ナビのリンクが少なすぎる");
  for (const id of targets) assert.ok(html.includes(`id="${id}"`), `#${id} がページにない`);
});

test("index.html は トップ・自己紹介・リンク集・ポートフォリオ の4つで、連絡先セクションはない", () => {
  const html = read("index.html");
  for (const id of ["top", "about", "activities", "works"]) {
    assert.ok(html.includes(`id="${id}"`), `id="${id}" がない`);
  }
  assert.ok(!html.includes('id="contact"'), "連絡先セクションが残っている");
});
