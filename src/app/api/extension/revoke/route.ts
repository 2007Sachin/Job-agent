import { revokeToken } from "@/lib/extension-inbox";
import { rememberRevoke } from "@/lib/extension-remote";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as { token?: string };
  if (!body.token) return NextResponse.json({ error: "Missing token." }, { status: 400 });
  revokeToken(body.token);
  await rememberRevoke(body.token);
  return NextResponse.json({ revoked: true });
}
