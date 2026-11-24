"use client";

import { useStore } from "@/lib/store";

export default function WorkspacePage() {
  const { usage, bots, memories, saveMemory, deleteMemory } = useStore();
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-5xl">Workspace</h1>
        <p className="mt-2 max-w-[62ch] text-muted">Usage counts turns on this device. Model names are the ones you set on each bot. There is no billing.</p>
      </div>
      <ul className="divide-y divide-line border-y border-line">
        {usage.map((row) => (
          <li key={`${row.botId}-${row.model}`} className="flex justify-between py-3 text-sm">
            <span>{bots.find((b) => b.id === row.botId)?.name} · {row.model}</span>
            <span>{row.count}</span>
          </li>
        ))}
        {!usage.length && <li className="py-3 text-muted">No turns counted yet.</li>}
      </ul>
      <form className="space-y-3" onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        saveMemory({ id: crypto.randomUUID(), botId: String(data.get("bot")), text: String(data.get("text")), updatedAt: new Date().toISOString() });
        e.currentTarget.reset();
      }}>
        <h2 className="text-3xl">Memory</h2>
        <p className="text-sm text-muted">Facts a room can read. Edit by deleting and writing again.</p>
        <select name="bot" className="w-full border border-line bg-card px-3 py-2">
          <option value="all">Every bot</option>
          {bots.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <textarea name="text" required placeholder="Notice period is 30 days." className="w-full border border-line bg-card px-3 py-2" />
        <button className="bg-ink px-3 py-2 text-paper">Save fact</button>
      </form>
      <ul className="space-y-2 text-sm">
        {memories.map((m) => (
          <li key={m.id} className="flex justify-between gap-3 border border-line px-3 py-2">
            <span>{bots.find((b) => b.id === m.botId)?.name ?? "Every bot"}: {m.text}</span>
            <button type="button" className="underline" onClick={() => deleteMemory(m.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
