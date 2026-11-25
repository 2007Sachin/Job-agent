import { adminDb, userFromAuthHeader } from "@/lib/firebase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

const collections = ["applications", "outreach", "usage", "bots", "skills", "conversations", "messages", "desk", "apps"] as const;

export async function GET(request: Request) {
  const auth = await userFromAuthHeader(request);
  if (!auth) {
    return NextResponse.json(
      { error: "Sign in with Firebase and pass the ID token. Demo data exports in the browser from Settings." },
      { status: 401 },
    );
  }
  const db = adminDb();
  if (!db) return NextResponse.json({ error: "Firebase admin is not configured." }, { status: 503 });
  const user = db.collection("users").doc(auth.user.id);
  const dump: Record<string, unknown> = { user: auth.user, profile: (await user.get()).data() ?? null };
  for (const name of collections) {
    const snap = await user.collection(name).get();
    dump[name] = snap.docs.map((row) => ({ id: row.id, ...row.data() }));
  }
  return NextResponse.json(dump);
}
