"use client";

import { SiteHeader } from "./site-header";
import { useStore } from "@/lib/store";
import { getBrowserSupabase, supabaseConfigured } from "@/lib/supabase/browser";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function Form({ mode }: { mode: "login" | "signup" }) {
  const { signInDemo, adoptSupabaseUser } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(params.get("error") ? "Sign-in did not finish. Try again." : "");
  const [pending, setPending] = useState(false);
  const configured = supabaseConfigured();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const sb = getBrowserSupabase();
    if (!sb) {
      setMessage("Supabase is not configured. Use the demo desk, or add the keys in .env.local.");
      return;
    }
    setPending(true);
    const redirect = `${window.location.origin}/auth/callback?next=/onboarding`;
    const result = mode === "signup"
      ? await sb.auth.signUp({ email, password, options: { emailRedirectTo: redirect } })
      : await sb.auth.signInWithPassword({ email, password });
    setPending(false);
    if (result.error) {
      setMessage(result.error.message);
      return;
    }
    if (result.data.session?.user) {
      adoptSupabaseUser(result.data.session.user.id, result.data.session.user.email ?? email);
      router.push("/onboarding");
      return;
    }
    setMessage("Check your inbox to confirm the address, then log in.");
  }

  async function google() {
    const sb = getBrowserSupabase();
    if (!sb) {
      setMessage("Add Supabase keys before Google sign-in.");
      return;
    }
    const { error } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/onboarding` },
    });
    if (error) setMessage(error.message);
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-md px-5 py-16">
        <h1 className="text-5xl">{mode === "login" ? "Log in" : "Create an account"}</h1>
        <p className="mt-3 text-muted">Email and Google use Supabase Auth. The demo desk works with no keys and stays in this browser.</p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block text-sm">
            Email
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full border border-line bg-card px-3 py-2" autoComplete="email" />
          </label>
          <label className="block text-sm">
            Password
            <input required minLength={6} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full border border-line bg-card px-3 py-2" autoComplete={mode === "login" ? "current-password" : "new-password"} />
          </label>
          <button disabled={pending} className="bg-ink px-4 py-2 text-paper disabled:opacity-60" type="submit">
            {pending ? "Working…" : mode === "login" ? "Log in" : "Sign up"}
          </button>
        </form>
        <div className="mt-4 flex flex-col gap-3">
          <button type="button" onClick={() => void google()} className="border border-line px-4 py-2 text-left" disabled={!configured}>
            Continue with Google {configured ? "" : "(needs Supabase)"}
          </button>
          <button
            type="button"
            className="border border-line px-4 py-2 text-left"
            onClick={() => {
              signInDemo(email || undefined);
              router.push("/onboarding");
            }}
          >
            Explore with demo data on this device
          </button>
        </div>
        {message && <p className="mt-4 text-sm text-danger" role="status">{message}</p>}
        <p className="mt-6 text-sm text-muted">
          {mode === "login" ? <Link href="/signup" className="underline">Need an account?</Link> : <Link href="/login" className="underline">Already registered?</Link>}
        </p>
      </main>
    </>
  );
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  return (
    <Suspense fallback={<p className="px-5 py-16 text-muted">Loading…</p>}>
      <Form mode={mode} />
    </Suspense>
  );
}
