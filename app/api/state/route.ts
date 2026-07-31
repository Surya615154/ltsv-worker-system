import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";

const initialPayload = {
  resetVersion: "fresh-start-2026-08-01",
  members: [],
  clients: [],
  requirements: [],
  candidates: [],
  followUps: [],
  reports: [],
  invoices: [],
  tasks: [],
  attendanceLogs: [],
  leaveRequests: [],
  gatePassRequests: [],
  salaryAdjustments: [],
};

async function ensureStateTable() {
  await env.DB.batch([
    env.DB.prepare(
      "CREATE TABLE IF NOT EXISTS office_state (id TEXT PRIMARY KEY, payload TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
    ),
    env.DB.prepare(
      "CREATE INDEX IF NOT EXISTS office_state_updated_at_idx ON office_state (updated_at)",
    ),
  ]);
}

export async function GET() {
  await ensureStateTable();
  const row = await env.DB.prepare(
    "SELECT payload FROM office_state WHERE id = ?",
  )
    .bind("main")
    .first<{ payload: string }>();

  if (!row) {
    return NextResponse.json(initialPayload);
  }

  return NextResponse.json(JSON.parse(row.payload));
}

export async function POST(request: Request) {
  await ensureStateTable();
  const payload = await request.json();

  await env.DB.prepare(
    "INSERT INTO office_state (id, payload, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = CURRENT_TIMESTAMP",
  )
    .bind("main", JSON.stringify(payload))
    .run();

  return NextResponse.json({ ok: true });
}
