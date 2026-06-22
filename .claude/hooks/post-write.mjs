#!/usr/bin/env node
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
let p = {};
try { p = JSON.parse(readFileSync(0, "utf8") || "{}"); } catch { process.exit(0); }
const f = p?.tool_input?.file_path || p?.tool_input?.path || "";
if (!/\.(ts|tsx|js|jsx|mjs|cjs|css)$/.test(f)) process.exit(0);
const run = (c) => {
  try { execSync(c, { stdio: "pipe" }); return null; }
  catch (e) { return (e.stdout?.toString() || "") + (e.stderr?.toString() || ""); }
};
run(`npx prettier --write "${f}"`);
const lint = run(`npx eslint --fix "${f}"`);
let tsc = null;
if (/\.(ts|tsx)$/.test(f)) tsc = run("npx tsc --noEmit");
if (lint || tsc) {
  console.error([lint && `ESLint:\n${lint}`, tsc && `tsc:\n${tsc}`].filter(Boolean).join("\n"));
  process.exit(2);
}
process.exit(0);
