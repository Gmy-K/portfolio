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

test("data.js にサークル名（Meicom）を含めない", () => {
  const source = fs.readFileSync(path.resolve(__dirname, "../data.js"), "utf8");
  assert.ok(!/meicom/i.test(source));
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
