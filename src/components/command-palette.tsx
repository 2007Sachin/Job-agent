"use client";

import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const links = [
  ["/dashboard", "Home"],
  ["/chat", "Chat"],
  ["/jobs", "Jobs"],
  ["/tracker", "Applications"],
  ["/analytics", "Insights"],
  ["/bots", "Bots"],
  ["/skills", "Skills"],
  ["/connectors", "Connectors"],
  ["/schedules", "Routines"],
  ["/workspace", "Memory and usage"],
  ["/library", "Library"],
  ["/rooms", "Rooms"],
  ["/settings", "Settings"],
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const router = useRouter();
  const { messages } = useStore();
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    function onSearch() { setOpen(true); }
    window.addEventListener("keydown", onKey);
    window.addEventListener("jobagent-search", onSearch);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("jobagent-search", onSearch);
    };
  }, []);
  const hits = useMemo(() => {
    const query = q.trim().toLowerCase();
    const pages = links.filter(([, label]) => label.toLowerCase().includes(query));
    const chats = messages.filter((m) => m.content.toLowerCase().includes(query)).slice(0, 5);
    return { pages, chats };
  }, [q, messages]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 px-4 pt-24" onClick={() => setOpen(false)}>
      <div className="glass w-full max-w-lg p-3" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Command palette">
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Jump or search chats" className="w-full border border-line bg-paper px-3 py-2" />
        <ul className="mt-2 max-h-80 overflow-auto text-sm">
          {hits.pages.map(([href, label]) => (
            <li key={href}>
              <button type="button" className="w-full px-2 py-2 text-left" onClick={() => { router.push(href); setOpen(false); }}>{label}</button>
            </li>
          ))}
          {hits.chats.map((m) => (
            <li key={m.id} className="px-2 py-2 text-muted">{m.content.slice(0, 120)}</li>
          ))}
        </ul>
        <p className="px-2 pt-2 text-xs text-muted">Ctrl or Cmd K opens this. Esc closes it.</p>
      </div>
    </div>
  );
}
