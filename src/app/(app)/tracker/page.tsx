"use client";

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
      <PageHeader title="Applications" lede="Drag a card, or use the stage menu. The employer site is still where you submit." action={<Link href="/jobs" className="border border-line px-3 py-2 text-sm">Add from Jobs</Link>} />
      <div className="mt-6 flex gap-3 overflow-x-auto pb-4">
        {STAGES.map((stage) => (
          <section
            key={stage}
            className="min-w-[220px] flex-1 border border-line p-3"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const id = e.dataTransfer.getData("text/plain");
              if (id) setStage(id, stage);
            }}
          >
            <h2 className="text-xl">{labels[stage]}</h2>
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
