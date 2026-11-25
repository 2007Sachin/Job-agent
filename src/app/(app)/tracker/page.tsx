"use client";

import { Kip } from "@/components/kip";
import { PageHeader } from "@/components/page-header";
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
  const { applications, setStage } = useStore();
  return (
    <div>
      <PageHeader title="My applications" lede="Move a card when the job changes. You still apply on the company site." action={<Link href="/jobs" className="btn bg-brass">Find jobs</Link>} />
      {!applications.length && (
        <div className="card mb-4 flex items-center gap-4 p-5">
          <Kip className="h-16 w-16" />
          <p>Nothing saved yet. Press Find jobs, open one, and press Save this job.</p>
        </div>
      )}
      <div className="mt-6 flex gap-3 overflow-x-auto pb-4">
        {STAGES.map((stage) => (
          <section
            key={stage}
            className="card min-w-[160px] flex-1 p-3"
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
