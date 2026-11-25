"use client";

import { useStore } from "@/lib/store";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { emptyProfile } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function SettingsBody() {
  const store = useStore();
  const params = useSearchParams();
  const gmail = params.get("gmail");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const p = store.profile;

  function exportLocal() {
    const blob = new Blob([JSON.stringify({
      profile: store.profile,
      applications: store.applications,
      outreach: store.outreach,
      exportedAt: new Date().toISOString(),
    }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "job-agent-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function exportRemote() {
    const sb = getBrowserSupabase();
    const session = sb ? (await sb.auth.getSession()).data.session : null;
    if (!session) {
      setMessage("Remote export needs a Supabase session. The file from this device is still available.");
      exportLocal();
      return;
    }
    const res = await fetch("/api/account/export", { headers: { Authorization: `Bearer ${session.access_token}` } });
    const json = await res.json();
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "job-agent-supabase.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function destroy() {
    if (confirm !== "DELETE") {
      setMessage("Type DELETE to confirm.");
      return;
    }
    const sb = getBrowserSupabase();
    const session = sb ? (await sb.auth.getSession()).data.session : null;
    if (session) {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "DELETE" }),
      });
      const json = await res.json();
      setMessage(json.note || json.error || "Account data deleted.");
    } else {
      setMessage("Demo data removed from this browser.");
    }
    store.wipeLocal();
    store.updateProfile({ ...emptyProfile(), email: store.user?.email ?? "" });
  }

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-5xl">Settings</h1>
      {gmail === "connected" && <p className="text-sm text-moss">Gmail is connected for sending.</p>}
      {gmail === "missing" && <p className="text-sm text-danger">Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET before connecting Gmail.</p>}
      {(gmail === "state" || gmail === "token") && <p className="text-sm text-danger">Gmail connection did not complete. Try again.</p>}
      <label className="block text-sm">Name
        <input value={p.fullName} onChange={(e) => store.updateProfile({ fullName: e.target.value })} className="mt-1 w-full border border-line bg-card px-3 py-2" />
      </label>
      <label className="block text-sm">Email on applications
        <input value={p.email} onChange={(e) => store.updateProfile({ email: e.target.value })} className="mt-1 w-full border border-line bg-card px-3 py-2" />
      </label>
      <label className="block text-sm">Target roles
        <input value={p.targetRoles.join(", ")} onChange={(e) => store.updateProfile({ targetRoles: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} className="mt-1 w-full border border-line bg-card px-3 py-2" />
      </label>
      <label className="block text-sm">Locations
        <input value={p.locations.join(", ")} onChange={(e) => store.updateProfile({ locations: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} className="mt-1 w-full border border-line bg-card px-3 py-2" />
      </label>
      <label className="block text-sm">Skills
        <input value={p.skills.join(", ")} onChange={(e) => store.updateProfile({ skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} className="mt-1 w-full border border-line bg-card px-3 py-2" />
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={p.emailConsent}
          onChange={(e) => store.updateProfile({ emailConsent: e.target.checked, consentAt: e.target.checked ? new Date().toISOString() : null })}
        />
        <span>I consent to Job-agent sending email I explicitly approve, through my own Gmail or SMTP account. I can withdraw this here. Withdrawal stops future sends. It does not unsend mail already delivered.</span>
      </label>
      {p.consentAt && <p className="text-sm text-muted">Consent recorded {p.consentAt}</p>}
      <p>
        <a href="/api/email/gmail/start" className="underline">Connect Gmail for sending</a>
      </p>
      <div className="flex flex-wrap gap-3">
        <button type="button" className="border border-line px-3 py-2" onClick={exportLocal}>Export data on this device</button>
        <button type="button" className="border border-line px-3 py-2" onClick={() => void exportRemote()}>Export Supabase copy</button>
      </div>
      <div className="border border-line p-4">
        <h2 className="text-2xl">Delete account data</h2>
        <p className="mt-2 text-sm text-muted">Type DELETE. Demo mode clears this browser. A Supabase session also deletes your rows, and the auth user when the service role key is set.</p>
        <input value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-3 w-full border border-line bg-card px-3 py-2" placeholder="DELETE" />
        <button type="button" className="mt-3 bg-danger px-3 py-2 text-paper" onClick={() => void destroy()}>Delete</button>
      </div>
      {message && <p className="text-sm" role="status">{message}</p>}
      <button type="button" className="text-sm underline" onClick={() => void store.signOut()}>Sign out</button>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<p className="text-muted">Loading settings…</p>}>
      <SettingsBody />
    </Suspense>
  );
}
