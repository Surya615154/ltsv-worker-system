import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";

function normalizeAccessCode(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/@(\d{2})[-/](\d{2})[-/](\d{4})$/, "@$1$2$3");
}

function getCodeMap() {
  try {
    return JSON.parse(env.LTSV_ACCESS_CODES || "{}") as Record<string, string>;
  } catch {
    return {};
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
