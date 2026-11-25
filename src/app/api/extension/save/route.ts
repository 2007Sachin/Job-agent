import { isRevoked, pushSavedJob } from "@/lib/extension-inbox";
import { rememberJob, remoteRevoked } from "@/lib/extension-remote";
import { extensionSecret, readExtensionToken } from "@/lib/extension-token";
import { enforceDailyCap } from "@/lib/rate-limit";
import type { Job } from "@/lib/types";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

function clean(value: unknown, max: number) {
  return String(value ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    token?: string;
    title?: string;
    company?: string;
    location?: string;
    description?: string;
    url?: string;
  };
  const secret = extensionSecret();
  const token = body.token || "";
  const session = readExtensionToken(token, secret);
  if (!session || isRevoked(token) || await remoteRevoked(token)) {
    return NextResponse.json({ error: "That pairing token is not valid. Make a new one in Settings." }, { status: 401 });
  }
  const limit = enforceDailyCap(`ext:${session.sub}`);
  if (!limit.ok) {
    return NextResponse.json({ error: "Daily save limit reached. Try again tomorrow." }, { status: 429 });
  }
  const title = clean(body.title, 160);
  const company = clean(body.company, 160);
  if (!title || !company) {
    return NextResponse.json({ error: "This page did not show a job title and a company." }, { status: 400 });
  }
  const url = clean(body.url, 500);
  const job: Job = {
    id: `ext-${session.sub.slice(0, 8)}-${Buffer.from(url || title).toString("base64url").slice(0, 24)}`,
    title,
    company,
    location: clean(body.location, 160) || "See the page",
    source: "The page you saved",
    url,
    description: clean(body.description, 4000),
    postedAt: new Date().toISOString().slice(0, 10),
  };
  pushSavedJob(session.sub, job);
  await rememberJob(session.sub, job);
  return NextResponse.json({ job });
}
