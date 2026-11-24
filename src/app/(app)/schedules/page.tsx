"use client";

import { useStore } from "@/lib/store";
import { useState } from "react";

export default function SchedulesPage() {
  const store = useStore();
  const [name, setName] = useState("Morning job scout");
  return (
    <div className="space-y-6">
      <h1 className="text-5xl">Schedules</h1>
      <p className="max-w-[65ch] text-muted">Routines are saved here. There is no background worker in this deploy, so nothing runs while the tab is closed. Use Run now to do the prompt once and log it.</p>
      <ul className="divide-y divide-line border-y border-line">
        {store.schedules.map((job) => (
          <li key={job.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div>
              <p>{job.name}</p>
              <p className="text-sm text-muted">{job.time} · {store.bots.find((b) => b.id === job.botId)?.name} · {job.prompt}</p>
              <p className="text-xs text-muted">Last run {job.lastRun ?? "never"} · worker stub</p>
            </div>
            <button type="button" className="border border-line px-3 py-2" onClick={() => {
              store.saveSchedule({ ...job, lastRun: new Date().toISOString() });
              store.saveTask({ id: crypto.randomUUID(), title: job.prompt, status: "todo", botId: job.botId, updatedAt: new Date().toISOString() });
              store.logActivity(`Ran schedule “${job.name}” on demand.`);
            }}>Run now</button>
          </li>
        ))}
      </ul>
      <form className="space-y-3 border border-line p-4" onSubmit={(e) => {
        e.preventDefault();
        store.saveSchedule({ id: crypto.randomUUID(), name, botId: "bot-scout", prompt: "Find new roles that match the profile.", time: "09:00", enabled: true, lastRun: null });
      }}>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-line bg-card px-3 py-2" />
        <button className="bg-ink px-3 py-2 text-paper">Save a 9:00 routine</button>
      </form>
    </div>
  );
}
