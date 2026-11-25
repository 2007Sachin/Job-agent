"use client";

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
        <h1 className="text-5xl">Jobs</h1>
        <p className="mt-2 max-w-[62ch] text-muted">Search is not tied to one function. Public sources plus a description you paste. Nothing is scraped from LinkedIn.</p>
      </div>
      <form onSubmit={search} className="flex flex-col gap-3 sm:flex-row">
        <label className="flex-1 text-sm">Role or keywords
          <input value={q} onChange={(e) => setQ(e.target.value)} className="mt-1 w-full border border-line bg-card px-3 py-2" placeholder="Any title or skill" />
        </label>
        <label className="flex-1 text-sm">Location
          <input value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 w-full border border-line bg-card px-3 py-2" placeholder="City, Remote, India" />
        </label>
        <button className="self-end bg-ink px-4 py-2 text-paper" disabled={loading}>{loading ? "Searching…" : "Search"}</button>
      </form>
      {warnings.length > 0 && (
        <ul className="text-sm text-muted">{warnings.map((w) => <li key={w}>{w}</li>)}</ul>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}
      {!rows.length && <p className="text-muted">Run a search. A demo catalog is included so the desk works offline from live APIs.</p>}
      <ul className="divide-y divide-line border-y border-line">
        {rows.map((job) => {
          const match = scoreMatch(profile, job);
          const saved = applications.some((a) => a.job.id === job.id);
          return (
            <li key={job.id} className="grid gap-2 py-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <Link href={`/jobs/${encodeURIComponent(job.id)}`} className="text-lg underline">{job.title}</Link>
                <p className="text-sm text-muted">{job.company} · {job.location} · {job.source}{job.salaryLabel ? ` · ${job.salaryLabel}` : ""}</p>
                <p className="mt-1 text-sm">{match.score} — {match.reasons[0]}</p>
              </div>
              <button type="button" className="border border-line px-3 py-2 text-sm" onClick={() => saveJob(job)} disabled={saved}>
                {saved ? "Saved" : "Save"}
              </button>
            </li>
          );
        })}
      </ul>
      <form onSubmit={ingest} className="space-y-3 border border-line p-4">
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
