"use client";

import { useStore } from "@/lib/store";
import Link from "next/link";
import { useState } from "react";

export default function RoomsPage() {
  const { rooms, bots, saveRoom } = useStore();
  const [name, setName] = useState("Morning applications");
  const [picked, setPicked] = useState<string[]>(["bot-relay", "bot-scout", "bot-tailor", "bot-outreach"]);
  return (
    <div className="space-y-8">
      <h1 className="text-5xl">Rooms</h1>
      <p className="max-w-[62ch] text-muted">A room holds you and several bots. Relay routes the turn. Mention a bot with @ if you want only that voice.</p>
      <ul className="divide-y divide-line border-y border-line">
        {rooms.map((room) => (
          <li key={room.id} className="py-3">
            <Link href={`/rooms/${room.id}`} className="text-lg underline">{room.name}</Link>
            <p className="text-sm text-muted">{room.botIds.length} bots · {room.instructions || "No extra instructions"}</p>
          </li>
        ))}
        {!rooms.length && <li className="py-3 text-muted">No rooms yet.</li>}
      </ul>
      <form className="space-y-3 border border-line p-4" onSubmit={(e) => {
        e.preventDefault();
        const id = crypto.randomUUID();
        saveRoom({ id, name, instructions: "Stay factual. Do not send email or submit applications.", botIds: picked, updatedAt: new Date().toISOString() });
        setName("");
      }}>
        <h2 className="text-3xl">New room</h2>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-line bg-card px-3 py-2" />
        <div className="flex flex-wrap gap-3 text-sm">
          {bots.filter((b) => b.enabled !== false).map((b) => (
            <label key={b.id} className="inline-flex items-center gap-1">
              <input type="checkbox" checked={picked.includes(b.id)} onChange={(e) => setPicked(e.target.checked ? [...picked, b.id] : picked.filter((id) => id !== b.id))} />
              {b.name}
            </label>
          ))}
        </div>
        <button className="bg-brass px-3 py-2 text-paper">Create room</button>
      </form>
    </div>
  );
}
