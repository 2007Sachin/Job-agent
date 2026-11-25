"use client";

import { ScreenState } from "@/components/screen-state";
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
        {!activity.length && <ScreenState kind="empty" title="Inbox is empty" detail="Notes from helpers show up here. Nothing is sent to an employer." />}
      </ul>
      <p className="text-sm"><Link className="underline" href={`/chat?helper=${bots[0]?.id || ""}`}>Open a helper</Link></p>
    </div>
  );
}
