"use client";

import { useStore } from "@/lib/store";
import type { DeskTask } from "@/lib/workspace";

const columns: DeskTask["status"][] = ["todo", "doing", "done"];

export default function TasksPage() {
  const { tasks, bots, saveTask } = useStore();
  return (
    <div>
      <h1 className="text-5xl">Tasks</h1>
      <p className="mt-2 text-muted">Bots file a task when they draft a resume, letter, or note. You move the status.</p>
      <div className="mt-6 flex gap-3 overflow-x-auto">
        {columns.map((status) => (
          <section key={status} className="min-w-[220px] flex-1 border border-line p-3">
            <h2 className="text-xl capitalize">{status}</h2>
            <ul className="mt-3 space-y-3">
              {tasks.filter((t) => t.status === status).map((task) => (
                <li key={task.id} className="bg-card p-3 text-sm">
                  <p>{task.title}</p>
                  <p className="text-muted">{bots.find((b) => b.id === task.botId)?.name}</p>
                  <select value={task.status} onChange={(e) => saveTask({ ...task, status: e.target.value as DeskTask["status"], updatedAt: new Date().toISOString() })} className="mt-2 w-full border border-line bg-paper px-1 py-1">
                    {columns.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
