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
  assert.match(layout, /title:\s*"Life Time Success Vision"/);
  assert.match(layout, /\/ltsv-logo\.png/);
  assert.match(app, /Life Time Success Vision/);
  assert.match(app, /Staff Login/);
  assert.match(app, /Final launch version/);
  assert.match(app, /Launch Checklist/);
  assert.match(app, /Office Rhythm/);
  assert.match(app, /Non-Negotiable Rules/);
  assert.match(app, /Performance Ranking/);
  assert.match(app, /CEO Risk Queue/);
  assert.match(app, /Task Assignment Board/);
  assert.match(app, /Attendance and Late Mark/);
  assert.match(app, /Leave Permission Board/);
  assert.match(app, /Request Leave/);
  assert.match(app, /Submit Leave Request/);
  assert.match(app, /Grant/);
  assert.match(app, /Reject/);
  assert.match(app, /QR Attendance/);
  assert.match(app, /Office QR Code/);
  assert.match(app, /Mark My Attendance/);
  assert.match(app, /6 digit office code/);
  assert.match(app, /Attendance code/);
  assert.match(app, /Personal access only/);
  assert.match(app, /My Task Access/);
  assert.match(app, /attendance=qr/);
  assert.match(app, /Wrong code/);
  assert.match(app, /Logout/);
  assert.match(app, /Office Control/);
  assert.match(app, /Today Command Board/);
  assert.match(app, /Staff Discipline Sheet/);
  assert.match(app, /Candidate Tracker/);
  assert.match(app, /Invoice and Payment Tracker/);
  assert.match(app, /Quick Staff Update/);
  assert.match(app, /Agreement Sent/);
  assert.match(css, /\.metric-grid/);
  assert.match(css, /\.qr-print-card/);
  assert.match(css, /\.qr-shell/);
  assert.match(css, /\.identity-lock/);
  assert.match(css, /\.access-note/);
  assert.match(css, /\.leave-table/);
  assert.match(css, /\.decision-actions/);
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
  await access(new URL("../public/ltsv-logo.png", import.meta.url));
});
