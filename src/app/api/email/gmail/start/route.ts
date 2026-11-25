import { supabaseFromCookies } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const origin = new URL(request.url).origin;
  if (!clientId || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.redirect(new URL("/settings?gmail=missing", origin));
  }
  const supabase = await supabaseFromCookies();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  if (!user) return NextResponse.redirect(new URL("/login?next=/settings", origin));
  const state = crypto.randomUUID();
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", `${origin}/api/email/gmail/callback`);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("scope", "https://www.googleapis.com/auth/gmail.send email");
  url.searchParams.set("state", state);
  const response = NextResponse.redirect(url);
  response.cookies.set("ja_gmail_state", `${state}:${user.id}`, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 600 });
  return response;
}
