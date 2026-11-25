"use client";

import { boardSearchLinks } from "@/lib/board-search";
import { WORKS_ON, prefsOf, withPrefs, type WorksOn } from "@/lib/helper-desk";
import { plainBot } from "@/lib/plain";
import { useStore } from "@/lib/store";
import type { BotDef } from "@/lib/workspace";
import Link from "next/link";
import { useEffect, useState } from "react";

const TABS = ["Screen", "Routines", "Browser", "Data"] as const;

export function SidePanel({ bot, onClose }: { bot: BotDef; onClose: () => void }) {
  const store = useStore();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Screen");
  const prefs = prefsOf(bot);
  const [saved, setSaved] = useState<{ name: string }[]>([]);
  useEffect(() => {
    try { setSaved(JSON.parse(localStorage.getItem("jobagent.savedSearches") || "[]")); } catch { setSaved([]); }
  }, []);

  function setWorks(worksOn: WorksOn) {
    store.saveBot(withPrefs(bot, { worksOn }));
  }
  function setScreen(screen: "idle" | "stopped" | "active") {
    store.saveBot(withPrefs(bot, { screen }));
  }

  return (
    <aside className="flex h-full w-full flex-col border-l border-[var(--line)] bg-white max-md:border-t md:w-[400px]">
      <div className="flex items-center gap-2 px-3 py-3">
        <span aria-hidden className="text-[var(--muted)]">⚙</span>
        <div className="flex flex-1 rounded-full bg-[var(--rail)] p-1">
          {TABS.map((name) => (
            <button key={name} type="button" className={`flex-1 rounded-full px-2 py-1 text-[12px] ${tab === name ? "bg-white shadow-sm" : "text-[var(--muted)]"}`} onClick={() => setTab(name)}>{name}</button>
          ))}
        </div>
        <button type="button" aria-label="Close panel" onClick={onClose}>✕</button>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-6 text-[13px]">
        {tab === "Screen" && (
          <>
            <p className="text-[var(--muted)]">{plainBot(bot.name)}&apos;s screen</p>
            <div className="rounded-2xl bg-[var(--rail)] p-6 text-center">
              <p className="text-2xl" aria-hidden>▢</p>
              <p className="mt-2 font-semibold">{prefs.screen === "active" ? "The workspace is on" : "The workspace is paused"}</p>
              <p className="mt-1 text-[var(--muted)]">Starting only lets this helper draft. It does not open LinkedIn or click anything.</p>
              <button type="button" className="mt-3 border border-[var(--line)] bg-white" onClick={() => setScreen(prefs.screen === "active" ? "idle" : "active")}>{prefs.screen === "active" ? "Pause workspace" : "Start workspace"}</button>
            </div>
          </>
        )}
        {tab === "Routines" && (
          <ul>{store.schedules.filter((row) => row.botId === bot.id).map((row) => <li key={row.id}>{row.name} · {row.time}</li>)}{!store.schedules.some((row) => row.botId === bot.id) && <li className="text-[var(--muted)]">No routines yet.</li>}</ul>
        )}
        {tab === "Browser" && (
          <ul className="space-y-1">
            {boardSearchLinks({ keywords: store.profile.targetRoles[0] || "", location: store.profile.locations[0] || "", remote: false, experience: "", posted: "", easyApply: false }).map((link) => (
              <li key={link.id}><a className="underline" href={link.url} target="_blank" rel="noreferrer">{link.name}</a></li>
            ))}
            {saved.map((row) => <li key={row.name} className="text-[var(--muted)]">{row.name}</li>)}
          </ul>
        )}
        {tab === "Data" && (
          <ul className="space-y-1">
            {store.applications.slice(0, 6).map((app) => <li key={app.id}><Link className="underline" href={`/jobs/${encodeURIComponent(app.job.id)}`}>{app.job.title}</Link></li>)}
            {!store.applications.length && <li className="text-[var(--muted)]">No saved jobs yet.</li>}
          </ul>
        )}
        <div>
          <p className="font-semibold">Works on</p>
          <p className="text-[var(--muted)]">Choose where this helper works.</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {WORKS_ON.map((choice) => {
              const on = prefs.worksOn === choice.id;
              return (
                <button key={choice.id} type="button" onClick={() => setWorks(choice.id)} className={`rounded-xl p-3 text-left text-[12px] ${on ? "border border-blue-500 bg-blue-50" : "border border-transparent bg-[var(--rail)]"}`}>
                  <span className="block font-semibold text-ink">{on ? "✓ " : ""}{choice.title}</span>
                  <span className="mt-1 block text-[var(--muted)]">{choice.detail}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
