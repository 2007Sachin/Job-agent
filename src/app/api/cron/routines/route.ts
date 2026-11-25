import { routineDue } from "@/lib/routine-due";
import { adminDb } from "@/lib/firebase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

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
  const db = adminDb();
  if (!db) {
    return NextResponse.json({ error: "Firebase admin is not set, so routines stay in the browser." }, { status: 503 });
  }
  const snap = await db.collectionGroup("desk").where("kind", "==", "schedule").get();
  const now = new Date().toISOString();
  let ran = 0;
  for (const row of snap.docs) {
    const schedule = row.data().payload as { name?: string; time?: string; enabled?: boolean; lastRun?: string | null };
    if (!routineDue({ time: schedule.time || "", enabled: schedule.enabled !== false, lastRun: schedule.lastRun ?? null })) continue;
    await row.ref.set({ payload: { ...schedule, lastRun: now }, updatedAt: now }, { merge: true });
    const activityId = crypto.randomUUID();
    await row.ref.parent.doc(activityId).set({
      kind: "activity",
      payload: { id: activityId, text: `Routine “${schedule.name || "Reminder"}” ran. Nothing was sent.`, createdAt: now },
      updatedAt: now,
    });
    ran += 1;
  }
  return NextResponse.json({ ran });
}
