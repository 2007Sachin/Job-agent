import { supabaseAdmin } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const demo: string[] = [];

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string };
  const email = String(body.email || "").trim().toLowerCase();
  if (!email.includes("@")) return NextResponse.json({ error: "Enter an email address." }, { status: 400 });
  const admin = supabaseAdmin();
  if (admin) {
    const { error } = await admin.from("waitlist").upsert({ email });
    if (error) return NextResponse.json({ error: "Could not save that email." }, { status: 500 });
    return NextResponse.json({ stored: "supabase" });
  }
  if (!demo.includes(email)) demo.push(email);
  return NextResponse.json({ stored: "demo" });
}
