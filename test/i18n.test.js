// 多言語版（en / fr / ko）の検証。言語ごとにテストを複製せず、LANGS で回す。
//
// PENDING: まだ作っていない言語。ファイルの存在・パリティの検査は飛ばすが、
// 言語スイッチャーは最初から全4言語（未作成の言語のファイル名を含む）へのリンクを持つ。
// 新しい言語を足し終えたら、その言語を PENDING から外す。
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const lib = require("../lib.js");

const root = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");

const ALL = ["ja", "en", "fr", "ko"];
const LANGS = ["en", "fr", "ko"];
const PENDING = ["fr", "ko"];
const READY = LANGS.filter((l) => !PENDING.includes(l));
const BASES = ["index", "how-it-works", "tech"];
const LABELS = { ja: "日本語", en: "English", fr: "Français", ko: "한국어" };
const SITE = "https://gmy-k.github.io/portfolio/";

const pageName = (base, lang) => (lang === "ja" ? `${base}.html` : `${base}.${lang}.html`);
const dataName = (lang) => (lang === "ja" ? "data.js" : `data.${lang}.js`);

function loadData(lang) {
  const sandbox = { window: {} };
  vm.runInNewContext(read(dataName(lang)), sandbox);
  return JSON.parse(JSON.stringify(sandbox.window.PORTFOLIO));
}

const existingPages = () => {
  const list = [];
  for (const lang of ["ja", ...READY]) for (const base of BASES) list.push({ lang, base, file: pageName(base, lang) });
  return list;
};

const SWITCH_RE = /<nav class="lang-switch"[\s\S]*?<\/nav>/g;
const withoutSwitchers = (html) => html.replace(SWITCH_RE, "");
const CJK = /[　-ヿ㐀-鿿＀-￯]/g;

// 日本語の取り残し検査の許可リスト。
//  - 名前「ぐみゅけ」（全言語で原文のまま）
//  - 言語スイッチャーのラベル（日本語・한국어）は検査前に取り除く
//  - data.<lang>.js の Note / Reel の題名は、日本語の記事・動画の正式な題名なので原文のまま
const ALLOWED_JA = ["ぐみゅけ"];
function japaneseLeftovers(text) {
  let rest = text;
  for (const word of ALLOWED_JA) rest = rest.split(word).join("");
  return rest.match(CJK) || [];
}

const BANNED = ["BS1551", "BS2518", "BS1515", "CE5579", "Webhook", "webhook", "My-Obsidian-Vault", "/Users/",
  "claude.ai/artifact", "@gmail", "Meiji", "明治", "カーディフ", "Cardiff", "Wise", "Starling", "Part-Catered",
  "£", "Intelligence Fortress", "Fortress", "study-abroad-budget", "dotfiles"];

test("lib の言語設定: LANGS と PENDING の整合", () => {
  for (const l of PENDING) assert.ok(LANGS.includes(l));
});

