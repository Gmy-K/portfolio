const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const PAGE = "how-it-works.html";
const THUMBS = ["assets/thumbs/secretary.svg", "assets/thumbs/vault.svg"];

function loadData() {
  const sandbox = { window: {} };
  vm.runInNewContext(read("data.js"), sandbox);
  return sandbox.window.PORTFOLIO;
}

const newItems = () => loadData().items.filter((i) => typeof i.url === "string" && i.url.includes(PAGE));

test("how-it-works.html が存在し、基本の要素を備える", () => {
  assert.ok(fs.existsSync(path.join(root, PAGE)), "ファイルがない");
  const html = read(PAGE);
  assert.ok(html.includes('<html lang="ja">'));
  assert.match(html, /<title>[^<]+<\/title>/);
  assert.match(html, /<meta name="description" content="[^"]+"/);
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, "h1 は1つだけ");
  assert.ok(html.includes('class="skip"'), "スキップリンクがない");
  assert.ok(html.includes("<main"), "main がない");
});

test("外部ホストは Google Fonts だけで、GoatCounter は index.html と同じ script タグ", () => {
  const html = read(PAGE);
  const hosts = [...html.matchAll(/(?:src|href)="(https?:\/\/[^"/]+)/g)].map((m) => m[1]);
  const allowed = new Set(["https://fonts.googleapis.com", "https://fonts.gstatic.com"]);
  for (const host of hosts) assert.ok(allowed.has(host), `許可されていない外部ホスト: ${host}`);
  const tag = '<script data-goatcounter="https://gmyk.goatcounter.com/count" async src="assets/count.js"></script>';
  assert.ok(read("index.html").includes(tag));
  assert.ok(html.includes(tag), "GoatCounter の script タグがない");
});

test("インライン script 本文と HTML 解釈 API を使わない", () => {
  const html = read(PAGE);
  for (const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) {
    assert.equal(m[1].trim(), "", "インライン script がある");
  }
  for (const banned of ["innerHTML", "outerHTML", "insertAdjacentHTML", "document.write", "eval("]) {
    assert.ok(!html.includes(banned), `${banned} が含まれている`);
  }
});

test("ページ内リンク (#id) はすべてページ内の id に解決する", () => {
  const html = read(PAGE);
  const targets = [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
  assert.ok(targets.length >= 3);
  for (const id of targets) assert.ok(html.includes(`id="${id}"`), `#${id} がない`);
});

test("id secretary と vault がある", () => {
  const html = read(PAGE);
  for (const id of ["secretary", "vault"]) assert.ok(html.includes(`id="${id}"`), `id="${id}" がない`);
});

test("index.html へ戻るリンクがある", () => {
  assert.ok(read(PAGE).includes('href="index.html#works"'));
});

test("data.js の新しい2項目は、このページの #secretary / #vault を指す", () => {
  const items = newItems();
  assert.equal(items.length, 2);
  const urls = [...items.map((i) => i.url)].sort();
  assert.deepEqual([...urls], [
    "https://gmy-k.github.io/portfolio/how-it-works.html#secretary",
    "https://gmy-k.github.io/portfolio/how-it-works.html#vault"
  ]);
  for (const i of items) {
    assert.equal(i.category, "dev");
    assert.equal(i.date, "2026-11-14");
  }
  assert.deepEqual([...items.map((i) => i.thumb)].sort(), [...THUMBS].sort());
});

test("新しいページ・項目・サムネイルに、出してはいけない語が含まれない", () => {
  const banned = ["BS1551", "BS2518", "BS1515", "CE5579", "Webhook", "webhook", "My-Obsidian-Vault", "/Users/",
    "claude.ai/artifact", "@gmail", "Meiji", "明治", "カーディフ", "Cardiff"];
  const texts = { [PAGE]: read(PAGE), "new data items": JSON.stringify(newItems()) };
  for (const t of THUMBS) texts[t] = read(t);
  for (const [name, text] of Object.entries(texts)) {
    for (const word of banned) assert.ok(!text.includes(word), `${name} に ${word} が含まれている`);
  }
});

test("img には alt がある", () => {
  for (const m of read(PAGE).matchAll(/<img\b[^>]*>/g)) assert.ok(/\balt="/.test(m[0]), `alt なし: ${m[0]}`);
});

test("SVG サムネイルは妥当で、script と外部参照を含まない", () => {
  for (const t of THUMBS) {
    const svg = read(t);
    assert.ok(svg.trimStart().startsWith("<svg"), `${t}: <svg で始まらない`);
    assert.ok(/viewBox="0 0 1280 670"/.test(svg), `${t}: viewBox`);
    assert.ok(/role="img"/.test(svg) && /aria-label="[^"]+"/.test(svg), `${t}: role/aria-label`);
    assert.ok(!/<script/i.test(svg), `${t}: script`);
    assert.ok(!/(?:href|src)=["']https?:/i.test(svg.replace(/xmlns="[^"]*"/g, "")), `${t}: 外部参照`);
  }
});

test("タイトルは PKM（個人の知識管理）の関連だと分かる言葉にする", () => {
  const html = fs.readFileSync(path.resolve(__dirname, "../how-it-works.html"), "utf8");
  const source = fs.readFileSync(path.resolve(__dirname, "../data.js"), "utf8");
  const sandbox = { window: {} };
  require("node:vm").runInNewContext(source, sandbox);
  const cards = sandbox.window.PORTFOLIO.items.filter((i) => /how-it-works\.html#/.test(i.url || ""));
  assert.equal(cards.length, 2);
  for (const c of cards) {
    assert.ok(c.title.includes("PKM"), `カードの題に PKM がない: ${c.title}`);
    assert.ok(c.summary.includes("個人の知識管理"), `カードの要約に「個人の知識管理」がない: ${c.title}`);
  }
  assert.ok(/<title>[^<]*PKM[^<]*<\/title>/.test(html), "<title> に PKM がない");
  assert.ok(/<h1[^>]*>[^<]*PKM[^<]*<\/h1>/.test(html), "h1 に PKM がない");
  assert.ok(html.includes("パーソナル・ナレッジ・マネジメント"), "PKM の言葉の説明がない");
  for (const id of ["secretary-title", "vault-title"]) {
    const h2 = html.match(new RegExp(`<h2 id="${id}"[^>]*>([^<]*)</h2>`));
    assert.ok(h2 && h2[1].includes("PKM"), `#${id} の見出しに PKM がない`);
  }
});
