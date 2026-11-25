import { userFromAuthHeader } from "@/lib/firebase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await userFromAuthHeader(request);
  if (!auth) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const header = request.headers.get("authorization") || "";
  const token = header.slice(7).trim();
  const response = NextResponse.json({ ok: true });
  response.cookies.set("ja_id_token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
    secure: new URL(request.url).protocol === "https:",
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set("ja_id_token", "", { path: "/", maxAge: 0 });
  return response;
}
