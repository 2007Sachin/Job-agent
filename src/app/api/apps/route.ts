import { adminDb, userFromAuthHeader } from "@/lib/firebase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await userFromAuthHeader(request);
  const db = adminDb();
  if (!session || !db) return NextResponse.json({ stored: "device" });
  const body = (await request.json()) as { rows?: { id: string; status: string; helpers: string[] }[] };
  await db.collection("users").doc(session.user.id).collection("apps").doc("list").set({
    payload: body.rows ?? [],
    updatedAt: new Date().toISOString(),
  });
  return NextResponse.json({ stored: "firebase" });
}
