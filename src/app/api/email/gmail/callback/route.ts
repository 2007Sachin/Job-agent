import { adminDb } from "@/lib/firebase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const jar = await cookies();
  const stored = jar.get("ja_gmail_state")?.value ?? "";
  const [storedState, userId] = stored.split(":");
  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(new URL("/settings?gmail=state", origin));
  }
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirect_uri: `${origin}/api/email/gmail/callback`,
      grant_type: "authorization_code",
    }),
  });
  const token = (await tokenRes.json()) as { refresh_token?: string; error?: string };
  if (!token.refresh_token) {
    return NextResponse.redirect(new URL("/settings?gmail=token", origin));
  }
  const db = adminDb();
  if (db && userId) {
    await db.collection("users").doc(userId).collection("private").doc("gmail").set({
      refreshToken: token.refresh_token,
      updatedAt: new Date().toISOString(),
    });
  }
  const response = NextResponse.redirect(new URL("/settings?gmail=connected", origin));
  response.cookies.set("ja_gmail_refresh", token.refresh_token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    secure: origin.startsWith("https"),
  });
  response.cookies.set("ja_gmail_state", "", { path: "/", maxAge: 0 });
  return response;
}
