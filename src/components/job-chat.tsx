"use client";

import { useStore } from "@/lib/store";
import type { Job } from "@/lib/types";
import Link from "next/link";
import { useEffect, useState } from "react";

type Line = { role: "user" | "assistant"; content: string };

export function JobChat({ jobId }: { jobId: string }) {
  const store = useStore();
  const job: Job | undefined = store.feed.find((row) => row.id === jobId) || store.applications.find((row) => row.job.id === jobId)?.job;
  const key = `jobagent.jobchat.${jobId}`;
  const [lines, setLines] = useState<Line[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem(key);
    if (saved) setLines(JSON.parse(saved) as Line[]);
  }, [key]);

  function remember(next: Line[]) {
    setLines(next);
    sessionStorage.setItem(key, JSON.stringify(next));
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const prompt = text.trim();
    const bot = store.bots[0];
    if (!prompt || !bot || !job) return;
    const next = [...lines, { role: "user" as const, content: prompt }];
    remember(next);
    setText("");
    setBusy(true);
    setError("");
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `This thread is only about this saved job.\nTitle: ${job.title}\nEmployer: ${job.company}\nLocation: ${job.location}\nDescription:\n${job.description.slice(0, 2000)}\n\nQuestion: ${prompt}`,
        bot,
        bots: [bot],
        skills: [],
        profile: store.profile,
      }),
    });
    if (!res.ok || !res.body) {
      setBusy(false);
      setError("The chat could not answer. Try again.");
      return;
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let content = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";
      for (const part of parts) {
        const event = /event: (\w+)/.exec(part)?.[1];
        const dataLine = part.split("\n").find((line) => line.startsWith("data: "));
        if (event === "token" && dataLine) content += JSON.parse(dataLine.slice(6)).text;
      }
    }
    remember([...next, { role: "assistant", content: content || "No answer yet." }]);
    setBusy(false);
  }

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-2xl flex-col px-4 py-6">
      <h1 className="text-[20px] font-semibold">Ask about this job</h1>
      {job ? <p className="mt-1 text-[13px] text-[var(--muted)]">{job.title} · {job.company}</p> : <p className="mt-1 text-[13px]">That job is not on this device.</p>}
      <Link href={job ? `/jobs/${encodeURIComponent(job.id)}` : "/jobs"} className="mt-2 text-[13px] underline">Back to the job</Link>
      <div className="mt-6 flex-1 space-y-3">
        {!lines.length && <p className="text-[14px] text-[var(--muted)]">One thread about this job. No other helpers.</p>}
        {lines.map((line, index) => (
          <p key={index} className={line.role === "user" ? "ml-auto max-w-md whitespace-pre-wrap" : "max-w-xl whitespace-pre-wrap"}>
            <span className="block text-[12px] text-[var(--muted)]">{line.role === "user" ? "You" : "Helper"}</span>
            {line.content}
          </p>
        ))}
        {busy && <p role="status">Writing…</p>}
        {error && <p className="text-danger" role="status">{error}</p>}
      </div>
      <form onSubmit={(e) => void send(e)} className="mt-4 flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask about this job" className="w-full bg-white" disabled={!job} />
        <button className="bg-brass" disabled={busy || !job}>Send</button>
      </form>
    </section>
  );
}
