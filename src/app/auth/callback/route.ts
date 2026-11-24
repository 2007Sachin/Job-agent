import { supabasePublicEnv } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/dashboard";
  const env = supabasePublicEnv();
  if (!env || !code) return NextResponse.redirect(new URL("/login?error=auth", url.origin));
  const cookieStore = await cookies();
  const supabase = createServerClient(env.url, env.anon, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(list) {
        list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      },
    },
  });
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/login?error=auth", url.origin));
  return NextResponse.redirect(new URL(next, url.origin));
}
