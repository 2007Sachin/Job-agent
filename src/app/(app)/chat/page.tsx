"use client";

import { Kip } from "@/components/kip";
import { useStore } from "@/lib/store";
import type { ToolCard } from "@/lib/workspace";
import { useMemo, useState } from "react";

export default function ChatPage() {
  const store = useStore();
  const [botId, setBotId] = useState(store.bots[0]?.id ?? "bot-scout");
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
    setAttachment("");
    setAttachmentName("");
  }

  return (
    <div className="-mx-5 -my-8 grid min-h-[calc(100vh-1px)] md:grid-cols-[240px_1fr]">
      <aside className="border-b border-line md:border-b-0 md:border-r">
        <div className="flex items-center gap-2 px-4 py-4">
          <Kip className="h-10 w-10" />
          <p className="text-sm">Kip keeps the desk</p>
        </div>
        <p className="px-4 text-xs text-muted">Bots</p>
        <ul className="mt-2">
          {store.bots.map((b) => (
            <li key={b.id}>
              <button type="button" onClick={() => setBotId(b.id)} className={`w-full px-4 py-2 text-left text-sm ${b.id === bot?.id ? "bg-ink text-paper" : ""}`}>
                {b.name}
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-4 px-4 text-xs text-muted">Conversations</p>
        <ul className="mt-2 px-4 pb-4 text-sm text-muted">
          {store.conversations.map((c) => (
            <li key={c.id} className="py-1">{c.title}</li>
          ))}
          {!store.conversations.length && <li>No threads yet.</li>}
        </ul>
      </aside>
      <section className="flex min-h-[70vh] flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-6">
          {!messages.length && (
            <div className="max-w-md">
              <Kip mood="idle" className="h-20 w-20" />
              <h1 className="mt-3 text-4xl">Ask {bot?.name}</h1>
              <p className="mt-2 text-muted">{bot?.role} Mention another bot with @ to hand off.</p>
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
          {busy && (
            <div className="flex items-center gap-2 text-sm text-muted">
              <Kip mood="thinking" className="h-8 w-8" />
              Thinking
            </div>
          )}
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
    </div>
  );
}
