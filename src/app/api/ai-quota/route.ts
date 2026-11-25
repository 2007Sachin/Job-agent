import { readAiQuota } from "@/lib/ai-quota";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const quota = await readAiQuota(request);
  if (!quota) return NextResponse.json({ error: "Sign in to use AI actions." }, { status: 401 });
  return NextResponse.json(quota);
}
