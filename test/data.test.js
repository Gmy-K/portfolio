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
