import { getStore } from "@netlify/blobs";

const stateKey = "main";
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

function jsonResponse(payload, init = {}) {
  return Response.json(payload, {
    ...init,
    headers: {
      "cache-control": "no-store",
      ...(init.headers || {}),
    },
  });
}

function mergeById(existing = [], incoming = []) {
  const merged = new Map();
  existing.forEach((item) => merged.set(item.id, item));
  incoming.forEach((item) => merged.set(item.id, item));
  return Array.from(merged.values());
}

function mergeAttendance(existing = [], incoming = []) {
  const merged = new Map();
  existing.forEach((item) => merged.set(`${item.member}-${item.date}`, item));
  incoming.forEach((item) => merged.set(`${item.member}-${item.date}`, item));
  return Array.from(merged.values());
}

function mergeOfficeState(existing, incoming) {
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

export default async function handler(request) {
  const store = getStore("ltsv-office-state");

  if (request.method === "GET") {
    const savedState = await store.get(stateKey, {
      consistency: "strong",
      type: "json",
    });

    return jsonResponse(savedState || initialPayload);
  }

  if (request.method === "POST") {
    const payload = await request.json();
    const savedState = await store.get(stateKey, {
      consistency: "strong",
      type: "json",
    });
    const nextPayload = mergeOfficeState(savedState, payload);

    await store.setJSON(stateKey, nextPayload, {
      metadata: {
        updatedAt: new Date().toISOString(),
      },
    });

    return jsonResponse({ ok: true });
  }

  return jsonResponse(
    { error: "Method not allowed" },
    {
      status: 405,
      headers: {
        allow: "GET, POST",
      },
    },
  );
}
