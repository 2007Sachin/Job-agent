"use client";

import { useStore } from "@/lib/store";

export default function SharedPage() {
  const { library } = useStore();
  return (
    <div className="space-y-4">
      <h1 className="text-4xl">Shared items</h1>
      <p>Drafts you saved. Only you can see them unless you export a copy.</p>
      <ul className="space-y-2">
        {library.map((item) => <li key={item.id} className="card p-3">{item.name}</li>)}
        {!library.length && <li className="card p-4">Nothing shared yet. A resume draft can be saved from a job.</li>}
      </ul>
    </div>
  );
}
