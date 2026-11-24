"use client";

import { sampleProfile } from "@/lib/sample";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState } from "react";

function TagField({ label, hint, values, onChange, placeholder }: { label: string; hint: string; values: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [draft, setDraft] = useState("");
  function add() {
    const next = draft.split(",").map((s) => s.trim()).filter(Boolean);
    if (!next.length) return;
    onChange([...values, ...next.filter((n) => !values.includes(n))]);
    setDraft("");
  }
  return (
    <fieldset>
      <legend className="text-sm">{label}</legend>
      <p className="text-sm text-muted">{hint}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.map((v) => (
          <button type="button" key={v} className="border border-line px-2 py-1 text-sm" onClick={() => onChange(values.filter((x) => x !== v))}>
            {v} ×
          </button>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={placeholder} className="w-full border border-line bg-card px-3 py-2" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
        <button type="button" className="border border-line px-3" onClick={add}>Add</button>
      </div>
    </fieldset>
  );
}

export default function OnboardingPage() {
  const { profile, updateProfile, completeOnboarding } = useStore();
  const router = useRouter();
  const [error, setError] = useState("");
  const [parsing, setParsing] = useState(false);

  async function onFile(file: File) {
    setParsing(true);
    setError("");
    const body = new FormData();
    body.set("file", file);
    const res = await fetch("/api/parse-resume", { method: "POST", body });
    const json = await res.json();
    setParsing(false);
    if (!res.ok) {
      setError(json.error || "Could not read that file");
      return;
    }
    updateProfile({ resumeText: json.text, resumeFileName: json.filename });
  }

  function finish(e: React.FormEvent) {
    e.preventDefault();
    if (!profile.fullName.trim() || !profile.targetRoles.length) {
      setError("Add your name and at least one target role. The role can be anything you would type into a job search.");
      return;
    }
    completeOnboarding({});
    router.push("/dashboard");
  }

  return (
    <form onSubmit={finish} className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-5xl">Set the desk up</h1>
        <p className="mt-3 text-muted">Any industry, any seniority. These answers steer search and drafts. You can change them later.</p>
        <button
          type="button"
          className="mt-4 text-sm underline"
          onClick={() => updateProfile(sampleProfile())}
        >
          Fill a sample profile (support and operations)
        </button>
      </div>
      <label className="block text-sm">
        Name
        <input value={profile.fullName} onChange={(e) => updateProfile({ fullName: e.target.value })} className="mt-1 w-full border border-line bg-card px-3 py-2" />
      </label>
      <label className="block text-sm">
        Resume PDF or text
        <input type="file" accept=".pdf,.txt,application/pdf,text/plain" className="mt-1 block w-full" onChange={(e) => { const f = e.target.files?.[0]; if (f) void onFile(f); }} />
      </label>
      {parsing && <p className="text-sm text-muted">Reading the file…</p>}
      {profile.resumeFileName && <p className="text-sm text-moss">Loaded {profile.resumeFileName}</p>}
      <label className="block text-sm">
        Or paste resume text
        <textarea value={profile.resumeText} onChange={(e) => updateProfile({ resumeText: e.target.value })} rows={8} className="mt-1 w-full border border-line bg-card px-3 py-2" />
      </label>
      <TagField label="Target roles" hint="Type any title: ward nurse, AE, carpenter, fresher, staff engineer." values={profile.targetRoles} onChange={(targetRoles) => updateProfile({ targetRoles })} placeholder="e.g. School teacher" />
      <TagField label="Locations" hint="Cities, Remote, or a region." values={profile.locations} onChange={(locations) => updateProfile({ locations })} placeholder="e.g. Kochi" />
      <TagField label="Skills" hint="Tools, languages, licences, wards, quotas — whatever the work uses." values={profile.skills} onChange={(skills) => updateProfile({ skills })} placeholder="e.g. GST, Figma, phlebotomy" />
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="text-sm">Minimum pay (LPA)
          <input type="number" min={0} value={profile.salaryMinLpa ?? ""} onChange={(e) => updateProfile({ salaryMinLpa: e.target.value === "" ? null : Number(e.target.value) })} className="mt-1 w-full border border-line bg-card px-3 py-2" />
        </label>
        <label className="text-sm">Maximum pay (LPA)
          <input type="number" min={0} value={profile.salaryMaxLpa ?? ""} onChange={(e) => updateProfile({ salaryMaxLpa: e.target.value === "" ? null : Number(e.target.value) })} className="mt-1 w-full border border-line bg-card px-3 py-2" />
        </label>
        <label className="text-sm">Years of experience
          <input type="number" min={0} value={profile.experienceYears ?? ""} onChange={(e) => updateProfile({ experienceYears: e.target.value === "" ? null : Number(e.target.value) })} className="mt-1 w-full border border-line bg-card px-3 py-2" />
        </label>
      </div>
      <label className="block text-sm">LinkedIn URL
        <input value={profile.linkedinUrl} onChange={(e) => updateProfile({ linkedinUrl: e.target.value })} placeholder="https://www.linkedin.com/in/…" className="mt-1 w-full border border-line bg-card px-3 py-2" />
      </label>
      <label className="block text-sm">Preferences
        <textarea value={profile.preferences} onChange={(e) => updateProfile({ preferences: e.target.value })} rows={3} placeholder="Shifts, travel, industries you will not join, notice period" className="mt-1 w-full border border-line bg-card px-3 py-2" />
      </label>
      {error && <p className="text-sm text-danger" role="alert">{error}</p>}
      <button className="bg-brass px-4 py-3 text-paper" type="submit">Save and open the desk</button>
    </form>
  );
}
