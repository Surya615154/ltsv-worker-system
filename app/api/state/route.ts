import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";

const initialPayload = {
  resetVersion: "fresh-start-2026-08-01-v2",
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

function mergeById(existing: any[] = [], incoming: any[] = []) {
  const merged = new Map<string, any>();
  existing.forEach((item) => merged.set(item.id, item));
  incoming.forEach((item) => merged.set(item.id, item));
  return Array.from(merged.values());
}

function mergeAttendance(existing: any[] = [], incoming: any[] = []) {
  const merged = new Map<string, any>();
  existing.forEach((item) => merged.set(`${item.member}-${item.date}`, item));
  incoming.forEach((item) => merged.set(`${item.member}-${item.date}`, item));
  return Array.from(merged.values());
}

function mergeOfficeState(existing: any, incoming: any) {
  if (incoming?.resetVersion !== initialPayload.resetVersion) {
    return existing || initialPayload;
  }

  if (!existing || existing.resetVersion !== incoming.resetVersion) {
    return incoming;
  }

  return {
    ...existing,
    ...incoming,
    members: incoming.members?.length ? incoming.members : existing.members,
    clients: mergeById(existing.clients, incoming.clients),
    requirements: mergeById(existing.requirements, incoming.requirements),
    candidates: mergeById(existing.candidates, incoming.candidates),
    followUps: mergeById(existing.followUps, incoming.followUps),
    reports: mergeById(existing.reports, incoming.reports),
    invoices: mergeById(existing.invoices, incoming.invoices),
    tasks: mergeById(existing.tasks, incoming.tasks),
    attendanceLogs: mergeAttendance(existing.attendanceLogs, incoming.attendanceLogs),
    leaveRequests: mergeById(existing.leaveRequests, incoming.leaveRequests),
    gatePassRequests: mergeById(existing.gatePassRequests, incoming.gatePassRequests),
    salaryAdjustments: mergeById(existing.salaryAdjustments, incoming.salaryAdjustments),
  };
}

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
  const row = await env.DB.prepare(
    "SELECT payload FROM office_state WHERE id = ?",
  )
    .bind("main")
    .first<{ payload: string }>();
  const existingPayload = row ? JSON.parse(row.payload) : null;
  const nextPayload = mergeOfficeState(existingPayload, payload);

  await env.DB.prepare(
    "INSERT INTO office_state (id, payload, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = CURRENT_TIMESTAMP",
  )
    .bind("main", JSON.stringify(nextPayload))
    .run();

  return NextResponse.json({ ok: true });
}
