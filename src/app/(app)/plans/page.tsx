"use client";

import { useState } from "react";

export default function PlansPage() {
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  async function join(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const json = await res.json();
    setNote(res.ok ? "You are on the list. Plus is not for sale yet." : (json.error || "Could not save that email."));
  }
  return (
    <div className="space-y-6">
      <h1 className="text-[20px] font-semibold">Plans</h1>
      <p className="text-[13px] text-[var(--muted)]">Built around finding a job, saving it, and making a resume. No checkout. Plus is coming soon.</p>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="card space-y-2 p-4">
          <h2 className="text-[16px] font-medium">Free</h2>
          <ul className="list-disc space-y-1 pl-5 text-[14px]">
            <li>5 tailored resumes a month</li>
            <li>Save jobs and track applications</li>
            <li>Follow-up dates on this device</li>
          </ul>
        </section>
        <section className="card space-y-2 p-4">
          <h2 className="text-[16px] font-medium">Plus</h2>
          <p className="text-[13px] text-danger">Coming soon. No charge.</p>
          <ul className="list-disc space-y-1 pl-5 text-[14px] text-[var(--muted)]">
            <li>Unlimited tailored resumes</li>
            <li>Cover letters for each job</li>
            <li>Follow-up reminders by email</li>
          </ul>
        </section>
      </div>
      <form onSubmit={(e) => void join(e)} className="card space-y-2 p-4">
        <h2 className="text-[16px] font-medium">Waitlist</h2>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full bg-white" />
        <button className="bg-brass" type="submit">Join the waitlist</button>
        {note && <p role="status">{note}</p>}
      </form>
    </div>
  );
}
