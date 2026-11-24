"use client";

import { Kip } from "@/components/kip";
import { useStore } from "@/lib/store";
import { BOT_TEMPLATES } from "@/lib/workspace";
import { useState } from "react";

export default function BotsPage() {
  const { bots, skills, saveBot, deleteBot } = useStore();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [prompt, setPrompt] = useState("");
  const [skillIds, setSkillIds] = useState<string[]>([]);

  return (
    <div className="space-y-8">
      <div className="flex items-end gap-4">
        <Kip mood="celebrating" />
        <div>
          <h1 className="text-5xl">Bots</h1>
          <p className="text-muted">Each bot has a job, a prompt, and the skills you turn on. Starter bots stay. Ones you add can be removed.</p>
        </div>
      </div>
      <ul className="divide-y divide-line border-y border-line">
        {bots.map((bot) => (
          <li key={bot.id} className="py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl">{bot.name}</h2>
                <p className="text-sm text-muted">{bot.role}</p>
                <label className="mt-2 flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={bot.enabled !== false} onChange={(e) => saveBot({ ...bot, enabled: e.target.checked })} />
                  Enabled
                </label>
                <label className="mt-2 block text-sm">Model
                  <select value={bot.model} onChange={(e) => saveBot({ ...bot, model: e.target.value })} className="mt-1 w-full border border-line bg-card px-2 py-1">
                    {["env:LLM_MODEL", "Gemini", "Groq", "NVIDIA"].map((m) => <option key={m}>{m}</option>)}
                  </select>
                </label>
                <label className="mt-2 block text-sm">Temperature {bot.temperature ?? 0.4}
                  <input type="range" min={0} max={1} step={0.1} value={bot.temperature ?? 0.4} onChange={(e) => saveBot({ ...bot, temperature: Number(e.target.value) })} className="mt-1 w-full" />
                </label>
                <p className="text-sm">Skills: {bot.skillIds.map((id) => skills.find((s) => s.id === id)?.name ?? id).join(", ")}</p>
              </div>
              {!bot.builtin && (
                <button type="button" className="text-sm underline" onClick={() => deleteBot(bot.id)}>Delete</button>
              )}
            </div>
            <label className="mt-3 block text-sm">System prompt
              <textarea value={bot.systemPrompt} onChange={(e) => saveBot({ ...bot, systemPrompt: e.target.value })} rows={3} className="mt-1 w-full border border-line bg-card px-3 py-2" />
            </label>
          </li>
        ))}
      </ul>
      <form
        className="space-y-3 border border-line p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          saveBot({
            id: crypto.randomUUID(),
            name: name.trim(),
            avatar: "custom",
            role: role || "Custom helper",
            systemPrompt: prompt || "Help the seeker with the skills that are enabled. Do not invent their history.",
            model: "env:LLM_MODEL",
            skillIds,
            connectorIds: [],
            builtin: false,
          });
          setName("");
          setRole("");
          setPrompt("");
          setSkillIds([]);
        }}
      >
        <h2 className="text-3xl">New bot</h2>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full border border-line bg-card px-3 py-2" />
        <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role" className="w-full border border-line bg-card px-3 py-2" />
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="System prompt" rows={3} className="w-full border border-line bg-card px-3 py-2" />
        <fieldset className="text-sm">
          <legend>Skills</legend>
          {skills.map((skill) => (
            <label key={skill.id} className="mr-4 inline-flex items-center gap-1">
              <input type="checkbox" checked={skillIds.includes(skill.id)} onChange={(e) => setSkillIds(e.target.checked ? [...skillIds, skill.id] : skillIds.filter((id) => id !== skill.id))} />
              {skill.name}
            </label>
          ))}
        </fieldset>
        <button className="bg-ink px-3 py-2 text-paper">Create bot</button>
        <div className="flex flex-wrap gap-2 pt-2">
          {BOT_TEMPLATES.map((template) => (
            <button key={template.name} type="button" className="border border-line px-3 py-2 text-sm" onClick={() => saveBot({ ...template, id: crypto.randomUUID(), builtin: false })}>
              Use {template.name}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}
