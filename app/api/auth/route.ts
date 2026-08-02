import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";

function normalizeAccessCode(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/@(\d{2})[-/](\d{2})[-/](\d{4})$/, "@$1$2$3");
}

const fallbackAccessCodes: Record<string, string> = {
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
      ...JSON.parse(env.LTSV_ACCESS_CODES || "{}"),
    } as Record<string, string>;
  } catch {
    return fallbackAccessCodes;
  }
}

export async function POST(request: Request) {
  const { memberId, code } = (await request.json()) as {
    memberId?: string;
    code?: string;
  };
  const codes = getCodeMap();
  const expectedCode = normalizeAccessCode(String(codes[memberId || ""] || ""));
  const typedCode = normalizeAccessCode(String(code || ""));

  return NextResponse.json({ ok: Boolean(expectedCode && typedCode === expectedCode) });
}