// ---- 全ページ共通: 日本語版を含む、存在する全ページ ----
for (const { lang, base, file } of existingPages()) {
  test(`${file}: html lang・title・description・h1・skip・main`, () => {
    const html = read(file);
    assert.ok(html.includes(`<html lang="${lang}">`), "<html lang> が違う");
    assert.match(html, /<title>[^<]+<\/title>/);
    assert.match(html, /<meta name="description" content="[^"]+"/);
    assert.match(html, /<meta property="og:title" content="[^"]+"/);
    assert.match(html, /<meta property="og:description" content="[^"]+"/);
    assert.ok(html.includes('class="skip"') && html.includes("<main"));
    if (base !== "index") assert.equal((html.match(/<h1[\s>]/g) || []).length, 1);
    if (lang !== "ja") {
      const ja = read(pageName(base, "ja"));
      const t = (h) => h.match(/<title>([^<]+)<\/title>/)[1];
      assert.notEqual(t(html), t(ja), "title が日本語版と同じ");
    }
  });

  test(`${file}: 言語スイッチャー（4言語・hreflang/lang・aria-current は1つ）`, () => {
    const html = read(file);
    const switchers = html.match(SWITCH_RE) || [];
    assert.ok(switchers.length >= 2, "スイッチャーは2か所以上（上部とフッター）");
    assert.match(switchers[0], /^<nav class="lang-switch" aria-label="Language">/);
    for (const sw of switchers) {
      const links = [...sw.matchAll(/<a\b[^>]*>[^<]*<\/a>/g)].map((m) => m[0]);
      assert.equal(links.length, 4);
      ALL.forEach((l, i) => {
        const a = links[i];
        assert.ok(a.includes(`href="${pageName(base, l)}"`), `${l} の href: ${a}`);
        assert.ok(a.includes(`hreflang="${l}"`) && a.includes(`lang="${l}"`), `${l} の hreflang/lang: ${a}`);
        assert.ok(a.endsWith(`>${LABELS[l]}</a>`), `${l} のラベル: ${a}`);
        assert.equal(a.includes('aria-current="page"'), l === lang, `${l} の aria-current`);
      });
      assert.equal((sw.match(/aria-current=/g) || []).length, 1);
    }
  });

  test(`${file}: hreflang の alternate が4言語＋x-default（絶対URL）にある`, () => {
    const html = read(file);
    for (const l of ALL) {
      const tag = `<link rel="alternate" hreflang="${l}" href="${SITE}${pageName(base, l)}">`;
      assert.ok(html.includes(tag), `${tag} がない`);
    }
    assert.ok(html.includes(`<link rel="alternate" hreflang="x-default" href="${SITE}${pageName(base, "ja")}">`));
  });

  test(`${file}: インライン script・HTML解釈API・外部ホスト・GoatCounter・alt・ページ内リンク`, () => {
    const html = read(file);
    for (const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) assert.equal(m[1].trim(), "");
    for (const banned of ["innerHTML", "outerHTML", "insertAdjacentHTML", "document.write", "eval("]) {
      assert.ok(!html.includes(banned), banned);
    }
    const hosts = [...html.matchAll(/(?:src|href)="(https?:\/\/[^"/]+)/g)].map((m) => m[1]);
    const allowed = new Set(["https://fonts.googleapis.com", "https://fonts.gstatic.com", "https://gmy-k.github.io"]);
    for (const host of hosts) assert.ok(allowed.has(host), `許可されていない外部ホスト: ${host}`);
    assert.ok(html.includes('<script data-goatcounter="https://gmyk.goatcounter.com/count" async src="assets/count.js"></script>'));
    for (const m of html.matchAll(/<img\b[^>]*>/g)) assert.ok(/\balt="/.test(m[0]));
    for (const m of html.matchAll(/href="#([^"]+)"/g)) assert.ok(html.includes(`id="${m[1]}"`), `#${m[1]} がない`);
    assert.ok(html.includes('rel="stylesheet" href="style.css"'));
  });
}

