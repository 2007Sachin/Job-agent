"use client";

import { ScreenState } from "@/components/screen-state";
import { APP_CARDS } from "@/lib/helper-desk";
import { plainBot } from "@/lib/plain";
import { useStore } from "@/lib/store";
import { useEffect, useState } from "react";

type Row = { id: string; status: "connected" | "not-connected" | "needs-reauth"; helpers: string[] };

const KEY = "jobagent.apps";

export default function AppsPage() {
  const { bots, user } = useStore();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(KEY) || "[]") as Row[];
    setRows(APP_CARDS.map((card) => saved.find((row) => row.id === card.id) || { id: card.id, status: "not-connected", helpers: [] }));
  }, []);

  function write(next: Row[]) {
    setRows(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    if (user?.mode === "supabase") {
      void fetch("/api/apps", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rows: next }) });
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-4xl">Connected apps</h1>
      <p>Google can connect when its keys are set. Other cards remember a choice on this device until a live account is available. Job sites open in your tab only.</p>
      {!rows.length && <ScreenState kind="loading" title="Loading apps" detail="Reading connections on this device." />}
      <ul className="space-y-3">
        {APP_CARDS.map((card) => {
          const row = rows.find((item) => item.id === card.id) || { id: card.id, status: "not-connected" as const, helpers: [] };
          return (
            <li key={card.id} className="card space-y-2 p-4">
              <h2 className="text-2xl">{card.name}</h2>
              <p>{card.plain}</p>
              <p className="text-sm text-muted">Access: {card.scopes}</p>
              <p>Status: {card.kind === "link" ? "Opens in your tab" : "Not connected"}</p>
              <div className="flex flex-wrap gap-2">
                {card.id === "gmail" && <a className="btn bg-brass" href="/api/email/gmail/start">Connect Gmail</a>}
                {card.id !== "gmail" && card.kind === "oauth" && <p className="text-[13px] text-[var(--muted)]">Coming soon</p>}
              </div>
              <fieldset>
                <legend className="text-sm">Which helpers may use this</legend>
                {bots.map((bot) => (
                  <label key={bot.id} className="mr-3 inline-flex items-center gap-1 text-sm">
                    <input type="checkbox" checked={row.helpers.includes(bot.id)} onChange={(e) => write(rows.map((item) => item.id === card.id ? { ...item, helpers: e.target.checked ? [...item.helpers, bot.id] : item.helpers.filter((id) => id !== bot.id) } : item))} />
                    {plainBot(bot.name)}
                  </label>
                ))}
              </fieldset>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
