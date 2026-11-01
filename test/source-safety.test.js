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

test("index.html の「リンク集」は「活動」に改名されている", () => {
  const html = read("index.html");
  assert.ok(!html.includes("リンク集"), "リンク集 が残っている");
  const nav = html.match(/<nav[\s\S]*?<\/nav>/)[0];
  assert.ok(nav.includes(">活動<"), "ナビに「活動」がない");
  assert.ok(html.includes('id="activities-title" class="section-title">活動<'), "見出しが「活動」でない");
});

test("ヒーロー（#top）は全画面の高さで、SNSアイコンの入れ物（#sns-rail）を内部にもつ", () => {
  const html = read("index.html");
  const hero = html.match(/<header id="top" class="hero"[\s\S]*?<\/header>/);
  assert.ok(hero, '<header id="top" class="hero"> がない');
  assert.ok(hero[0].includes('id="sns-rail"'), "ヒーロー内に #sns-rail がない");
  assert.equal(html.split('id="sns-rail"').length - 1, 1, "#sns-rail が複数ある");
  assert.ok(read("style.css").includes("100svh"), "ヒーローの高さ（100svh）の指定がない");
});

test("style.css が参照する画像ファイルはすべて実在する", () => {
  const css = read("style.css");
  const refs = [...css.matchAll(/url\(["']?([^)"']+)["']?\)/g)].map((m) => m[1]).filter((u) => !u.startsWith("data:"));
  assert.ok(refs.some((u) => u.endsWith("assets/hero.jpg")), "ヒーロー背景（assets/hero.jpg）を参照していない");
  for (const u of refs) assert.ok(fs.existsSync(path.resolve(__dirname, "..", u)), `${u} が存在しない`);
});

test("メニュー表示中は、ヒーローも inert にして背面へフォーカスを逃がさない", () => {
  const source = read("script.js");
  assert.ok(/heroArea\.inert\s*=\s*open/.test(source), "heroArea.inert = open がない");
});

test("フッターに、ページ名・ページマップ・リンク・著作権表示がある", () => {
  const html = read("index.html");
  const footer = html.match(/<footer class="footer"[\s\S]*?<\/footer>/);
  assert.ok(footer, "フッターがない");
  const f = footer[0];
  assert.ok(f.includes("ぐみゅけ | ポートフォリオ"), "ページ名がない");
  const sitemap = f.match(/<nav[^>]*aria-label="ページマップ"[\s\S]*?<\/nav>/);
  assert.ok(sitemap, "ページマップ（nav）がない");
  for (const id of ["top", "about", "activities", "works"]) {
    assert.ok(sitemap[0].includes(`href="#${id}"`), `ページマップに #${id} がない`);
  }
  assert.ok(f.includes('id="footer-links"'), "リンク一覧（#footer-links）がない");
  assert.ok(f.includes("© 2026 Gmy_K"), "著作権表示「© 2026 Gmy_K」がない");
});

test("メニュー表示中は、フッターも inert にする", () => {
  assert.ok(/footerArea\.inert\s*=\s*open/.test(read("script.js")), "footerArea.inert = open がない");
});
