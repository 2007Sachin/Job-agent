"use client";

import { CATALOG } from "@/lib/catalog";
import { scoreMatch } from "@/lib/match";
import { useStore } from "@/lib/store";
import Link from "next/link";

export default function DashboardPage() {
  const { profile, applications, outreach, feed } = useStore();
  const pool = feed.length ? feed : CATALOG;
  const matches = [...pool]
    .map((job) => ({ job, match: scoreMatch(profile, job) }))
    .sort((a, b) => b.match.score - a.match.score)
    .slice(0, 3);
  const due = outreach.filter((o) => o.followUpOn && o.followUpOn <= new Date().toISOString().slice(0, 10) && o.status !== "replied");
  const drafts = outreach.filter((o) => o.status === "draft" || o.status === "failed");
  const pending: string[] = [];
  if (!profile.resumeText) pending.push("Add a resume so drafts can quote your history.");
  if (!profile.emailConsent) pending.push("Record consent in Settings before any email can send.");
  if (drafts.length) pending.push(`${drafts.length} email draft${drafts.length === 1 ? "" : "s"} still unsent.`);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-5xl">Hello{profile.fullName ? `, ${profile.fullName.split(" ")[0]}` : ""}.</h1>
        <p className="mt-2 text-muted">{applications.length} role{applications.length === 1 ? "" : "s"} on the tracker. {profile.targetRoles.join(", ") || "Add target roles when you want the score to care."}</p>
      </div>
      <section>
        <h2 className="text-3xl">Closest matches on hand</h2>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {matches.map(({ job, match }) => (
            <li key={job.id} className="flex flex-wrap items-baseline justify-between gap-3 py-4">
              <div>
                <Link href={`/jobs/${encodeURIComponent(job.id)}`} className="text-lg underline">{job.title}</Link>
                <p className="text-sm text-muted">{job.company} · {job.location}</p>
              </div>
              <p className="text-sm">{match.score} match</p>
            </li>
          ))}
        </ul>
      </section>
      <section className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-3xl">Waiting on you</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {pending.length ? pending.map((p) => <li key={p}>{p}</li>) : <li className="text-muted">Nothing blocked.</li>}
          </ul>
        </div>
        <div>
          <h2 className="text-3xl">Follow-ups</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {due.length ? due.map((o) => (
              <li key={o.id}>{o.followUpOn}: {o.to} — {o.subject}</li>
            )) : <li className="text-muted">No follow-up dates due.</li>}
          </ul>
        </div>
      </section>
    </div>
  );
}