// ---- 日本語版以外（作成済みの言語） ----
for (const lang of READY) {
  const file = (base) => pageName(base, lang);

  test(`[${lang}] index が data.${lang}.js → lib.js → script.js の順で読み込む`, () => {
    const html = read(file("index"));
    const order = [dataName(lang), "lib.js", "script.js"].map((n) => html.indexOf(`<script src="${n}"></script>`));
    assert.ok(order.every((i) => i >= 0));
    assert.ok(order[0] < order[1] && order[1] < order[2]);
    assert.ok(!html.includes('<script src="data.js">'));
  });

  test(`[${lang}] id が日本語版と同一（構造も一致）`, () => {
    for (const base of BASES) {
      const mine = withoutSwitchers(read(file(base)));
      const ja = withoutSwitchers(read(pageName(base, "ja")));
      const ids = (h) => [...h.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]).sort();
      assert.deepEqual(ids(mine), ids(ja), `${base}: id の集合が違う`);
      const count = (h, re) => (h.match(re) || []).length;
      for (const tag of ["h2", "h3", "li", "tr", "table", "ol", "ul", "section", "nav", "button", "a"]) {
        const re = new RegExp(`<${tag}[\\s>]`, "g");
        const strip = (h) => h.replace(/<p class="translation-note"[\s\S]*?<\/p>/g, "");
        assert.equal(count(strip(mine), re), count(ja, re), `${base}: <${tag}> の数が日本語版と違う`);
      }
    }
  });

  test(`[${lang}] 翻訳の注記（AI の助けを借りた旨）が各ページにある`, () => {
    for (const base of BASES) assert.match(read(file(base)), /<p class="translation-note"><small>[^<]+<\/small><\/p>/);
  });

  test(`[${lang}] 日本語の取り残しがない（許可: ぐみゅけ）`, () => {
    for (const base of BASES) {
      const html = withoutSwitchers(read(file(base)));
      assert.deepEqual(japaneseLeftovers(html), [], `${file(base)} に日本語が残っている`);
      if (lang !== "ko") assert.deepEqual(html.match(/[가-힯]/g) || [], [], `${file(base)} にハングルが残っている`);
    }
  });

  test(`[${lang}] data.${lang}.js: 検証を通り、ui を持ち、日本語の取り残しは Note/Reel の題名だけ`, () => {
    const d = loadData(lang);
    const ja = loadData("ja");
    assert.deepEqual(lib.validateData(d), []);
    assert.ok(d.ui && d.ui.siteTitle && d.ui.dataError && d.ui.categories && d.ui.categories.post && d.ui.categories.dev);
    const keep = ja.items.filter((i) => i.kind === "Note" || i.kind === "Reel").map((i) => i.title);
    let text = read(dataName(lang));
    for (const t of keep) text = text.split(t).join("");
    assert.deepEqual(japaneseLeftovers(text), []);
    if (lang !== "ko") assert.deepEqual(text.match(/[가-힯]/g) || [], []);
    assert.ok(read(dataName(lang)).startsWith("window.PORTFOLIO = {"));
  });

  test(`[${lang}] data.${lang}.js は data.js と同じ形（件数・順序・category/kind/date/thumb・url・skills・links）`, () => {
    const d = loadData(lang);
    const ja = loadData("ja");
    assert.equal(d.profile.name, "ぐみゅけ");
    assert.equal(d.items.length, ja.items.length);
    const internal = new RegExp(`^${SITE.replace(/[.]/g, "\\.")}(how-it-works|tech)\\.html#`);
    const mapUrl = (u) => (typeof u === "string" ? u.replace(/^(.*\/(?:how-it-works|tech))\.html#/, `$1.${lang}.html#`) : u);
    ja.items.forEach((j, i) => {
      const t = d.items[i];
      for (const k of ["category", "kind", "date", "thumb"]) assert.equal(t[k], j[k], `items[${i}].${k}`);
      const expectUrl = internal.test(j.url || "") ? mapUrl(j.url) : j.url;
      assert.equal(t.url, expectUrl, `items[${i}].url`);
      assert.deepEqual((t.extraLinks || []).map((l) => l.url), (j.extraLinks || []).map((l) => l.url));
      if (j.kind === "Note" || j.kind === "Reel") assert.equal(t.title, j.title, "Note/Reel の題名は原文のまま");
      else assert.notEqual(t.title, j.title);
      assert.notEqual(t.summary, j.summary);
    });
    assert.equal(d.profile.skills.length, ja.profile.skills.length);
    ja.profile.skills.forEach((g, i) => {
      assert.equal(d.profile.skills[i].items.length, g.items.length, `skills[${i}] の項目数`);
      assert.equal(d.profile.skills[i].wish === true, g.wish === true, `skills[${i}].wish`);
      g.items.forEach((s, j) => assert.equal(Boolean(d.profile.skills[i].items[j].note), Boolean(s.note)));
    });
    assert.deepEqual(d.profile.links, ja.profile.links.map((l) => ({ ...l })), "profile.links は同一");
    assert.deepEqual(d.profile.activities.map((a) => a.url), ja.profile.activities.map((a) => a.url));
    assert.equal(d.profile.avatar, ja.profile.avatar);
    assert.equal(d.profile.intro.length, ja.profile.intro.length);
  });

  test(`[${lang}] 説明ページのカードは同じ言語の説明ページを指し、ページ・カードに出してはいけない語がない`, () => {
    const d = loadData(lang);
    const cards = d.items.filter((i) => /\/(how-it-works|tech)\./.test(i.url || ""));
    assert.equal(cards.length, 5);
    for (const c of cards) {
      assert.match(c.url, new RegExp(`/(how-it-works|tech)\\.${lang}\\.html#`));
      const anchor = c.url.split("#")[1];
      const page = c.url.includes("how-it-works") ? file("how-it-works") : file("tech");
      assert.ok(read(page).includes(`id="${anchor}"`), `${c.url} の行き先がない`);
    }
    const texts = { cards: JSON.stringify(cards), [file("how-it-works")]: read(file("how-it-works")), [file("tech")]: read(file("tech")) };
    for (const [name, text] of Object.entries(texts)) {
      for (const word of BANNED) assert.ok(!text.includes(word), `${name} に ${word} が含まれている`);
    }
  });

  test(`[${lang}] index は構造どおり（#top #about #skills #activities #works、タブ3つ）`, () => {
    const html = read(file("index"));
    for (const id of ["top", "about", "skills", "activities", "works"]) assert.ok(html.includes(`id="${id}"`));
    assert.equal((html.match(/data-tab="/g) || []).length, 3);
    assert.ok(html.includes('id="sns-rail"'));
    assert.ok(html.includes(`<link rel="stylesheet" href="style.css">`));
  });

  test(`[${lang}] 説明ページから index.${lang}.html#works へ戻れる`, () => {
    for (const base of ["how-it-works", "tech"]) assert.ok(read(file(base)).includes(`href="${file("index")}#works"`));
  });
}

// ---- 日本語版: スイッチャーの導入で壊していないこと ----
test("日本語版: index のナビ内のスイッチャーは先頭の nav の外側（既存の nav テストを壊さない）", () => {
  const html = read("index.html");
  assert.ok(html.indexOf('id="site-nav"') < html.indexOf('class="lang-switch"'));
});

test("script.js: 日本語の既定値が残っている（ui なしでも日本語のまま）", () => {
  const src = read("script.js");
  assert.ok(src.includes('"ポートフォリオ"'));
  assert.ok(src.includes("データの形式に誤りがあります"));
});
