function jsonResponse(payload, init = {}) {
  return Response.json(payload, {
    ...init,
    headers: {
      "cache-control": "no-store",
      ...(init.headers || {}),
    },
  });
}

function normalizeAccessCode(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/@(\d{2})[-/](\d{2})[-/](\d{4})$/, "@$1$2$3");
}

function getCodeMap() {
  try {
    return JSON.parse(process.env.LTSV_ACCESS_CODES || "{}");
  } catch {
    return {};
  }
}

export default async function handler(request) {
  if (request.method !== "POST") {
    return jsonResponse(
      { error: "Method not allowed" },
      {
        status: 405,
        headers: {
          allow: "POST",
        },
      },
    );
  }

  const { memberId, code } = await request.json();
  const codes = getCodeMap();
  const expectedCode = normalizeAccessCode(codes[memberId]);
  const typedCode = normalizeAccessCode(code);

  return jsonResponse({ ok: Boolean(expectedCode && typedCode === expectedCode) });
}
