"use client";

import { ScreenState } from "@/components/screen-state";
import { useStore } from "@/lib/store";
import Link from "next/link";

export default function SavedPage() {
  const { applications } = useStore();
  const rows = applications.filter((app) => app.stage === "saved");
  return (
    <div className="space-y-4">
      <h1 className="text-[20px] font-semibold">Saved</h1>
      {!rows.length && <ScreenState kind="empty" title="No saved jobs" detail="Find a job and press Save this job." />}
      <ul className="space-y-2">
        {rows.map((app) => (
          <li key={app.id} className="card p-3">
            <Link className="font-medium underline" href={`/jobs/${encodeURIComponent(app.job.id)}`}>{app.job.title}</Link>
            <p className="text-[13px] text-[var(--muted)]">{app.job.company}</p>
            <Link className="text-[13px] underline" href={`/jobs/${encodeURIComponent(app.job.id)}`}>Make a resume</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
