"use client";

import { CATALOG } from "@/lib/catalog";
import { scoreMatch } from "@/lib/match";
import { sampleProfile } from "@/lib/sample";
import { useStore } from "@/lib/store";
import { notify } from "@/components/toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
      <legend className="font-semibold">{label}</legend>
      <p>{hint}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.map((v) => (
          <button type="button" key={v} className="border border-line px-3" onClick={() => onChange(values.filter((x) => x !== v))}>
            Remove {v}
          </button>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={placeholder} className="w-full" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
        <button type="button" className="border border-line" onClick={add}>Add</button>
      </div>
    </fieldset>
  );
}

export default function OnboardingPage() {
  const { profile, updateProfile, completeOnboarding, saveJob, patchApplication } = useStore();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [parsing, setParsing] = useState(false);
  const steps = ["Your resume", "Jobs you want", "Jobs that fit", "Save the first one"];
  useEffect(() => {
    if (profile.onboarded) router.replace("/dashboard");
    // Only when this page is opened again, not when Finish sets onboarded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onFile(file: File) {
    setParsing(true);
    setError("");
    const body = new FormData();
    body.set("file", file);
    const res = await fetch("/api/parse-resume", { method: "POST", body });
    const json = await res.json();
    setParsing(false);
    if (!res.ok) {
      setError(json.error || "We could not read that file. Try a PDF or a .txt file.");
      return;
    }
    updateProfile({ resumeText: json.text, resumeFileName: json.filename });
    notify("Resume loaded");
  }

  function next() {
    if (step === 0 && !profile.fullName.trim()) {
      setError("Type your name, then press Continue.");
      return;
    }
    if (step === 1 && !profile.targetRoles.length) {
      setError("Add at least one job title, then press Continue.");
      return;
    }
    setError("");
    setStep((n) => Math.min(3, n + 1));
  }

  const matches = [...CATALOG]
    .map((job) => ({ job, match: scoreMatch(profile, job) }))
    .sort((a, b) => b.match.score - a.match.score)
    .slice(0, 3);

  function saveFirst() {
    const top = matches[0];
    if (!top) {
      setError("No jobs to save yet. Press Skip and search on the next page.");
      return;
    }
    const app = saveJob(top.job);
    const draft = `${profile.fullName || "Your name"}\n${profile.targetRoles.join(", ") || "Role"}\n\nExperience\n${(profile.resumeText || "Add a real job you have done.").slice(0, 600)}`;
    patchApplication(app.id, { tailoredResume: draft });
    completeOnboarding({});
    notify("Resume draft is ready. Edit it, then you send it.");
    router.push(`/jobs/${encodeURIComponent(top.job.id)}`);
  }

  function skipAll() {
    if (!profile.fullName.trim()) updateProfile({ fullName: "Friend" });
    if (!profile.targetRoles.length) updateProfile({ targetRoles: ["Any job"] });
    completeOnboarding({});
    router.push("/jobs");
  }

  return (
    <div className="card max-w-2xl space-y-6 p-6">
      <p>Step {step + 1} of {steps.length}</p>
      <div className="h-2 bg-line" aria-hidden>
        <div className="h-2 bg-brass" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
      </div>
      <h1 className="text-4xl">{steps[step]}</h1>

      {step === 0 && (
        <div className="space-y-4">
          <p>We use this only to write drafts. You can use a sample if you want to look around.</p>
          <button type="button" className="border border-line" onClick={() => { updateProfile(sampleProfile()); notify("Sample filled in"); }}>
            Use a sample resume
          </button>
          <label className="block">
            Your name
            <input value={profile.fullName} onChange={(e) => updateProfile({ fullName: e.target.value })} className="mt-1 w-full" />
          </label>
          <label className="block">
            Upload a PDF, Word, or text file
            <input type="file" accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" className="mt-1 block w-full" onChange={(e) => { const f = e.target.files?.[0]; if (f) void onFile(f); }} />
          </label>
          {parsing && <p>Reading the file…</p>}
          {profile.resumeFileName && <p>Loaded {profile.resumeFileName}</p>}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <TagField label="Job titles you want" hint="Example: teacher, nurse, driver, designer." values={profile.targetRoles} onChange={(targetRoles) => updateProfile({ targetRoles })} placeholder="Type a job and press Add" />
          <TagField label="Places" hint="A city, or Remote." values={profile.locations} onChange={(locations) => updateProfile({ locations })} placeholder="Type a city and press Add" />
        </div>
      )}

      {step === 2 && (
        <ul className="divide-y divide-line border-y border-line">
          {matches.map(({ job, match }) => (
            <li key={job.id} className="py-3">
              <p className="font-semibold">{job.title}</p>
              <p>{job.company} · {job.location} · {match.score} match</p>
            </li>
          ))}
        </ul>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <p>Save the closest job and get a first resume draft from the facts you already gave. You still edit it and send it yourself.</p>
          {matches[0] && <p className="font-semibold">{matches[0].job.title} at {matches[0].job.company}</p>}
          <button type="button" className="bg-brass" onClick={saveFirst}>Save this job</button>
        </div>
      )}

      {error && <p role="alert" className="text-danger">{error}</p>}

      <div className="flex flex-wrap gap-3">
        {step > 0 && step < 3 && <button type="button" className="border border-line" onClick={() => setStep((n) => n - 1)}>Back</button>}
        {step < 3 && <button type="button" className="bg-brass" onClick={next}>Continue</button>}
        <button type="button" className="underline" onClick={skipAll}>Skip for now</button>
      </div>
    </div>
  );
}
