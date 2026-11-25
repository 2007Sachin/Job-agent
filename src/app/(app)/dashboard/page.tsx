"use client";

import { useStore } from "@/lib/store";
import Link from "next/link";
import { useState } from "react";

export default function HomePage() {
  const { applications, outreach, profile } = useStore();
  const [role, setRole] = useState(profile.targetRoles[0] || "");
  const [location, setLocation] = useState(profile.locations[0] || "");
  const today = new Date().toISOString().slice(0, 10);
  const due = outreach.filter((item) => item.followUpOn && item.followUpOn <= today && item.status !== "replied");
  const resumes = applications.filter((app) => app.tailoredResume.trim());
  const recent = applications.slice(0, 3);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[20px] font-semibold">Find a job</h1>
        <p className="mt-1 text-[13px] text-[var(--muted)]">Search, save it, make a resume, then follow up.</p>
      </div>
      <form action="/jobs" className="flex flex-col gap-2 sm:flex-row">
        <input name="q" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role" className="w-full bg-white" />
        <input name="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" className="w-full bg-white" />
        <button className="whitespace-nowrap bg-brass" type="submit">Find a job</button>
      </form>
      <section>
        <h2 className="text-[16px] font-medium">Saved recently</h2>
        {!recent.length && <p className="mt-2 text-[13px] text-[var(--muted)]">None yet. Find a job, then save it.</p>}
        <ul className="mt-2 space-y-2">
          {recent.map((app) => (
            <li key={app.id}><Link className="underline" href={`/jobs/${encodeURIComponent(app.job.id)}`}>{app.job.title}</Link> <span className="text-[13px] text-[var(--muted)]">{app.job.company}</span></li>
          ))}
        </ul>
        <Link href="/saved" className="mt-2 inline-block text-[13px] underline">All saved jobs</Link>
      </section>
      <section>
        <h2 className="text-[16px] font-medium">Follow-ups due</h2>
        {!due.length && <p className="mt-2 text-[13px] text-[var(--muted)]">None due.</p>}
        <ul className="mt-2 space-y-1">
          {due.map((item) => <li key={item.id}>{item.followUpOn}: {item.subject || "No subject"}</li>)}
        </ul>
        <Link href="/follow-ups" className="mt-2 inline-block text-[13px] underline">Open follow-ups</Link>
      </section>
      <section>
        <h2 className="text-[16px] font-medium">Resumes made</h2>
        {!resumes.length && <p className="mt-2 text-[13px] text-[var(--muted)]">None yet. Open a saved job and make a resume.</p>}
        <ul className="mt-2 space-y-1">
          {resumes.slice(0, 3).map((app) => (
            <li key={app.id}><Link className="underline" href={`/jobs/${encodeURIComponent(app.job.id)}`}>{app.job.title}</Link></li>
          ))}
        </ul>
        <Link href="/resumes" className="mt-2 inline-block text-[13px] underline">All resumes</Link>
      </section>
    </div>
  );
}
