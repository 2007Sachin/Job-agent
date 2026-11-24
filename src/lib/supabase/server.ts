import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function supabasePublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  return { url, anon };
}

export async function supabaseFromCookies(): Promise<SupabaseClient | null> {
  const env = supabasePublicEnv();
  if (!env) return null;
  const cookieStore = await cookies();
  return createServerClient(env.url, env.anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(list) {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          /* set from a Server Component; middleware or route handler can persist */
        }
      },
    },
  });
}

export function supabaseAdmin(): SupabaseClient | null {
  const env = supabasePublicEnv();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!env || !key) return null;
  return createClient(env.url, key, { auth: { persistSession: false } });
}

export async function userFromAuthHeader(request: Request) {
  const env = supabasePublicEnv();
  const header = request.headers.get("authorization");
  if (!env || !header?.toLowerCase().startsWith("bearer ")) return null;
  const token = header.slice(7).trim();
  const client = createClient(env.url, env.anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return null;
  return { client, user: data.user };
}
