"use client";

import { ScreenState } from "@/components/screen-state";
import { useStore } from "@/lib/store";
import Link from "next/link";

export default function AutomationsPage() {
  const { schedules } = useStore();
  return (
    <div className="space-y-4">
      <h1 className="text-4xl">Automations</h1>
      <p>A routine writes a note at a time you pick. It does not send email or open a job site.</p>
      <ul className="space-y-2">
        {schedules.map((row) => <li key={row.id} className="card p-3">{row.name} · {row.time} · {row.enabled ? "On" : "Off"}</li>)}
        {!schedules.length && <ScreenState kind="empty" title="No routines" detail="A routine writes a note at a time you pick. It does not send email." />}
      </ul>
      <Link href="/schedules" className="underline">Edit reminders</Link>
    </div>
  );
}
