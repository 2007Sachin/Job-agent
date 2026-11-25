"use client";

import { ScreenState } from "@/components/screen-state";
import { useStore } from "@/lib/store";
import Link from "next/link";

export default function ResumesPage() {
  const { applications } = useStore();
  const rows = applications.filter((app) => app.tailoredResume.trim());
  return (
    <div className="space-y-4">
      <h1 className="text-[20px] font-semibold">Resumes</h1>
      {!rows.length && <ScreenState kind="empty" title="No resumes yet" detail="Open a saved job and press Make my resume." />}
      <ul className="space-y-2">
        {rows.map((app) => (
          <li key={app.id} className="card p-3">
            <Link className="underline" href={`/jobs/${encodeURIComponent(app.job.id)}`}>{app.job.title}</Link>
            <p className="mt-1 line-clamp-2 text-[13px] text-[var(--muted)]">{app.tailoredResume}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
