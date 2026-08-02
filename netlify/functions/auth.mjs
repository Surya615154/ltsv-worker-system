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

const fallbackAccessCodes = {
  m1: "sagar@owner",
  m2: "sonali@hrd",
  m3: "vishwatej@bdo",
  m4: "rohan@30061999",
  m5: "laxmi@13062006",
  m6: "priti@23092002",
  m7: "satish@20072004",
  m8: "vaishnavi@03062005",
  m9: "gayatri@21071999",
};

function getCodeMap() {
  try {
    return {
      ...fallbackAccessCodes,
      ...JSON.parse(process.env.LTSV_ACCESS_CODES || "{}"),
    };
  } catch {
    return fallbackAccessCodes;
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
