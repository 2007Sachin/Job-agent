import { supabaseAdmin, userFromAuthHeader } from "./supabase/server";

export function nextUsageCount(current: number | null | undefined) {
  return (current ?? 0) + 1;
}

export async function noteUsage(request: Request, kind: string) {
  const admin = supabaseAdmin();
  if (!admin) return;
  const session = await userFromAuthHeader(request);
  if (!session) return;
  const day = new Date().toISOString().slice(0, 10);
  const { data } = await admin
    .from("usage_daily")
    .select("count")
    .eq("user_id", session.user.id)
    .eq("day", day)
    .eq("kind", kind)
    .maybeSingle();
  await admin.from("usage_daily").upsert({
    user_id: session.user.id,
    day,
    kind,
    count: nextUsageCount(data?.count),
  });
}
