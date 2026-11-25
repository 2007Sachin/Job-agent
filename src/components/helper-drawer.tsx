"use client";

import { HelperMark } from "./helper-mark";
import { APP_CARDS, DRAWER_SECTIONS, prefsOf, withPrefs, type HelperPrefs } from "@/lib/helper-desk";
import { plainBot } from "@/lib/plain";
import { useStore } from "@/lib/store";
import type { BotDef } from "@/lib/workspace";
import { useMemo, useState } from "react";

export function HelperDrawer({ bot, onClose }: { bot: BotDef; onClose: () => void }) {
  const store = useStore();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string>("overview");
  const prefs = prefsOf(bot);
  const needle = q.trim().toLowerCase();
  const sections = useMemo(
    () => DRAWER_SECTIONS.filter(([, label]) => !needle || label.toLowerCase().includes(needle)),
    [needle],
  );

  function save(patch: Partial<HelperPrefs> & Partial<Pick<BotDef, "name" | "role" | "model" | "temperature" | "systemPrompt">>) {
    store.saveBot(withPrefs({ ...bot, ...patch }, patch));
    store.logActivity(`Updated ${plainBot(bot.name)}.`);
  }

  return (
    <aside className="fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col border-l border-line bg-card shadow-xl">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="text-xl">Helper profile</h2>
        <button type="button" className="underline" onClick={onClose}>Close</button>
      </div>
      <label className="px-4 py-3 text-sm">Search this profile
        <input value={q} onChange={(e) => setQ(e.target.value)} className="mt-1 w-full border border-line px-3 py-2" placeholder="Try memory or model" />
      </label>
      <div className="flex-1 space-y-2 overflow-y-auto px-4 pb-8">
        {sections.map(([id, label]) => (
          <section key={id} className="border border-line">
            <button type="button" className="flex min-h-11 w-full items-center justify-between px-3 text-left" onClick={() => setOpen(open === id ? "" : id)} aria-expanded={open === id}>
              {label}
              <span aria-hidden>{open === id ? "–" : "+"}</span>
            </button>
            {open === id && (
              <div className="space-y-3 border-t border-line px-3 py-3 text-sm">
                {id === "overview" && (
                  <p>{plainBot(bot.name)} drafts words for you. {bot.role} It does not apply or send mail unless you approve that step.</p>
                )}
                {id === "identity" && (
                  <>
                    <HelperMark name={plainBot(bot.name)} />
                    <label className="block">Name
                      <input defaultValue={bot.name} onBlur={(e) => save({ name: e.target.value })} className="mt-1 w-full border border-line px-2 py-2" />
                    </label>
                    <label className="block">Role
                      <input defaultValue={bot.role} onBlur={(e) => save({ role: e.target.value })} className="mt-1 w-full border border-line px-2 py-2" />
                    </label>
                  </>
                )}
                {id === "tone" && (
                  <label className="block">How it should sound
                    <textarea defaultValue={prefs.tone} onBlur={(e) => save({ tone: e.target.value })} rows={3} className="mt-1 w-full border border-line px-2 py-2" />
                  </label>
                )}
                {id === "skills" && (
                  <ul>{store.skills.filter((s) => bot.skillIds.includes(s.id)).map((s) => <li key={s.id}>{s.name}. {s.description}</li>)}</ul>
                )}
                {id === "memory" && <MemoryList botId={bot.id} />}
                {id === "files" && (
                  <ul>{store.library.map((item) => <li key={item.id}>{item.name}</li>)}{!store.library.length && <li>No files yet.</li>}</ul>
                )}
                {id === "routines" && (
                  <ul>{store.schedules.filter((s) => s.botId === bot.id).map((s) => <li key={s.id}>{s.name} at {s.time}</li>)}{!store.schedules.some((s) => s.botId === bot.id) && <li>No routines for this helper.</li>}</ul>
                )}
                {id === "apps" && (
                  <ul>{APP_CARDS.map((app) => <li key={app.id}>{app.name}: {app.plain}</li>)}</ul>
                )}
                {id === "model" && (
                  <>
                    <label className="block">Model nickname or id
                      <input defaultValue={bot.model} onBlur={(e) => save({ model: e.target.value })} className="mt-1 w-full border border-line px-2 py-2" />
                    </label>
                    <label className="block">Temperature
                      <input type="number" min={0} max={1} step={0.1} defaultValue={bot.temperature ?? 0.4} onBlur={(e) => save({ temperature: Number(e.target.value) })} className="mt-1 w-full border border-line px-2 py-2" />
                    </label>
                    <p>Free providers go through LLM_BASE_URL. A nickname such as Groq stays local until it is a real model id.</p>
                  </>
                )}
                {id === "permissions" && (
                  <>
                    <label className="flex gap-2"><input type="checkbox" checked={prefs.approveEmail} onChange={(e) => save({ approveEmail: e.target.checked })} /> Ask before any email is treated as ready</label>
                    <p>This helper cannot submit an application. That stays off.</p>
                  </>
                )}
                {id === "alerts" && (
                  <label className="flex gap-2"><input type="checkbox" checked={prefs.notify} onChange={(e) => save({ notify: e.target.checked })} /> Show this helper in Inbox</label>
                )}
                {id === "visibility" && (
                  <label className="block">Who can use this helper
                    <select value={prefs.visibility} onChange={(e) => save({ visibility: e.target.value as HelperPrefs["visibility"] })} className="mt-1 w-full border border-line px-2 py-2">
                      <option value="only-me">Only me</option>
                      <option value="invited">People I invite</option>
                    </select>
                  </label>
                )}
                {id === "history" && (
                  <ul>{store.activity.slice(0, 8).map((item) => <li key={item.id}>{item.text}</li>)}{!store.activity.length && <li>No activity yet.</li>}</ul>
                )}
              </div>
            )}
          </section>
        ))}
        {!sections.length && <p>No section matches that search.</p>}
      </div>
    </aside>
  );
}

function MemoryList({ botId }: { botId: string }) {
  const store = useStore();
  const [text, setText] = useState("");
  const rows = store.memories.filter((m) => m.botId === botId);
  return (
    <div className="space-y-2">
      {rows.map((fact) => (
        <p key={fact.id} className="flex justify-between gap-2">
          <span>{fact.text}</span>
          <button type="button" className="underline" onClick={() => store.deleteMemory(fact.id)}>Forget</button>
        </p>
      ))}
      {!rows.length && <p>No facts yet.</p>}
      <form onSubmit={(e) => { e.preventDefault(); if (!text.trim()) return; store.saveMemory({ id: crypto.randomUUID(), botId, text: text.trim(), updatedAt: new Date().toISOString() }); setText(""); }} className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} className="w-full border border-line px-2 py-2" placeholder="A fact to remember" />
        <button className="border border-line px-2">Save</button>
      </form>
    </div>
  );
}
