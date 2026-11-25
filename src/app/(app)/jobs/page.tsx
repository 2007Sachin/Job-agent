"use client";

import { Kip } from "@/components/kip";
import { scoreMatch } from "@/lib/match";
import { useStore } from "@/lib/store";
import type { Job } from "@/lib/types";
import Link from "next/link";
import { useState } from "react";

export default function JobsPage() {
  const { profile, feed, setFeed, saveJob, applications } = useStore();
  const [q, setQ] = useState(profile.targetRoles[0] ?? "");
  const [location, setLocation] = useState(profile.locations[0] ?? "");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paste, setPaste] = useState({ url: "", title: "", company: "", description: "" });

  async function search(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/jobs?q=${encodeURIComponent(q)}&location=${encodeURIComponent(location)}`);
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError("Search failed");
      return;
    }
    setFeed(json.jobs);
    setWarnings(json.warnings ?? []);
  }

  async function ingest(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/jobs/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paste),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Could not add that job");
      return;
    }
    const job = json.job as Job;
    setFeed([job, ...feed.filter((j) => j.id !== job.id)]);
    saveJob(job);
  }

  const rows = feed.length ? feed : [];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl">Find jobs</h1>
        <p className="mt-2 max-w-[62ch]">Type the work you want. We search public job lists. We do not open LinkedIn for you.</p>
      </div>
      <form onSubmit={search} className="flex flex-col gap-3 sm:flex-row">
        <label className="flex-1 text-sm">Role or keywords
          <input value={q} onChange={(e) => setQ(e.target.value)} className="mt-1 w-full border border-line bg-card px-3 py-2" placeholder="Any title or skill" />
        </label>
        <label className="flex-1 text-sm">Location
          <input value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 w-full border border-line bg-card px-3 py-2" placeholder="City, Remote, India" />
        </label>
        <button className="self-end bg-brass" disabled={loading}>{loading ? "Looking…" : "Find jobs"}</button>
      </form>
      {warnings.length > 0 && (
        <ul className="text-sm text-muted">{warnings.map((w) => <li key={w}>{w}</li>)}</ul>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}
      {!rows.length && (
        <div className="card flex items-center gap-4 p-5">
          <Kip className="h-16 w-16" />
          <p>No jobs yet. Press Find jobs, or paste a job description below.</p>
        </div>
      )}
      <ul className="space-y-3">
        {rows.map((job) => {
          const match = scoreMatch(profile, job);
          const saved = applications.some((a) => a.job.id === job.id);
          const letters = job.company.split(/\s+/).slice(0, 2).map((w) => w[0] || "").join("").toUpperCase();
          const ring = 2 * Math.PI * 16;
          return (
            <li key={job.id} className="card grid gap-3 p-4 md:grid-cols-[auto_1fr_auto_auto] md:items-center">
              <div className="avatar" aria-hidden>{letters}</div>
              <div>
                <Link href={`/jobs/${encodeURIComponent(job.id)}`} className="text-lg font-semibold underline">{job.title}</Link>
                <p className="text-sm text-muted">{job.company} · {job.location} · {job.source}{job.salaryLabel ? ` · ${job.salaryLabel}` : ""}</p>
                <p className="mt-1 text-sm">{match.reasons[0]}</p>
              </div>
              <svg width="44" height="44" viewBox="0 0 44 44" aria-label={`${match.score} match`}>
                <circle cx="22" cy="22" r="16" fill="none" stroke="var(--line)" strokeWidth="4" />
                <circle cx="22" cy="22" r="16" fill="none" stroke="var(--brass)" strokeWidth="4" strokeDasharray={ring} strokeDashoffset={ring * (1 - match.score / 100)} transform="rotate(-90 22 22)" />
                <text x="22" y="26" textAnchor="middle" fontSize="11" fill="currentColor">{match.score}</text>
              </svg>
              <button type="button" className="border border-line px-3 py-2 text-sm" onClick={() => saveJob(job)} disabled={saved}>
                {saved ? "Saved" : "Save"}
              </button>
            </li>
          );
        })}
      </ul>
      <form onSubmit={ingest} className="card space-y-3 p-4">
        <h2 className="text-3xl">Add a posting you already have</h2>
        <p className="text-sm text-muted">Greenhouse and Lever URLs can be read from their public APIs. Anything else needs the description pasted. LinkedIn URLs are refused.</p>
        <input value={paste.url} onChange={(e) => setPaste({ ...paste, url: e.target.value })} placeholder="Job URL (optional)" className="w-full border border-line bg-card px-3 py-2" />
        <div className="grid gap-3 sm:grid-cols-2">
          <input value={paste.title} onChange={(e) => setPaste({ ...paste, title: e.target.value })} placeholder="Title" className="border border-line bg-card px-3 py-2" />
          <input value={paste.company} onChange={(e) => setPaste({ ...paste, company: e.target.value })} placeholder="Employer" className="border border-line bg-card px-3 py-2" />
        </div>
        <textarea value={paste.description} onChange={(e) => setPaste({ ...paste, description: e.target.value })} rows={5} placeholder="Paste the job description" className="w-full border border-line bg-card px-3 py-2" />
        <button className="bg-brass px-4 py-2 text-paper" type="submit">Add to tracker</button>
      </form>
    </div>
  );
}
