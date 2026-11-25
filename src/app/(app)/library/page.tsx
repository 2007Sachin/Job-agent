"use client";

import { useStore } from "@/lib/store";

export default function LibraryPage() {
  const { library } = useStore();
  return (
    <div>
      <h1 className="text-5xl">Library</h1>
      <p className="mt-2 text-muted">Drafts the room saves land here. Nothing is emailed from this page.</p>
      <ul className="mt-6 divide-y divide-line border-y border-line">
        {library.map((item) => (
          <li key={item.id} className="py-4">
            <p className="text-sm text-muted">{item.kind} · {item.createdAt.slice(0, 16)}</p>
            <h2 className="text-2xl">{item.name}</h2>
            <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap font-sans text-sm">{item.body}</pre>
          </li>
        ))}
        {!library.length && <li className="py-4 text-muted">The shelf is empty.</li>}
      </ul>
    </div>
  );
}
