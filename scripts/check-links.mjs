import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const lib = require("../lib.js");

const sandbox = { window: {} };
vm.runInNewContext(readFileSync(new URL("../data.js", import.meta.url), "utf8"), sandbox);
const data = sandbox.window.PORTFOLIO;

const errors = lib.validateData(data);
if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

const skipHosts = (process.env.SKIP_HOSTS || "").split(",").filter(Boolean);

async function check(url) {
  for (const method of ["HEAD", "GET"]) {
    try {
      const response = await fetch(url, {
        method,
        redirect: "follow",
        signal: AbortSignal.timeout(15000),
      });
      if (response.ok) return true;
    } catch {
      // 次のメソッドで再試行する
    }
  }
  return false;
}

let failed = 0;
for (const url of lib.collectUrls(data)) {
  if (skipHosts.includes(new URL(url).hostname)) {
    console.log(`SKIP ${url}`);
    continue;
  }
  const ok = await check(url);
  console.log(`${ok ? "OK  " : "FAIL"} ${url}`);
  if (!ok) failed++;
}
process.exit(failed > 0 ? 1 : 0);
