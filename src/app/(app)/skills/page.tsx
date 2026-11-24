"use client";

import { useStore } from "@/lib/store";
import { TOOL_NAMES } from "@/lib/workspace";
import { useState } from "react";

export default function SkillsPage() {
  const { skills, saveSkill, deleteSkill } = useStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [tools, setTools] = useState<string[]>([]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-5xl">Skills</h1>
        <p className="mt-2 max-w-[62ch] text-muted">A skill is a name, a description, instructions, and the tools it may call. Built-ins are installed. Add your own as markdown-style instructions plus a tool list.</p>
      </div>
      <ul className="divide-y divide-line border-y border-line">
        {skills.map((skill) => (
          <li key={skill.id} className="py-4">
            <div className="flex justify-between gap-3">
              <h2 className="text-2xl">{skill.name}</h2>
              {!skill.builtin && <button type="button" className="text-sm underline" onClick={() => deleteSkill(skill.id)}>Remove</button>}
            </div>
            <p className="text-sm text-muted">{skill.description}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm">{skill.instructions}</p>
            <p className="mt-2 text-xs text-muted">Tools: {skill.tools.join(", ")}</p>
          </li>
        ))}
      </ul>
      <form
        className="space-y-3 border border-line p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          saveSkill({
            id: crypto.randomUUID(),
            name: name.trim(),
            description,
            instructions,
            tools,
            builtin: false,
          });
          setName("");
          setDescription("");
          setInstructions("");
          setTools([]);
        }}
      >
        <h2 className="text-3xl">Custom skill</h2>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full border border-line bg-card px-3 py-2" />
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="w-full border border-line bg-card px-3 py-2" />
        <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Instructions (markdown is fine)" rows={4} className="w-full border border-line bg-card px-3 py-2" />
        <fieldset className="text-sm">
          <legend>Tools</legend>
          {TOOL_NAMES.map((tool) => (
            <label key={tool} className="mr-3 inline-flex items-center gap-1">
              <input type="checkbox" checked={tools.includes(tool)} onChange={(e) => setTools(e.target.checked ? [...tools, tool] : tools.filter((t) => t !== tool))} />
              {tool}
            </label>
          ))}
        </fieldset>
        <button className="bg-brass px-3 py-2 text-paper">Add skill</button>
      </form>
    </div>
  );
}
