"use client";

import { routeRoom } from "@/lib/chat-plan";
import { useStore } from "@/lib/store";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function RoomPage() {
  const { id } = useParams<{ id: string }>();
  const store = useStore();
  const room = store.rooms.find((r) => r.id === id);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  if (!room) return <p>That room is not on this device.</p>;
  const members = store.bots.filter((b) => room.botIds.includes(b.id));
  const thread = store.roomMessages.filter((m) => m.roomId === room.id);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const prompt = text.trim();
    setText("");
    store.addRoomMessage({ id: crypto.randomUUID(), roomId: room!.id, role: "user", botId: "user", content: prompt, createdAt: new Date().toISOString() });
    const plan = routeRoom(prompt, members);
    store.addRoomMessage({ id: crypto.randomUUID(), roomId: room!.id, role: "assistant", botId: "bot-relay", content: plan.handoff, createdAt: new Date().toISOString() });
    store.logActivity(plan.handoff);
    setBusy(true);
    const memories = store.memories.filter((m) => m.botId === "all" || plan.speakerIds.includes(m.botId)).map((m) => m.text).join("\n");
    for (const botId of plan.speakerIds) {
      const bot = store.bots.find((b) => b.id === botId);
      if (!bot) continue;
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `${room!.instructions}\n${memories}\n${prompt}`,
          bot,
          bots: store.bots,
          skills: store.skills,
          profile: store.profile,
        }),
      });
      const raw = await res.text();
      const tool = raw.split("event: tool\n")[1];
      const dataLine = tool?.split("\n").find((l) => l.startsWith("data: "));
      const data = dataLine ? JSON.parse(dataLine.slice(6)) : null;
      const content = data ? `${data.detail}\n${data.draft}` : `${bot.name} had nothing to add.`;
      store.addRoomMessage({ id: crypto.randomUUID(), roomId: room!.id, role: "assistant", botId: bot.id, content, createdAt: new Date().toISOString() });
      store.bumpUsage(bot.id, bot.model);
      if (data?.name === "tailor_resume" || data?.name === "cover_letter" || data?.name === "linkedin_note" || data?.name === "cold_email") {
        store.saveTask({ id: crypto.randomUUID(), title: `${data.name} · ${prompt.slice(0, 80)}`, status: "todo", botId: bot.id, updatedAt: new Date().toISOString() });
        store.saveLibrary({ id: crypto.randomUUID(), name: data.name, kind: data.name, body: data.draft, createdAt: new Date().toISOString() });
      }
    }
    setBusy(false);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-5xl">{room.name}</h1>
      <p className="text-sm text-muted">{room.instructions}</p>
      <p className="text-sm">{members.map((b) => b.name).join(" · ")}</p>
      <div className="space-y-3">
        {thread.map((m) => (
          <article key={m.id} className="border border-line p-3">
            <p className="text-xs text-muted">{m.botId === "user" ? "You" : store.bots.find((b) => b.id === m.botId)?.name}</p>
            <p className="whitespace-pre-wrap text-sm">{m.content.slice(0, 1200)}</p>
          </article>
        ))}
        {busy && <p className="text-sm text-muted">Relay is waiting for the next bot.</p>}
      </div>
      <form onSubmit={send} className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask the room, or @Resume Tailor" className="w-full border border-line bg-card px-3 py-2" />
        <button className="bg-brass px-4 text-paper">Send</button>
      </form>
    </div>
  );
}
