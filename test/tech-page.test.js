const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const PAGE = "tech.html";
const THUMBS = ["assets/thumbs/skills.svg", "assets/thumbs/kakeibo.svg"];
const BASE = "https://gmy-k.github.io/portfolio/tech.html";

function loadData() {
  const sandbox = { window: {} };
  vm.runInNewContext(read("data.js"), sandbox);
  return sandbox.window.PORTFOLIO;
}
const techItems = () => loadData().items.filter((i) => typeof i.url === "string" && i.url.includes(PAGE));

test("tech.html が存在し、基本の要素を備える", () => {
  assert.ok(fs.existsSync(path.join(root, PAGE)), "ファイルがない");
  const html = read(PAGE);
  assert.ok(html.includes('<html lang="ja">'));
  assert.ok(html.includes("<title>開発物の仕組み（スキル・音声・家計簿）｜ぐみゅけ</title>"));
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1);
  assert.match(html, /<h1[^>]*>開発物の仕組み<\/h1>/);
  assert.ok(html.includes('class="skip"'));
  assert.ok(html.includes("<main"));
});

test("id と h2 の id がある", () => {
  const html = read(PAGE);
  for (const id of ["skills", "voicevox", "kakeibo", "skills-title", "voicevox-title", "kakeibo-title"]) {
    assert.ok(html.includes(`id="${id}"`), `id="${id}" がない`);
  }
});

test("外部ホストは Google Fonts だけで、GoatCounter は index.html と同じ script タグ", () => {
  const html = read(PAGE);
  const hosts = [...html.matchAll(/(?:src|href)="(https?:\/\/[^"/]+)/g)].map((m) => m[1]);
  const allowed = new Set(["https://fonts.googleapis.com", "https://fonts.gstatic.com"]);
  for (const host of hosts) assert.ok(allowed.has(host), `許可されていない外部ホスト: ${host}`);
  const tag = '<script data-goatcounter="https://gmyk.goatcounter.com/count" async src="assets/count.js"></script>';
  assert.ok(read("index.html").includes(tag));
  assert.ok(html.includes(tag));
});

test("インライン script 本文と HTML 解釈 API を使わない", () => {
  const html = read(PAGE);
  for (const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) assert.equal(m[1].trim(), "");
  for (const banned of ["innerHTML", "outerHTML", "insertAdjacentHTML", "document.write", "eval("]) {
    assert.ok(!html.includes(banned), `${banned} が含まれている`);
  }
});

test("ページ内リンク (#id) はすべて解決し、index.html へ戻れる", () => {
  const html = read(PAGE);
  const targets = [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
  assert.ok(targets.length >= 3);
  for (const id of targets) assert.ok(html.includes(`id="${id}"`), `#${id} がない`);
  assert.ok(html.includes('href="index.html#works"'));
});

test("data.js: 3項目が tech.html の各アンカーを指す", () => {
  const items = techItems();
  assert.equal(items.length, 3);
  assert.deepEqual([...items.map((i) => i.url).sort()], [`${BASE}#kakeibo`, `${BASE}#skills`, `${BASE}#voicevox`]);
  for (const i of items) {
    assert.equal(i.category, "dev");
    if (i.url.endsWith("#voicevox")) {
      assert.equal(i.title, "VOICEVOX調声スキル");
    } else {
      assert.equal(i.date, "2026-11-14");
    }
  }
  const thumbs = items.filter((i) => !i.url.endsWith("#voicevox")).map((i) => i.thumb).sort();
  assert.deepEqual([...thumbs], [...THUMBS].sort());
});

test("出してはいけない語が、ページ・3項目・SVG に含まれない", () => {
  const banned = ["BS1551", "BS2518", "BS1515", "CE5579", "Webhook", "webhook", "My-Obsidian-Vault", "/Users/",
    "claude.ai/artifact", "@gmail", "Meiji", "明治", "カーディフ", "Cardiff", "Wise", "Starling", "Part-Catered",
    "£", "Intelligence Fortress", "study-abroad-budget", "dotfiles"];
  const texts = { [PAGE]: read(PAGE), "tech items": JSON.stringify(techItems()) };
  for (const t of THUMBS) texts[t] = read(t);
  for (const [name, text] of Object.entries(texts)) {
    for (const word of banned) assert.ok(!text.includes(word), `${name} に ${word} が含まれている`);
  }
});

test("img には alt がある", () => {
  for (const m of read(PAGE).matchAll(/<img\b[^>]*>/g)) assert.ok(/\balt="/.test(m[0]));
});

test("SVG サムネイルは妥当で、script と外部参照を含まない", () => {
  for (const t of THUMBS) {
    const svg = read(t);
    assert.ok(svg.trimStart().startsWith("<svg"));
    assert.ok(/viewBox="0 0 1280 670"/.test(svg));
    assert.ok(/role="img"/.test(svg) && /aria-label="[^"]+"/.test(svg));
    assert.ok(!/<script/i.test(svg));
    assert.ok(!/(?:href|src)=["']https?:/i.test(svg.replace(/xmlns="[^"]*"/g, "")));
  }
});
