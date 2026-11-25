"use client";

import { APP_CARDS, DRAWER_SECTIONS, prefsOf, withPrefs, type HelperPrefs } from "@/lib/helper-desk";
import { plainBot } from "@/lib/plain";
import { useStore } from "@/lib/store";
import type { BotDef } from "@/lib/workspace";
import { useMemo, useState } from "react";

export function HelperDrawer({ bot, onClose }: { bot: BotDef; onClose: () => void }) {
  const store = useStore();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState("overview");
  const prefs = prefsOf(bot);
  const needle = q.trim().toLowerCase();
  const sections = useMemo(
    () => DRAWER_SECTIONS.filter(([, label]) => !needle || label.toLowerCase().includes(needle)),
    [needle],
  );

  function save(patch: Partial<HelperPrefs> & Partial<Pick<BotDef, "name" | "role" | "model" | "temperature">>) {
    store.saveBot(withPrefs({ ...bot, ...patch }, patch));
  }

  return (
    <aside className="fixed inset-y-0 right-0 z-40 flex w-full max-w-[410px] flex-col bg-white shadow-xl">
      <div className="flex items-center justify-between px-4 py-4">
        <h2 className="text-base font-semibold">{plainBot(bot.name)}</h2>
        <button type="button" aria-label="Close" onClick={onClose}>✕</button>
      </div>
      <div className="px-4 pb-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="w-full rounded-full bg-[var(--rail)]" />
      </div>
      <div className="flex-1 overflow-y-auto">
        {sections.map(([id, label]) => (
          <section key={id} className={open === id ? "bg-black/[0.03]" : ""}>
            <button type="button" className="flex w-full items-center gap-2 border-b border-[var(--line)] px-4 py-3 text-left text-[13px]" onClick={() => setOpen(open === id ? "" : id)}>
              <span className="w-4 text-[var(--muted)]">○</span>
              <span className="flex-1">{label}</span>
              <span className="text-[var(--muted)]">⌄</span>
            </button>
            {open === id && (
              <div className="space-y-2 border-b border-[var(--line)] px-4 py-3 text-[13px] text-[var(--muted)]">
                {id === "overview" && <p>{plainBot(bot.name)} drafts words. {bot.role} It does not apply for you.</p>}
                {id === "identity" && (
                  <>
                    <input defaultValue={bot.name} onBlur={(e) => save({ name: e.target.value })} className="w-full bg-[var(--rail)]" />
                    <input defaultValue={bot.role} onBlur={(e) => save({ role: e.target.value })} className="w-full bg-[var(--rail)]" />
                  </>
                )}
                {id === "tone" && <textarea defaultValue={prefs.tone} onBlur={(e) => save({ tone: e.target.value })} rows={3} className="w-full bg-[var(--rail)]" />}
                {id === "skills" && <ul>{store.skills.filter((s) => bot.skillIds.includes(s.id)).map((s) => <li key={s.id}>{s.name}</li>)}</ul>}
                {id === "memory" && <MemoryList botId={bot.id} />}
                {id === "files" && <ul>{store.library.map((item) => <li key={item.id}>{item.name}</li>)}{!store.library.length && <li>No files yet.</li>}</ul>}
                {id === "routines" && <ul>{store.schedules.filter((s) => s.botId === bot.id).map((s) => <li key={s.id}>{s.name}</li>)}</ul>}
                {id === "apps" && <ul>{APP_CARDS.map((app) => <li key={app.id}>{app.name}</li>)}</ul>}
                {id === "model" && (
                  <>
                    <input defaultValue={bot.model} onBlur={(e) => save({ model: e.target.value })} className="w-full bg-[var(--rail)]" />
                    <input type="number" min={0} max={1} step={0.1} defaultValue={bot.temperature ?? 0.4} onBlur={(e) => save({ temperature: Number(e.target.value) })} className="w-full bg-[var(--rail)]" />
                  </>
                )}
                {id === "permissions" && <p>Email stays a draft until you approve it. This helper cannot submit an application.</p>}
                {id === "alerts" && <label className="flex gap-2 text-ink"><input type="checkbox" checked={prefs.notify} onChange={(e) => save({ notify: e.target.checked })} /> Show notes in Inbox</label>}
                {id === "visibility" && (
                  <select value={prefs.visibility} onChange={(e) => save({ visibility: e.target.value as HelperPrefs["visibility"] })} className="w-full bg-[var(--rail)]">
                    <option value="only-me">Only me</option>
                    <option value="invited">People I invite</option>
                  </select>
                )}
                {id === "history" && <ul>{store.activity.slice(0, 6).map((item) => <li key={item.id}>{item.text}</li>)}</ul>}
              </div>
            )}
          </section>
        ))}
      </div>
    </aside>
  );
}

function MemoryList({ botId }: { botId: string }) {
  const store = useStore();
  const [text, setText] = useState("");
  const rows = store.memories.filter((m) => m.botId === botId);
  return (
    <div className="space-y-2 text-ink">
      {rows.map((fact) => (
        <p key={fact.id} className="flex justify-between gap-2"><span>{fact.text}</span><button type="button" onClick={() => store.deleteMemory(fact.id)}>Forget</button></p>
      ))}
      <form onSubmit={(e) => { e.preventDefault(); if (!text.trim()) return; store.saveMemory({ id: crypto.randomUUID(), botId, text: text.trim(), updatedAt: new Date().toISOString() }); setText(""); }} className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} className="w-full bg-[var(--rail)]" placeholder="A fact" />
        <button className="border border-[var(--line)]">Save</button>
      </form>
    </div>
  );
}
