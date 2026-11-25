"use client";

import { ADVANCED_KEY, readAdvanced } from "@/lib/advanced";
import { useStore } from "@/lib/store";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { emptyProfile } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function AdvancedToggle() {
  const [on, setOn] = useState(false);
  useEffect(() => { setOn(readAdvanced()); }, []);
  return (
    <section className="card space-y-2 p-4">
      <h2 className="text-[16px] font-medium">Advanced</h2>
      <p className="text-[13px] text-[var(--muted)]">Off by default. Turns on the helper desk, group chats, automations, and the model picker.</p>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={on} onChange={(e) => { setOn(e.target.checked); localStorage.setItem(ADVANCED_KEY, e.target.checked ? "on" : "off"); }} />
        Show advanced tools
      </label>
      <p className="text-[13px] text-[var(--muted)]">Drafts use a free AI model when your AI key is set in the server environment.</p>
    </section>
  );
}

function ExtensionPair() {
  const [token, setToken] = useState("");
  const [note, setNote] = useState("");
  async function pair() {
    const res = await fetch("/api/extension/token", { method: "POST" });
    const json = await res.json();
    if (!res.ok) { setNote(json.error || "Could not make a token."); return; }
    setToken(json.token);
    localStorage.setItem("jobagent.extensionToken", json.token);
    setNote("Token ready. Paste it into the extension popup. You can revoke it here.");
  }
  async function revoke() {
    if (!token) return;
    await fetch("/api/extension/revoke", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
    localStorage.removeItem("jobagent.extensionToken");
    setToken("");
    setNote("Token revoked on this server process.");
  }
  async function testSave() {
    const saved = token || localStorage.getItem("jobagent.extensionToken") || "";
    const res = await fetch("/api/extension/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: saved, title: "Extension test save", company: "Not a real employer", location: "Nowhere", description: "This is a test of the save button. It is not a job we found.", url: "http://127.0.0.1:3000/fixture/job" }),
    });
    const json = await res.json();
    setNote(res.ok ? `Test save worked: ${json.job.title}. Open Find jobs and press Check extension saves.` : (json.error || "Test failed"));
  }
  return (
    <section className="card space-y-3 p-4">
      <h2 className="text-2xl">Connect the extension</h2>
      <p>The extension reads only the job page you are viewing, and only after you click Save to Job-agent. It does not crawl, paginate, or apply. LinkedIn’s terms restrict automation, so Job-agent never signs in to LinkedIn or clicks anything there for you.</p>
      <p><a className="underline" href="/job-agent-extension.zip" download>Download the Job-agent extension</a></p>
      <ol className="list-decimal space-y-1 pl-5">
        <li>Download the Job-agent extension (the zip above).</li>
        <li>Unzip it. You should see a folder named extension.</li>
        <li>In Chrome, open chrome://extensions and turn on Developer mode.</li>
        <li>Choose Load unpacked and select that unzipped extension folder.</li>
        <li>Press Make a pairing token and paste it into the extension popup.</li>
      </ol>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="bg-brass" onClick={() => void pair()}>Make a pairing token</button>
        <button type="button" className="border border-line" onClick={() => void testSave()}>Test a save</button>
        <button type="button" className="border border-line" onClick={() => void revoke()}>Revoke token</button>
      </div>
      {token && <p className="break-all text-sm">{token}</p>}
      {note && <p role="status">{note}</p>}
    </section>
  );
}

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
      <h1 className="text-4xl">Settings</h1>
      <AdvancedToggle />
      <ExtensionPair />
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
