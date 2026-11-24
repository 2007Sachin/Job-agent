import { clientKey } from "@/lib/job-sources";
import { enforceDailyCap } from "@/lib/rate-limit";
import { supabaseAdmin } from "@/lib/supabase/server";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = {
  approved?: boolean;
  consent?: boolean;
  to?: string;
  subject?: string;
  body?: string;
  provider?: "smtp" | "gmail";
  smtp?: { host?: string; port?: string; user?: string; pass?: string; from?: string };
};

async function sendGmail(to: string, subject: string, body: string, refreshToken: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("Google OAuth is not configured");
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const token = (await tokenRes.json()) as { access_token?: string; error?: string };
  if (!token.access_token) throw new Error(token.error || "Could not refresh Gmail token");
  const raw = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "Content-Type: text/plain; charset=utf-8",
    "",
    body,
  ].join("\r\n");
  const encoded = Buffer.from(raw).toString("base64url");
  const sent = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${token.access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ raw: encoded }),
  });
  if (!sent.ok) throw new Error(`Gmail send failed (${sent.status})`);
}

export async function POST(request: Request) {
  const payload = (await request.json()) as Payload;
  if (!payload.approved) {
    return NextResponse.json({ error: "Tick approval on this exact email before sending." }, { status: 400 });
  }
  if (!payload.consent) {
    return NextResponse.json({ error: "Record email-sending consent in Settings first." }, { status: 400 });
  }
  const to = payload.to?.trim() ?? "";
  const subject = payload.subject?.trim() ?? "";
  const body = payload.body?.trim() ?? "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to) || !subject || !body) {
    return NextResponse.json({ error: "Recipient, subject, and body are required." }, { status: 400 });
  }
  const limit = enforceDailyCap(`mail:${clientKey(request)}`);
  if (!limit.ok) return NextResponse.json({ error: "Daily send cap reached." }, { status: 429 });

  try {
    if (payload.provider === "smtp") {
      const smtp = payload.smtp;
      if (!smtp?.host || !smtp.user || !smtp.pass || !smtp.from) {
        return NextResponse.json({ error: "SMTP host, user, password, and from-address are required. The password is not stored." }, { status: 400 });
      }
      const transport = nodemailer.createTransport({
        host: smtp.host,
        port: Number(smtp.port || 587),
        secure: Number(smtp.port) === 465,
        auth: { user: smtp.user, pass: smtp.pass },
      });
      await transport.sendMail({ from: smtp.from, to, subject, text: body });
      return NextResponse.json({ status: "sent", provider: "smtp" });
    }

    const cookie = request.headers.get("cookie") ?? "";
    const match = cookie.match(/(?:^|;\s*)ja_gmail_refresh=([^;]+)/);
    let refresh = match ? decodeURIComponent(match[1]) : "";
    if (!refresh) {
      const admin = supabaseAdmin();
      const userId = request.headers.get("x-user-id");
      if (admin && userId && userId !== "demo") {
        const { data } = await admin.from("gmail_tokens").select("refresh_token").eq("user_id", userId).maybeSingle();
        refresh = data?.refresh_token ?? "";
      }
    }
    if (!refresh) {
      return NextResponse.json(
        {
          status: "unsent",
          provider: "unsent",
          error: "Gmail is not connected. Connect Google in Settings, or send with SMTP. Nothing was sent.",
        },
        { status: 200 },
      );
    }
    await sendGmail(to, subject, body, refresh);
    return NextResponse.json({ status: "sent", provider: "gmail" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Send failed";
    return NextResponse.json({ status: "failed", error: message }, { status: 502 });
  }
}
