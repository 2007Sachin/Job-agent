"use client";

import { GoogleMark } from "./google-mark";
import { SiteHeader } from "./site-header";
import { useStore } from "@/lib/store";
import { clientAuth, firebaseConfigured } from "@/lib/firebase/browser";
import { GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function Form({ mode }: { mode: "login" | "signup" }) {
  const { signInDemo, adoptFirebaseUser } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(params.get("error") ? "Sign-in did not finish. Try again." : "");
  const [pending, setPending] = useState(false);
  const configured = firebaseConfigured();

  async function finish(user: { uid: string; email: string | null; getIdToken: () => Promise<string> }) {
    const token = await user.getIdToken();
    await fetch("/api/session", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    adoptFirebaseUser(user.uid, user.email ?? email);
    router.push("/onboarding");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const auth = clientAuth();
    if (!auth) {
      setMessage("Firebase is not configured. Use the demo desk, or add the keys in .env.local.");
      return;
    }
    setPending(true);
    try {
      const cred = mode === "signup"
        ? await createUserWithEmailAndPassword(auth, email, password)
        : await signInWithEmailAndPassword(auth, email, password);
      await finish(cred.user);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Sign-in did not finish.");
    } finally {
      setPending(false);
    }
  }

  async function google() {
    const auth = clientAuth();
    if (!auth) {
      setMessage("Add Firebase keys before Google sign-in.");
      return;
    }
    try {
      const cred = await signInWithPopup(auth, new GoogleAuthProvider());
      await finish(cred.user);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Google sign-in did not finish.");
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-md px-5 py-16">
        <h1 className="text-5xl">{mode === "login" ? "Log in" : "Create an account"}</h1>
        <p className="mt-3 text-muted">Email and Google use Firebase Auth. The demo desk works with no keys and stays in this browser.</p>
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
          <button type="button" onClick={() => void google()} className="inline-flex items-center gap-3 px-4 py-2 text-left" disabled={!configured}>
            <GoogleMark />
            Continue with Google{configured ? "" : " (needs Firebase)"}
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
