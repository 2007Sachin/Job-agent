"use client";

import { useState } from "react";

export default function FixtureJobPage() {
  const [note, setNote] = useState("");
  async function save() {
    const token = localStorage.getItem("jobagent.extensionToken") || "";
    const text = (sel: string) => document.querySelector(sel)?.textContent?.replace(/\s+/g, " ").trim() || "";
    const res = await fetch("/api/extension/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        title: text("[data-job-title]"),
        company: text("[data-job-company]"),
        location: text("[data-job-location]"),
        description: text("[data-job-description]"),
        url: location.href,
      }),
    });
    const json = await res.json();
    setNote(res.ok ? "Saved. Open Find jobs and press Check extension saves." : (json.error || "Could not save"));
  }
  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <p>This is a local stand-in for a job page. Nothing is read until you click Save.</p>
      <h1 data-job-title className="mt-4 text-4xl">Staff Nurse</h1>
      <p data-job-company className="mt-2 font-semibold">City Hospital</p>
      <p data-job-location>Pune</p>
      <p data-job-description className="mt-4">Ward shifts, patient notes, and family updates. Weekday mornings.</p>
      <button type="button" className="btn mt-6 bg-brass" onClick={() => void save()}>Save to Job-agent</button>
      {note && <p className="mt-3" role="status">{note}</p>}
    </main>
  );
}
