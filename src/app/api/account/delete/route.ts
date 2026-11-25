import { supabaseAdmin, userFromAuthHeader } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { confirm?: string };
  if (body.confirm !== "DELETE") {
    return NextResponse.json({ error: "Send confirm: DELETE to erase the account." }, { status: 400 });
  }
  const auth = await userFromAuthHeader(request);
  if (!auth) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const id = auth.user.id;
  for (const table of ["outreach", "applications", "usage_daily", "gmail_tokens"] as const) {
    await auth.client.from(table).delete().eq("user_id", id);
  }
  await auth.client.from("profiles").delete().eq("id", id);
  const admin = supabaseAdmin();
  if (!admin) {
    return NextResponse.json({
      deleted: "rows",
      note: "Profile rows were removed. Set SUPABASE_SERVICE_ROLE_KEY so the auth user can be deleted too. You are still signed in until then.",
    });
  }
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deleted: "account" });
}
