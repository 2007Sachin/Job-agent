"use client";

import { ScreenState } from "@/components/screen-state";
import { formatFollowUpDate, followUpTiming } from "@/lib/follow-up";
import { useStore } from "@/lib/store";
import Link from "next/link";

export default function FollowUpsPage() {
  const { outreach, applications, patchOutreach } = useStore();
  const due = outreach.filter((item) => item.followUpOn && item.status !== "replied");
  return (
    <div className="space-y-4">
      <h1 className="text-[20px] font-semibold">Follow-ups</h1>
      <p className="text-[13px] text-[var(--muted)]">Reminders you set. This list does not send email.</p>
      {!due.length && <ScreenState kind="empty" title="No follow-ups" detail="After you draft a note, set a date. It shows here when it is due." />}
      <ul className="space-y-2">
        {due.map((item) => {
          const app = applications.find((row) => row.id === item.applicationId);
          const href = app ? `/jobs/${encodeURIComponent(app.job.id)}` : "/tracker";
          const timing = item.followUpOn ? followUpTiming(item.followUpOn) : "";
          return (
            <li key={item.id} className="card flex flex-wrap items-center gap-x-3 gap-y-1 p-3">
              <Link className="font-medium underline" href={href}>{item.subject || app?.job.title || "No subject"}</Link>
              <span className="text-[13px] text-[var(--muted)]">{item.followUpOn ? formatFollowUpDate(item.followUpOn) : ""}{timing ? ` · ${timing}` : ""}</span>
              <button type="button" className="text-[13px] underline" onClick={() => patchOutreach(item.id, { followUpOn: null })}>Mark done</button>
              <Link className="text-[13px] underline" href={href}>Open job</Link>
            </li>
          );
        })}
      </ul>
      <Link href="/tracker" className="text-[13px] underline">My applications</Link>
    </div>
  );
}
