import { routineDue } from "@/lib/routine-due";
import { supabaseAdmin } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function allowed(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization") || "";
  return header === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  return run(request);
}

export async function POST(request: Request) {
  return run(request);
}

async function run(request: Request) {
  if (!allowed(request)) {
    return NextResponse.json({ error: "This route needs CRON_SECRET." }, { status: 401 });
  }
  const admin = supabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Supabase service role is not set, so routines stay in the browser." }, { status: 503 });
  }
  const { data, error } = await admin.from("desk_records").select("id,user_id,payload").eq("kind", "schedule");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const now = new Date().toISOString();
  let ran = 0;
  for (const row of data ?? []) {
    const schedule = row.payload as { name?: string; time?: string; enabled?: boolean; lastRun?: string | null; prompt?: string };
    if (!routineDue({ time: schedule.time || "", enabled: schedule.enabled !== false, lastRun: schedule.lastRun ?? null })) continue;
    const next = { ...schedule, lastRun: now };
    await admin.from("desk_records").update({ payload: next, updated_at: now }).eq("id", row.id);
    await admin.from("desk_records").insert({
      id: crypto.randomUUID(),
      user_id: row.user_id,
      kind: "activity",
      payload: { id: crypto.randomUUID(), text: `Routine “${schedule.name || "Reminder"}” ran. Nothing was sent.`, createdAt: now },
      updated_at: now,
    });
    ran += 1;
  }
  return NextResponse.json({ ran });
}
