import { userFromAuthHeader } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await userFromAuthHeader(request);
  if (!auth) {
    return NextResponse.json(
      { error: "Sign in with Supabase and pass the access token. Demo data exports in the browser from Settings." },
      { status: 401 },
    );
  }
  const tables = ["profiles", "applications", "outreach", "usage_daily", "bots", "skills", "conversations", "messages", "desk_records"] as const;
  const dump: Record<string, unknown> = { user: { id: auth.user.id, email: auth.user.email } };
  for (const table of tables) {
    const { data, error } = await auth.client.from(table).select("*").eq(table === "profiles" ? "id" : "user_id", auth.user.id);
    dump[table] = error ? { error: error.message } : data;
  }
  return NextResponse.json(dump);
}
