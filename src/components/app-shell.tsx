"use client";

import { CommandPalette } from "./command-palette";
import { ThemeToggle } from "./theme-toggle";
import { Toasts } from "./toast";
import { HelperMark } from "./helper-mark";
import { liveStatus } from "@/lib/helper-desk";
import { plainBot } from "@/lib/plain";
import { useStore } from "@/lib/store";
import { Inbox, LogOut, Menu, Plus, Search, Settings, Share2, Users, Workflow, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="p-6 text-sm">Loading…</p>}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const store = useStore();
  const { user, profile, ready, signOut, bots, rooms, messages } = store;
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const [openGroups, setOpenGroups] = useState(true);
  const [openHelpers, setOpenHelpers] = useState(true);
  const [openTools, setOpenTools] = useState(true);
  const [nav, setNav] = useState(false);
  const helper = params.get("helper");

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/login");
    else if (!profile.onboarded && pathname !== "/onboarding") router.replace("/onboarding");
  }, [ready, user, profile.onboarded, pathname, router]);

  useEffect(() => { setNav(false); }, [pathname, helper]);

  if (!ready || !user) return <p className="p-8 text-sm text-muted">Loading…</p>;

  const wide = pathname.startsWith("/chat") || pathname.startsWith("/rooms");

  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <div className="flex items-center justify-between bg-[var(--rail)] px-3 py-2 md:hidden">
        <button type="button" aria-label="Open menu" onClick={() => setNav(true)}><Menu size={18} /></button>
        <span className="font-semibold">Job-agent</span>
        <ThemeToggle />
      </div>
      {nav && <button type="button" aria-label="Close menu" className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setNav(false)} />}
      <aside className={`${nav ? "fixed inset-y-0 left-0 z-40 flex w-[240px]" : "hidden md:flex"} flex-col bg-[var(--rail)] md:sticky md:top-0 md:h-screen`}>
        <div className="flex items-center gap-2 px-3 pt-3">
          <button type="button" className="flex min-h-9 flex-1 items-center gap-2 rounded-full bg-white px-3 text-left text-[13px] text-muted" onClick={() => window.dispatchEvent(new Event("jobagent-search"))}>
            <Search size={14} aria-hidden /> Search
          </button>
          <Link href="/bots" aria-label="New helper" className="flex h-8 w-8 items-center justify-center rounded-full"><Plus size={16} /></Link>
          <button type="button" className="md:hidden" aria-label="Close menu" onClick={() => setNav(false)}><X size={16} /></button>
        </div>
        <nav className="mt-2 flex-1 space-y-1 overflow-y-auto px-2 pb-3 text-[13px]">
          <Link href="/inbox" className={`flex items-center gap-2 rounded-lg px-2 py-2 ${pathname === "/inbox" ? "bg-black/5" : ""}`}>
            <Inbox size={16} aria-hidden /> Inbox
          </Link>
          <Section title="Group chats" open={openGroups} onToggle={() => setOpenGroups((v) => !v)}>
            {rooms.map((room) => (
              <Link key={room.id} href={`/rooms/${room.id}`} className="block rounded-lg px-2 py-1.5 hover:bg-black/5">
                <span className="flex items-center gap-1 font-semibold"><Users size={14} aria-hidden /> {room.name}</span>
                <span className="block truncate text-[var(--muted)]">{messages.filter((m) => m.conversationId === room.id).at(-1)?.content || "No messages yet"}</span>
              </Link>
            ))}
            {!rooms.length && <Link href="/rooms" className="block px-2 py-1 text-[var(--muted)]">Start a group chat</Link>}
          </Section>
          <Section title="Helpers" open={openHelpers} onToggle={() => setOpenHelpers((v) => !v)}>
            {bots.map((bot) => {
              const on = pathname.startsWith("/chat") && (helper ? helper === bot.id : bot.id === bots[0]?.id);
              return (
                <Link key={bot.id} href={`/chat?helper=${bot.id}`} className={`flex items-start gap-2 rounded-lg px-2 py-1.5 ${on ? "bg-black/5" : "hover:bg-black/5"}`}>
                  <HelperMark name={plainBot(bot.name)} />
                  <span className="min-w-0 flex-1">
                    <span className="font-semibold">{plainBot(bot.name)}</span>
                    <span className="mt-0.5 line-clamp-2 block text-[var(--muted)]">{bot.role}</span>
                    <span className="block truncate text-[var(--muted)]">{liveStatus(bot)}</span>
                  </span>
                </Link>
              );
            })}
          </Section>
          <Section title="Tools" open={openTools} onToggle={() => setOpenTools((v) => !v)}>
            <Tool href="/automations" icon={Workflow} label="Automations" />
            <Tool href="/team" icon={Users} label="Team map" />
            <Tool href="/shared" icon={Share2} label="Published items" />
            <Tool href="/apps" icon={Settings} label="Connected apps" />
            <Tool href="/jobs" icon={Search} label="Find jobs" />
            <Tool href="/tracker" icon={Inbox} label="My applications" />
            <Tool href="/analytics" icon={Workflow} label="How you are doing" />
            <Tool href="/plans" icon={Share2} label="Plans" />
          </Section>
        </nav>
        <div className="flex items-center gap-2 px-3 py-3">
          <Link href="/settings" className="flex min-w-0 flex-1 items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-[11px] text-white">{(user.email[0] || "Y").toUpperCase()}</span>
            <span className="truncate font-semibold">You</span>
          </Link>
          <ThemeToggle />
          <Link href="/settings" aria-label="Settings"><Settings size={16} /></Link>
          <button type="button" aria-label="Sign out" onClick={() => void signOut().then(() => router.push("/"))}><LogOut size={16} /></button>
        </div>
      </aside>
      <div className="min-w-0 bg-[var(--paper)]">
        <div className={wide ? "h-full" : "mx-auto max-w-3xl px-4 py-6 md:px-6"}>{children}</div>
        <CommandPalette />
        <Toasts />
      </div>
    </div>
  );
}

function Section({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="pt-3">
      <button type="button" className="flex w-full items-center px-2 text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]" onClick={onToggle}>
        <span className="mr-1">{open ? "▾" : "▸"}</span>
        {title}
      </button>
      {open && <div className="mt-1 space-y-0.5">{children}</div>}
    </div>
  );
}

function Tool({ href, label, icon: Icon }: { href: string; label: string; icon: typeof Search }) {
  return (
    <Link href={href} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-black/5">
      <Icon size={15} aria-hidden /> {label}
    </Link>
  );
}
