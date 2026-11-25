"use client";

import { useStore } from "@/lib/store";
import Link from "next/link";

export default function InboxPage() {
  const { activity, bots } = useStore();
  return (
    <div className="space-y-4">
      <h1 className="text-4xl">Inbox</h1>
      <p>Notes from your helpers. Nothing here was sent to an employer.</p>
      <ul className="space-y-2">
        {activity.map((item) => (
          <li key={item.id} className="card p-3">{item.text}</li>
        ))}
        {!activity.length && <li className="card p-4">No notes yet. Start a helper from chat.</li>}
      </ul>
      <p className="text-sm"><Link className="underline" href={`/chat?helper=${bots[0]?.id || ""}`}>Open a helper</Link></p>
    </div>
  );
}
