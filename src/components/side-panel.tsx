"use client";

import { boardSearchLinks } from "@/lib/board-search";
import { WORKS_ON, prefsOf, withPrefs, type WorksOn } from "@/lib/helper-desk";
import { useStore } from "@/lib/store";
import type { BotDef } from "@/lib/workspace";
import Link from "next/link";
import { useEffect, useState } from "react";

const TABS = ["Screen", "Routines", "Browser", "Data"] as const;

export function SidePanel({ bot }: { bot: BotDef }) {
  const store = useStore();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Screen");
  const prefs = prefsOf(bot);
  const [saved, setSaved] = useState<{ name: string }[]>([]);

  useEffect(() => {
    try {
      const rows = JSON.parse(localStorage.getItem("jobagent.savedSearches") || "[]") as { name: string }[];
      setSaved(rows);
    } catch {
      setSaved([]);
    }
  }, []);

  function setWorks(worksOn: WorksOn) {
    store.saveBot(withPrefs(bot, { worksOn }));
  }

  function setScreen(screen: "idle" | "stopped" | "active") {
    store.saveBot(withPrefs(bot, { screen }));
    store.logActivity(`${bot.name} is ${screen}. Nothing was sent.`);
  }

  return (
    <aside className="border-t border-line md:border-l md:border-t-0">
      <div className="flex gap-1 overflow-x-auto border-b border-line px-2 py-2">
        {TABS.map((name) => (
          <button key={name} type="button" className={`min-h-11 px-3 ${tab === name ? "bg-ink text-paper" : ""}`} onClick={() => setTab(name)}>{name}</button>
        ))}
      </div>
      <div className="space-y-3 p-4 text-sm">
        {tab === "Screen" && (
          <>
            <p>Status: {prefs.screen === "active" ? "Active" : prefs.screen === "stopped" ? "Stopped" : "Idle"}.</p>
            <p>Starting only marks this helper as ready to draft. It does not open LinkedIn or click anything.</p>
            <button type="button" className="bg-brass" onClick={() => setScreen(prefs.screen === "active" ? "idle" : "active")}>{prefs.screen === "active" ? "Stop" : "Start"}</button>
          </>
        )}
        {tab === "Routines" && (
          <ul className="space-y-2">
            {store.schedules.filter((row) => row.botId === bot.id).map((row) => <li key={row.id}>{row.name} · {row.time} · {row.enabled ? "On" : "Off"}</li>)}
            {!store.schedules.some((row) => row.botId === bot.id) && <li>No routines. Add one under Automations.</li>}
          </ul>
        )}
        {tab === "Browser" && (
          <>
            <p>These open in your tab. We do not load the page.</p>
            <ul className="space-y-1">
              {boardSearchLinks({ keywords: store.profile.targetRoles[0] || "", location: store.profile.locations[0] || "", remote: false, experience: "", posted: "", easyApply: false }).map((link) => (
                <li key={link.id}><a className="underline" href={link.url} target="_blank" rel="noreferrer">{link.name}</a></li>
              ))}
            </ul>
            {saved.length > 0 && <p>Saved searches: {saved.map((row) => row.name).join(", ")}</p>}
          </>
        )}
        {tab === "Data" && (
          <ul className="space-y-1">
            {store.applications.slice(0, 6).map((app) => <li key={app.id}><Link className="underline" href={`/jobs/${encodeURIComponent(app.job.id)}`}>{app.job.title}</Link></li>)}
            {!store.applications.length && <li>No saved jobs yet.</li>}
            <li><Link className="underline" href="/settings">Export your data</Link></li>
          </ul>
        )}
        <fieldset className="space-y-2 border border-line p-3">
          <legend className="px-1">Works on</legend>
          {WORKS_ON.map((choice) => (
            <label key={choice.id} className="block">
              <input type="radio" name="works" checked={prefs.worksOn === choice.id} onChange={() => setWorks(choice.id)} /> {choice.title}
              <span className="mt-1 block text-muted">{choice.detail}</span>
            </label>
          ))}
        </fieldset>
      </div>
    </aside>
  );
}
