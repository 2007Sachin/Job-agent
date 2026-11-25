import { supabaseAdmin, userFromAuthHeader } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await userFromAuthHeader(request);
  const admin = supabaseAdmin();
  if (!session || !admin) {
    return NextResponse.json({ stored: "device" });
  }
  const body = (await request.json()) as { rows?: { id: string; status: string; helpers: string[] }[] };
  const { error } = await admin.from("connected_apps").upsert({
    user_id: session.user.id,
    payload: body.rows ?? [],
    updated_at: new Date().toISOString(),
  });
  if (error) return NextResponse.json({ error: "Could not save connections." }, { status: 500 });
  return NextResponse.json({ stored: "supabase" });
}
