import { adminAuth, adminDb, userFromAuthHeader } from "@/lib/firebase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { confirm?: string };
  if (body.confirm !== "DELETE") {
    return NextResponse.json({ error: "Send confirm: DELETE to erase the account." }, { status: 400 });
  }
  const auth = await userFromAuthHeader(request);
  if (!auth) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const db = adminDb();
  const authAdmin = adminAuth();
  if (!db || !authAdmin) {
    return NextResponse.json({ error: "Firebase admin is not configured." }, { status: 503 });
  }
  const user = db.collection("users").doc(auth.user.id);
  for (const name of ["messages", "conversations", "desk", "skills", "bots", "outreach", "applications", "usage", "apps", "private"]) {
    const snap = await user.collection(name).get();
    await Promise.all(snap.docs.map((row) => row.ref.delete()));
  }
  await user.delete();
  await authAdmin.deleteUser(auth.user.id);
  return NextResponse.json({ deleted: "account" });
}
