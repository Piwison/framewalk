#!/usr/bin/env node
import { readFileSync } from "node:fs";
let p = {};
try { p = JSON.parse(readFileSync(0, "utf8") || "{}"); } catch { process.exit(0); }
const path = p?.tool_input?.file_path || p?.tool_input?.path || "";
const BLOCKED = [/(^|\/)\.env($|\.)/, /\.pem$/, /(^|\/)secrets?\//i, /(^|\/)\.git\//];
if (BLOCKED.some((re) => re.test(path))) {
  console.error(`Blocked write to protected path: ${path}`);
  process.exit(2);
}
process.exit(0);
