"use client";

import { connectors } from "@/lib/connectors";
import { useStore } from "@/lib/store";

export default function ConnectorsPage() {
  const { profile } = useStore();
  const rows = connectors({});
  const q = profile.targetRoles[0] || "jobs";
  const loc = profile.locations[0] || "India";
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-5xl">Connectors</h1>
        <p className="mt-2 max-w-[65ch] text-muted">
          API rows call a public feed. Assist rows open the site with your words and wait for you to paste a description. Nothing here stores a password, scrapes a page, or clicks apply.
        </p>
      </div>
      <ul className="divide-y divide-line border-y border-line">
        {rows.map((row) => (
          <li key={row.id} className="grid gap-2 py-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="text-2xl">{row.name}</h2>
              <p className="text-sm">{row.mode === "api" ? "API" : "Assist only"} · {row.status}</p>
              <p className="mt-1 text-sm text-muted">{row.note}</p>
              <p className="mt-1 text-xs text-muted">
                Search {row.search ? "yes" : "no"} · Detail {row.detail ? "yes" : "no"} · Apply assist {row.applyAssist ? "yes" : "no"} · Message draft {row.messageDraft ? "yes" : "no"}
              </p>
            </div>
            <a className="border border-line px-3 py-2 text-sm" href={row.link(q, loc)} target="_blank" rel="noreferrer">Open {row.name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
