/**
 * Load the BUILT package the way a consumer does.
 *
 * Typechecking reads source. Source can be perfect while the artifact is
 * unusable: an export map that promises a file the compiler never wrote, or a
 * `"use client"` directive that got dropped on the way out — which turns every
 * `useState` in a Next app into a build error in someone else's repo, long
 * after this one went green. So this opens the artifact instead.
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

let failed = 0;
const check = async (name, fn) => {
  try {
    await fn();
    console.log(`  ok   ${name}`);
  } catch (e) {
    failed++;
    console.error(`  FAIL ${name}\n       ${e.message}`);
  }
};

console.log("dist:");

await check("every export the package advertises exists on disk", () => {
  const missing = [];
  for (const [name, entry] of Object.entries(pkg.exports ?? {})) {
    for (const target of typeof entry === "string" ? [entry] : Object.values(entry)) {
      if (typeof target !== "string" || target.includes("*")) continue;
      if (!existsSync(join(root, target))) missing.push(`${name} -> ${target}`);
    }
  }
  if (missing.length) throw new Error(missing.join(", "));
});

await check("the entry imports and default-exports a component", async () => {
  const mod = await import(pathToFileURL(join(root, pkg.exports["."].import)).href);
  if (typeof mod.default !== "function") throw new Error("no default export");
});

await check('the "use client" directive survived compilation', () => {
  const js = readFileSync(join(root, pkg.exports["."].import), "utf8");
  if (!/^\s*(['"])use client\1/.test(js)) throw new Error("directive missing from dist");
});

process.exit(failed ? 1 : 0);
