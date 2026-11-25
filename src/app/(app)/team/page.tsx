"use client";

import { HelperMark } from "@/components/helper-mark";
import { liveStatus } from "@/lib/helper-desk";
import { plainBot } from "@/lib/plain";
import { useStore } from "@/lib/store";
import Link from "next/link";

export default function TeamPage() {
  const { bots, skills } = useStore();
  return (
    <div className="space-y-4">
      <h1 className="text-4xl">Team map</h1>
      <p>Each helper has one job. You still send the email and submit the application.</p>
      <ul className="space-y-3">
        {bots.map((bot) => (
          <li key={bot.id} className="card flex gap-3 p-4">
            <HelperMark name={plainBot(bot.name)} />
            <div>
              <Link href={`/chat?helper=${bot.id}`} className="font-semibold underline">{plainBot(bot.name)}</Link>
              <p>{bot.role}</p>
              <p className="text-sm text-muted">{liveStatus(bot)} · {bot.skillIds.map((id) => skills.find((s) => s.id === id)?.name).filter(Boolean).join(", ")}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
