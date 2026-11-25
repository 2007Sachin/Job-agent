"use client";

import { useStore } from "@/lib/store";
import Link from "next/link";

export default function DashboardPage() {
  const { profile, applications } = useStore();
  const first = profile.fullName ? profile.fullName.split(" ")[0] : "there";
  return (
    <div className="space-y-8">
      <h1 className="text-4xl">Hi {first}. What do you want to do?</h1>
      <p className="max-w-[62ch]">You have {applications.length} saved job{applications.length === 1 ? "" : "s"}. Pick one thing.</p>
      <div className="flex flex-col gap-3">
        <Link href="/jobs" className="btn bg-brass w-fit">Find jobs</Link>
        <Link href="/tracker" className="btn w-fit border border-line">See my applications</Link>
        <Link href="/chat" className="btn w-fit border border-line">Chat with a helper</Link>
      </div>
      {!profile.emailConsent && (
        <p>Email stays off until you allow it in <Link href="/settings" className="underline">Settings</Link>.</p>
      )}
    </div>
  );
}
