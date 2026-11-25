"use client";

import { ScreenState } from "@/components/screen-state";
import { PageHeader } from "@/components/page-header";
import { formatFollowUpDate, followUpTiming } from "@/lib/follow-up";
import { useStore } from "@/lib/store";
import { STAGES, type Stage } from "@/lib/types";
import Link from "next/link";

const labels: Record<Stage, string> = {
  saved: "Saved",
  applied: "Applied",
  interviewing: "Interviewing",
  offer: "Offer",
  rejected: "Rejected",
};

export default function TrackerPage() {
  const { applications, setStage, outreach, patchOutreach } = useStore();
  const due = outreach.filter((o) => o.followUpOn && o.status !== "replied");
  return (
    <div>
      <PageHeader title="My applications" lede="Move a card when the job changes. You still apply on the company site." action={<Link href="/jobs" className="btn bg-brass">Find jobs</Link>} />
      {due.length === 0 && <p className="mb-4 text-sm text-muted">No follow-ups due. Set a date on a note when you want a reminder.</p>}
      {due.length > 0 && (
        <section className="card mb-4 p-4">
          <h2 className="text-xl">Follow-ups due</h2>
          <ul className="mt-2 space-y-1">
            {due.map((o) => {
              const app = applications.find((row) => row.id === o.applicationId);
              const href = app ? `/jobs/${encodeURIComponent(app.job.id)}` : "/follow-ups";
              const timing = o.followUpOn ? followUpTiming(o.followUpOn) : "";
              return (
                <li key={o.id} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Link className="underline" href={href}>{o.subject || app?.job.title || "No subject"}</Link>
                  <span className="text-sm text-muted">{o.followUpOn ? formatFollowUpDate(o.followUpOn) : ""}{timing ? ` · ${timing}` : ""}</span>
                  <button type="button" className="text-sm underline" onClick={() => patchOutreach(o.id, { followUpOn: null })}>Mark done</button>
                  <Link className="text-sm underline" href={href}>Open job</Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
      {!applications.length && (
        <div className="mb-4">
          <ScreenState kind="empty" title="No applications yet" detail="Find a job, open it, and press Save this job." />
        </div>
      )}
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {STAGES.map((stage) => (
          <section
            key={stage}
            className="card min-w-0 p-3"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const id = e.dataTransfer.getData("text/plain");
              if (id) setStage(id, stage);
            }}
          >
            <h2 className="text-xl"><span className="chip">{labels[stage]}</span></h2>
            <ul className="mt-3 space-y-3">
              {applications.filter((a) => a.stage === stage).map((a) => (
                <li key={a.id} draggable onDragStart={(e) => e.dataTransfer.setData("text/plain", a.id)} className="cursor-grab bg-card p-3">
                  <Link href={`/jobs/${encodeURIComponent(a.job.id)}`} className="underline">{a.job.title}</Link>
                  <p className="text-sm text-muted">{a.job.company}</p>
                  <label className="mt-2 block text-xs text-muted">
                    Stage
                    <select value={a.stage} onChange={(e) => setStage(a.id, e.target.value as Stage)} className="mt-1 w-full border border-line bg-paper px-1 py-1">
                      {STAGES.map((s) => <option key={s} value={s}>{labels[s]}</option>)}
                    </select>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
