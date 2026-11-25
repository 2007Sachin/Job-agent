import { adminDb } from "@/lib/firebase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const demo: string[] = [];

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string };
  const email = String(body.email || "").trim().toLowerCase();
  if (!email.includes("@")) return NextResponse.json({ error: "Enter an email address." }, { status: 400 });
  const db = adminDb();
  if (db) {
    await db.collection("waitlist").doc(email).set({ email, createdAt: new Date().toISOString() });
    return NextResponse.json({ stored: "firebase" });
  }
  if (!demo.includes(email)) demo.push(email);
  return NextResponse.json({ stored: "demo" });
}
