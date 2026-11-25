"use client";

import { HelperDrawer } from "@/components/helper-drawer";
import { HelperMark } from "@/components/helper-mark";
import { SidePanel } from "@/components/side-panel";
import { botHint, plainBot } from "@/lib/plain";
import { useStore } from "@/lib/store";
import type { ToolCard } from "@/lib/workspace";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

export default function ChatPage() {
  return (
    <Suspense fallback={<p className="p-6">Loading chat…</p>}>
      <ChatBody />
    </Suspense>
  );
}

function ChatBody() {
  const store = useStore();
  const params = useSearchParams();
  const [botId, setBotId] = useState(params.get("helper") || store.bots[0]?.id || "bot-scout");
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(false);
  const [panel, setPanel] = useState(true);
  useEffect(() => {
    const next = params.get("helper");
    if (next) setBotId(next);
  }, [params]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [live, setLive] = useState<{ content: string; tools: ToolCard[] } | null>(null);
  const [attachment, setAttachment] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const conversationId = useMemo(() => store.conversations.find((c) => c.botId === botId)?.id, [store.conversations, botId]);
  const messages = store.messages.filter((m) => m.conversationId === conversationId);
  const bot = store.bots.find((b) => b.id === botId) ?? store.bots[0];

  async function onFile(file: File) {
    if (file.name.endsWith(".txt")) {
      setAttachment(await file.text());
      setAttachmentName(file.name);
      return;
    }
    const body = new FormData();
    body.set("file", file);
    const res = await fetch("/api/parse-resume", { method: "POST", body });
    const json = await res.json();
    if (!res.ok) return;
    setAttachment(json.text);
    setAttachmentName(json.filename);
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !bot) return;
    const cid = store.ensureConversation(bot.id);
    const userMsg = {
      id: crypto.randomUUID(),
      conversationId: cid,
      role: "user" as const,
      botId: bot.id,
      content: text.trim(),
      tools: [],
      attachmentName: attachmentName || undefined,
      createdAt: new Date().toISOString(),
    };
    store.addMessage(userMsg);
    const prompt = text.trim();
    setText("");
    setBusy(true);
    setLive({ content: "", tools: [] });
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `${prompt}${attachment ? `\n\nAttachment:\n${attachment.slice(0, 3000)}` : ""}`,
        bot,
        bots: store.bots,
        skills: store.skills,
        profile: store.profile,
        attachment,
      }),
    });
    if (!res.ok || !res.body) {
      setBusy(false);
      return;
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let content = "";
    const tools: ToolCard[] = [];
    let activeBot = bot.id;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";
      for (const part of parts) {
        const event = /event: (\w+)/.exec(part)?.[1];
        const dataLine = part.split("\n").find((l) => l.startsWith("data: "));
        if (!dataLine) continue;
        const data = JSON.parse(dataLine.slice(6));
        if (event === "token") content += data.text;
        if (event === "tool") {
          tools.push({
            id: crypto.randomUUID(),
            name: data.name,
            detail: data.detail,
            draft: data.draft,
            status: data.needsApproval ? "needs_approval" : "complete",
          });
          if (data.botId) activeBot = data.botId;
        }
        setLive({ content, tools: [...tools] });
      }
    }
    store.addMessage({
      id: crypto.randomUUID(),
      conversationId: cid,
      role: "assistant",
      botId: activeBot,
      content,
      tools,
      createdAt: new Date().toISOString(),
    });
    setLive(null);
    setBusy(false);
    store.bumpUsage(activeBot, bot.model);
    setAttachment("");
    setAttachmentName("");
  }

  return (
    <div className="grid min-h-screen md:grid-cols-[1fr_300px]">
      <section className="flex min-h-[70vh] flex-col">
        <header className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
          <HelperMark name={plainBot(bot?.name || "Helper")} />
          <div className="min-w-0">
            <p className="font-semibold">{plainBot(bot?.name || "Helper")}</p>
            <p className="text-sm text-muted">{bot?.role}</p>
          </div>
          <label className="text-sm">Model
            <select className="ml-2 border border-line bg-card px-2 py-1" value={bot?.model || ""} onChange={(e) => bot && store.saveBot({ ...bot, model: e.target.value })}>
              {["env:LLM_MODEL", "Groq", "Gemini", "NVIDIA", bot?.model].filter((v, i, all) => v && all.indexOf(v) === i).map((model) => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </label>
          <button type="button" className="border border-line px-3 py-2" onClick={() => setPanel((v) => !v)}>{panel ? "Hide helper screen" : "Helper screen"}</button>
          <button type="button" className="border border-line px-3 py-2" aria-expanded={menu} onClick={() => setMenu((v) => !v)}>•••</button>
          {menu && (
            <div className="flex gap-2">
              <button type="button" className="underline" onClick={() => { setDrawer(true); setMenu(false); }}>Helper profile</button>
              <button type="button" className="underline" onClick={() => setBotId(store.bots[0]?.id || botId)}>First helper</button>
            </div>
          )}
        </header>
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-6">
          {!messages.length && bot && (
            <div className="max-w-md">
              <HelperMark name={plainBot(bot.name)} />
              <h1 className="mt-3 text-4xl">{plainBot(bot.name)}</h1>
              <p className="mt-2">{botHint(bot.name)}</p>
            </div>
          )}
          {messages.map((m) => (
            <article key={m.id} className={m.role === "user" ? "ml-auto max-w-xl" : "max-w-2xl"}>
              <p className="text-xs text-muted">{m.role === "user" ? "You" : store.bots.find((b) => b.id === m.botId)?.name}</p>
              {m.attachmentName && <p className="text-xs text-brass">Attached {m.attachmentName}</p>}
              {m.content && <p className="mt-1 whitespace-pre-wrap">{m.content}</p>}
              {m.tools.map((tool) => (
                <div key={tool.id} className="mt-3 border border-line bg-card p-3 text-sm">
                  <p className="font-medium">{tool.name}</p>
                  <p className="text-muted">{tool.detail}</p>
                  <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap font-sans">{tool.draft}</pre>
                  {tool.status === "needs_approval" && (
                    <div className="mt-2 flex gap-2">
                      <button type="button" className="bg-ink px-2 py-1 text-paper" onClick={() => store.patchTool(m.id, tool.id, { status: "approved" })}>Approve</button>
                      <button type="button" className="border border-line px-2 py-1" onClick={() => {
                        const next = window.prompt("Edit the draft", tool.draft);
                        if (next != null) store.patchTool(m.id, tool.id, { draft: next, status: "edited" });
                      }}>Edit</button>
                      <button type="button" className="border border-line px-2 py-1" onClick={() => store.patchTool(m.id, tool.id, { status: "rejected" })}>Reject</button>
                    </div>
                  )}
                  {tool.status !== "needs_approval" && tool.status !== "complete" && <p className="mt-2 text-moss">{tool.status}</p>}
                </div>
              ))}
            </article>
          ))}
          {live && (
            <article className="max-w-2xl">
              <p className="whitespace-pre-wrap">{live.content}</p>
              {live.tools.map((tool) => (
                <pre key={tool.id} className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap border border-line p-2 text-sm">{tool.name}: {tool.draft.slice(0, 400)}</pre>
              ))}
            </article>
          )}
          {busy && <p className="text-sm text-muted">Drafting…</p>}
        </div>
        <form onSubmit={send} className="border-t border-line p-4">
          {attachmentName && <p className="mb-2 text-xs text-muted">Attached {attachmentName}</p>}
          <div className="flex gap-2">
            <label className="border border-line px-3 py-2 text-sm">
              File
              <input type="file" accept=".pdf,.txt,text/plain,application/pdf" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) void onFile(f); }} />
            </label>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder={`Message ${bot?.name}. Try @Resume Tailor`} className="w-full border border-line bg-card px-3 py-2" />
            <button className="bg-brass px-4 text-paper" disabled={busy}>Send</button>
          </div>
        </form>
      </section>
      {panel && bot && <SidePanel bot={bot} />}
      {drawer && bot && <HelperDrawer bot={bot} onClose={() => setDrawer(false)} />}
    </div>
  );
}
