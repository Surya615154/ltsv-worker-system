import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("contains the recruitment office operating system", async () => {
  const [page, app, css, layout] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/RecruitmentOS.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(page, /<RecruitmentOS \/>/);
  assert.match(layout, /title:\s*"LTSV Worker System"/);
  assert.match(app, /Office Control/);
  assert.match(app, /Today Command Board/);
  assert.match(app, /Staff Discipline Sheet/);
  assert.match(app, /Candidate Tracker/);
  assert.match(css, /\.metric-grid/);
  assert.doesNotMatch(app + layout + css, /Your site is taking shape|Codex is working|codex-preview/);
});

test("includes shared storage and removes starter dependency", async () => {
  const [route, hosting, schema, packageJson] = await Promise.all([
    readFile(new URL("../app/api/state/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(hosting, /"d1":\s*"DB"/);
  assert.match(route, /office_state/);
  assert.match(route, /export async function GET/);
  assert.match(route, /export async function POST/);
  assert.match(schema, /officeState/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await access(new URL("../dist/server/index.js", import.meta.url));
});
