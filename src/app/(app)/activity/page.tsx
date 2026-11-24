"use client";

import { useStore } from "@/lib/store";

export default function ActivityPage() {
  const { activity } = useStore();
  return (
    <div>
      <h1 className="text-5xl">Activity</h1>
      <ul className="mt-6 divide-y divide-line border-y border-line">
        {activity.map((item) => (
          <li key={item.id} className="py-3 text-sm">{item.createdAt.slice(11, 16)} · {item.text}</li>
        ))}
        {!activity.length && <li className="py-3 text-muted">No hand-offs yet.</li>}
      </ul>
    </div>
  );
}
