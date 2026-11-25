"use client";

import { boardSearchLinks, type BoardSearch } from "@/lib/board-search";
import { isHiddenTestFixture } from "@/lib/test-fixture";
import type { Job } from "@/lib/types";
import { useEffect, useState } from "react";

const KEY = "jobagent.savedSearches";

export function BoardSearchPanel({ keywords, location, onSaved }: { keywords: string; location: string; onSaved: (job: Job) => void }) {
  const [remote, setRemote] = useState(false);
  const [experience, setExperience] = useState<BoardSearch["experience"]>("");
  const [posted, setPosted] = useState<BoardSearch["posted"]>("");
  const [easyApply, setEasyApply] = useState(false);
  const [saved, setSaved] = useState<{ name: string; query: BoardSearch }[]>([]);
  const [note, setNote] = useState("");

  useEffect(() => {
    try { setSaved(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch { setSaved([]); }
  }, []);

  const query: BoardSearch = { keywords, location, remote, experience, posted, easyApply };
  const links = boardSearchLinks(query);

  function remember() {
    const next = [{ name: `${keywords || "Any role"} · ${location || "Anywhere"}`, query }, ...saved].slice(0, 8);
    setSaved(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }

  async function pull() {
    const token = localStorage.getItem("jobagent.extensionToken") || "";
    if (!token) { setNote("Make a pairing token in Settings first."); return; }
    const res = await fetch("/api/extension/inbox", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
    const json = await res.json();
    if (!res.ok) { setNote(json.error || "Could not check saves."); return; }
    const jobs = ((json.jobs || []) as Job[]).filter((job) => !isHiddenTestFixture(job));
    jobs.forEach(onSaved);
    setNote(jobs.length ? `Added ${jobs.length} job${jobs.length === 1 ? "" : "s"} from the page you saved.` : "No new saves yet. Click Save to Job-agent on a job page.");
  }

  return (
    <section className="card space-y-3 p-4">
      <h2 className="text-2xl">Search on LinkedIn</h2>
      <p>These buttons only build a public search link and open it in a new tab. Job-agent does not load those sites. LinkedIn’s terms restrict automation, so nothing is clicked or applied for you.</p>
      <div className="flex flex-wrap gap-3 text-sm">
        <label className="inline-flex items-center gap-2"><input type="checkbox" checked={remote} onChange={(e) => setRemote(e.target.checked)} /> Remote</label>
        <label>Experience
          <select value={experience} onChange={(e) => setExperience(e.target.value as BoardSearch["experience"])} className="ml-2">
            <option value="">Any</option>
            <option value="entry">Entry</option>
            <option value="mid">Mid</option>
            <option value="senior">Senior</option>
          </select>
        </label>
        <label>Posted
          <select value={posted} onChange={(e) => setPosted(e.target.value as BoardSearch["posted"])} className="ml-2">
            <option value="">Any time</option>
            <option value="day">Past day</option>
            <option value="week">Past week</option>
            <option value="month">Past month</option>
          </select>
        </label>
        <label className="inline-flex items-center gap-2"><input type="checkbox" checked={easyApply} onChange={(e) => setEasyApply(e.target.checked)} /> Easy Apply</label>
      </div>
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <a key={link.id} className="btn border border-line" href={link.url} target="_blank" rel="noreferrer">Open {link.name}</a>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="border border-line" onClick={remember}>Save this search</button>
        <button type="button" className="border border-line" onClick={() => void pull()}>Check extension saves</button>
      </div>
      {saved.length > 0 && (
        <ul className="space-y-1">
          {saved.map((row) => (
            <li key={row.name + row.query.keywords}>
              <a className="underline" href={boardSearchLinks(row.query)[0].url} target="_blank" rel="noreferrer">{row.name}</a>
            </li>
          ))}
        </ul>
      )}
      {note && <p role="status">{note}</p>}
    </section>
  );
}
