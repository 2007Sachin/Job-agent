"use client";

import { CATALOG } from "@/lib/catalog";
import { downloadDocx, downloadPdfViaPrint } from "@/lib/export-doc";
import { scoreMatch } from "@/lib/match";
import { sourceLabel } from "@/lib/source-label";
import { useStore } from "@/lib/store";
import type { Job } from "@/lib/types";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params.id);
  const store = useStore();
  const job = useMemo(() => {
    return (
      store.feed.find((j) => j.id === id) ||
      store.applications.find((a) => a.job.id === id)?.job ||
      CATALOG.find((j) => j.id === id) ||
      null
    );
  }, [store.feed, store.applications, id]);
  const application = store.applications.find((a) => a.job.id === id);
  const [busy, setBusy] = useState("");
  const [note, setNote] = useState("");
  const [resumeError, setResumeError] = useState("");
  const [approved, setApproved] = useState(false);
  const [smtpPass, setSmtpPass] = useState("");

  if (!job) {
    return (
      <div>
        <h1 className="text-4xl">That role is not on this device</h1>
        <p className="mt-3 text-muted">Search again, or paste the description. Ids are kept in this browser.</p>
        <Link href="/jobs" className="mt-4 inline-block underline">Back to jobs</Link>
      </div>
    );
  }

  const match = scoreMatch(store.profile, job);

  async function generate(kind: "resume" | "cover" | "linkedin" | "email") {
    const saved = store.saveJob(job as Job);
    setBusy(kind);
    setNote("");
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, profile: store.profile, job, userId: store.user?.id }),
    });
    const json = await res.json();
    setBusy("");
    if (!res.ok) {
      const message = json.error || "Generation failed";
      if (kind === "resume") setResumeError(message);
      else setNote(message);
      return;
    }
    const text = String(json.text || "");
    if (kind === "resume" && !text.trim()) {
      setResumeError(json.note || "No free model key is configured. Paste a draft. Job-agent will not write a biography for you.");
      return;
    }
    if (json.note) setNote(json.note);
    if (kind === "resume") {
      setResumeError("");
      store.patchApplication(saved.id, { tailoredResume: text });
    }
    if (kind === "cover") store.patchApplication(saved.id, { coverLetter: text });
    if (kind === "linkedin") store.patchApplication(saved.id, { linkedinNote: text });
    if (kind === "email") {
      const subject = json.subject || text.split("\n")[0].replace(/^Subject:\s*/, "");
      const body = json.subject ? text.split("\n").slice(1).join("\n").trim() : text;
      store.addOutreach({
        applicationId: saved.id,
        to: saved.recruiterEmail,
        subject,
        body,
        status: "draft",
        provider: "unsent",
        approved: false,
        followUpOn: null,
        sentAt: null,
        error: null,
      });
    }
  }

  async function send(outreachId: string, to: string, subject: string, body: string, provider: "smtp" | "gmail") {
    if (!approved) {
      setNote("Approve this email before sending.");
      return;
    }
    setBusy("send");
    const res = await fetch("/api/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": store.user?.id || "" },
      body: JSON.stringify({
        approved: true,
        consent: store.profile.emailConsent,
        to,
        subject,
        body,
        provider,
        smtp: provider === "smtp" ? {
          host: store.profile.smtpHost,
          port: store.profile.smtpPort,
          user: store.profile.smtpUser,
          pass: smtpPass,
          from: store.profile.smtpFrom,
        } : undefined,
      }),
    });
    const json = await res.json();
    setBusy("");
    if (json.status === "sent") {
      store.patchOutreach(outreachId, { status: "sent", provider, approved: true, sentAt: new Date().toISOString(), error: null });
      setNote("Sent.");
    } else {
      store.patchOutreach(outreachId, { status: json.status === "failed" ? "failed" : "draft", error: json.error || "Not sent", provider: json.provider || "unsent" });
      setNote(json.error || "Not sent");
    }
  }

  const relatedMail = store.outreach.filter((o) => (application && o.applicationId === application.id) || (!o.applicationId && o.subject.includes(job.title)));

  return (
    <article className="space-y-6">
      <header className="card p-5">
        <p className="text-sm text-muted">{sourceLabel(job.source)} · {job.postedAt}</p>
        <h1 className="mt-1 text-5xl">{job.title}</h1>
        <p className="mt-2 text-muted">{job.company} · {job.location}{job.salaryLabel ? ` · ${job.salaryLabel}` : ""}</p>
        <div className="mt-4 max-w-[62ch]">
          <p className="font-medium">Fit note: {match.score} out of 100</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {match.reasons.map((reason) => <li key={reason}>{reason}</li>)}
          </ul>
          <p className="mt-2 text-sm text-muted">This is a fit note against your profile, not an ATS score.</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" className="bg-brass" onClick={() => { store.saveJob(job); setNote("Saved. Open My applications to see it."); }}>
            {application ? "Saved" : "Save this job"}
          </button>
          <Link href={`/chat?job=${encodeURIComponent(job.id)}`} className="border border-line px-3 py-2 text-sm">Ask about this job</Link>
          {job.url && (
            <a className="border border-line px-3 py-2 text-sm" href={job.url} target="_blank" rel="noreferrer">Open apply link</a>
          )}
        </div>
      </header>
      <section>
        <h2 className="text-3xl">Description</h2>
        <p className="mt-3 max-w-[70ch] whitespace-pre-wrap text-sm leading-relaxed">{job.description}</p>
      </section>
      <section className="border border-line p-4">
        <h2 className="text-3xl">Apply assist</h2>
        <p className="mt-2 text-sm text-muted">Copy what forms usually ask. You still submit the application yourself.</p>
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          {[
            ["Name", store.profile.fullName],
            ["Email", store.profile.email],
            ["LinkedIn", store.profile.linkedinUrl],
            ["Experience", store.profile.experienceYears?.toString() ?? ""],
            ["Locations", store.profile.locations.join(", ")],
            ["Skills", store.profile.skills.join(", ")],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-muted">{k}</dt>
              <dd>{v || "—"}</dd>
            </div>
          ))}
        </dl>
      </section>
      <Draft
        title="Tailored resume"
        value={application?.tailoredResume ?? ""}
        onChange={(tailoredResume) => application && store.patchApplication(application.id, { tailoredResume })}
        actionLabel="Make my resume"
        placeholder="Paste a draft from your own history."
        hint="Press Make my resume. The draft uses only the facts in Settings."
        error={resumeError}
        onGenerate={() => void generate("resume")}
        busy={busy === "resume"}
        onDocx={() => downloadDocx(`${job.company}-resume.docx`, job.title, application?.tailoredResume || "")}
        onPdf={() => downloadPdfViaPrint(`${job.title} resume`, application?.tailoredResume || "")}
      />
      <Draft
        title="Cover letter"
        value={application?.coverLetter ?? ""}
        onChange={(coverLetter) => application && store.patchApplication(application.id, { coverLetter })}
        onGenerate={() => void generate("cover")}
        busy={busy === "cover"}
        onDocx={() => downloadDocx(`${job.company}-letter.docx`, job.title, application?.coverLetter || "")}
        onPdf={() => downloadPdfViaPrint(`${job.title} letter`, application?.coverLetter || "")}
      />
      <section className="space-y-3">
        <h2 className="text-3xl">LinkedIn note</h2>
        <p className="text-sm text-muted">Copy it, then open LinkedIn and send it yourself. This app does not automate LinkedIn.</p>
        <textarea rows={4} value={application?.linkedinNote ?? ""} onChange={(e) => application && store.patchApplication(application.id, { linkedinNote: e.target.value })} className="w-full border border-line bg-card px-3 py-2" />
        <div className="flex flex-wrap gap-2">
          <button type="button" className="border border-line px-3 py-2 text-sm" onClick={() => void generate("linkedin")}>{busy === "linkedin" ? "Writing…" : "Draft note"}</button>
          <button type="button" className="border border-line px-3 py-2 text-sm" onClick={() => void navigator.clipboard.writeText(application?.linkedinNote || "")}>Copy</button>
          <a className="border border-line px-3 py-2 text-sm" href="https://www.linkedin.com/messaging/" target="_blank" rel="noreferrer">Open LinkedIn messages</a>
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="text-3xl">Email a person, after you say so</h2>
        <label className="block text-sm">Recruiter or hiring email
          <input value={application?.recruiterEmail ?? ""} onChange={(e) => application && store.patchApplication(application.id, { recruiterEmail: e.target.value })} className="mt-1 w-full border border-line bg-card px-3 py-2" placeholder="name@company.com" />
        </label>
        <button type="button" className="border border-line px-3 py-2 text-sm" onClick={() => void generate("email")}>
          {busy === "email" ? "Writing…" : "Draft email"}
        </button>
        {!store.profile.emailConsent && <p className="text-sm text-danger">Consent is off. Turn it on in Settings before sending.</p>}
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={approved} onChange={(e) => setApproved(e.target.checked)} />
          I approve sending the draft I can read below, and only that draft.
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          <input value={store.profile.smtpHost} onChange={(e) => store.updateProfile({ smtpHost: e.target.value })} placeholder="SMTP host" className="border border-line bg-card px-3 py-2" />
          <input value={store.profile.smtpPort} onChange={(e) => store.updateProfile({ smtpPort: e.target.value })} placeholder="Port" className="border border-line bg-card px-3 py-2" />
          <input value={store.profile.smtpUser} onChange={(e) => store.updateProfile({ smtpUser: e.target.value })} placeholder="SMTP user" className="border border-line bg-card px-3 py-2" />
          <input value={smtpPass} onChange={(e) => setSmtpPass(e.target.value)} placeholder="SMTP password (not stored)" type="password" className="border border-line bg-card px-3 py-2" />
          <input value={store.profile.smtpFrom} onChange={(e) => store.updateProfile({ smtpFrom: e.target.value })} placeholder="From address" className="border border-line bg-card px-3 py-2 sm:col-span-2" />
        </div>
        <ul className="space-y-4">
          {relatedMail.map((mail) => (
            <li key={mail.id} className="border border-line p-3">
              <input value={mail.to} onChange={(e) => store.patchOutreach(mail.id, { to: e.target.value })} className="w-full border border-line bg-card px-2 py-1" />
              <input value={mail.subject} onChange={(e) => store.patchOutreach(mail.id, { subject: e.target.value })} className="mt-2 w-full border border-line bg-card px-2 py-1" />
              <textarea value={mail.body} onChange={(e) => store.patchOutreach(mail.id, { body: e.target.value })} rows={6} className="mt-2 w-full border border-line bg-card px-2 py-1" />
              <label className="mt-2 block text-sm">Follow-up date
                <input type="date" value={mail.followUpOn ?? ""} onChange={(e) => store.patchOutreach(mail.id, { followUpOn: e.target.value || null })} className="ml-2 border border-line bg-card px-2 py-1" />
              </label>
              <p className="mt-2 text-sm text-muted">Status: {mail.status}{mail.error ? ` — ${mail.error}` : ""}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" className="bg-ink px-3 py-2 text-sm text-paper" onClick={() => void send(mail.id, mail.to, mail.subject, mail.body, "gmail")}>Send with Gmail</button>
                <button type="button" className="border border-line px-3 py-2 text-sm" onClick={() => void send(mail.id, mail.to, mail.subject, mail.body, "smtp")}>Send with SMTP</button>
                <button type="button" className="text-sm underline" onClick={() => store.patchOutreach(mail.id, { status: "opened" })}>Mark opened</button>
                <button type="button" className="text-sm underline" onClick={() => store.patchOutreach(mail.id, { status: "replied" })}>Mark replied</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
      {note && <p className="text-sm" role="status">{note}</p>}
    </article>
  );
}

function Draft({ title, value, onChange, onGenerate, busy, onDocx, onPdf, actionLabel = "Write this", placeholder, hint, error }: { title: string; value: string; onChange: (v: string) => void; onGenerate: () => void; busy: boolean; onDocx: () => void; onPdf: () => void; actionLabel?: string; placeholder?: string; hint?: string; error?: string }) {
  return (
    <section className="space-y-3">
      <h2 className="text-3xl">{title}</h2>
      {!value && hint && <p className="text-sm text-muted">{hint}</p>}
      <textarea rows={10} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="w-full border border-line bg-card px-3 py-2" />
      {error && <p className="text-sm text-danger" role="status">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="button" className="border border-line" onClick={onGenerate}>{busy ? "Writing…" : actionLabel}</button>
        <button type="button" className="border border-line px-3 py-2 text-sm" onClick={onDocx} disabled={!value}>DOCX</button>
        <button type="button" className="border border-line px-3 py-2 text-sm" onClick={onPdf} disabled={!value}>Print / PDF</button>
      </div>
    </section>
  );
}
