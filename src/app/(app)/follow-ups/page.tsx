"use client";

import { ScreenState } from "@/components/screen-state";
import { useStore } from "@/lib/store";
import Link from "next/link";

export default function FollowUpsPage() {
  const { outreach } = useStore();
  const today = new Date().toISOString().slice(0, 10);
  const due = outreach.filter((item) => item.followUpOn && item.status !== "replied");
  return (
    <div className="space-y-4">
      <h1 className="text-[20px] font-semibold">Follow-ups</h1>
      <p className="text-[13px] text-[var(--muted)]">Reminders you set. Email is not sent from this list.</p>
      {!due.length && <ScreenState kind="empty" title="No follow-ups" detail="After you draft a note, set a date. It shows here when it is due." />}
      <ul className="space-y-2">
        {due.map((item) => (
          <li key={item.id} className="card p-3">
            <p className="font-medium">{item.subject || "No subject"}</p>
            <p className="text-[13px] text-[var(--muted)]">{item.followUpOn}{item.followUpOn && item.followUpOn <= today ? " · due" : ""}</p>
          </li>
        ))}
      </ul>
      <Link href="/tracker" className="text-[13px] underline">My applications</Link>
    </div>
  );
}
