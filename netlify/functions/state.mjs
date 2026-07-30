import { getStore } from "@netlify/blobs";

const stateKey = "main";
const initialPayload = {
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

    await store.setJSON(stateKey, payload, {
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
