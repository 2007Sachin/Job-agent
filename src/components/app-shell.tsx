"use client";

import { CommandPalette } from "./command-palette";
import { ThemeToggle } from "./theme-toggle";
import { Toasts } from "./toast";
import { HelperMark } from "./helper-mark";
import { liveStatus } from "@/lib/helper-desk";
import { plainBot } from "@/lib/plain";
import { useStore } from "@/lib/store";
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
  const helper = params.get("helper");

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/login");
    else if (!profile.onboarded && pathname !== "/onboarding") router.replace("/onboarding");
  }, [ready, user, profile.onboarded, pathname, router]);

  if (!ready || !user) return <p className="p-8 text-sm text-muted">Loading…</p>;

  const wide = pathname.startsWith("/chat") || pathname.startsWith("/rooms");
  const last = (roomId: string) => messages.filter((m) => m.conversationId === roomId).at(-1)?.content;

  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <aside className="flex flex-col bg-[var(--rail)] md:sticky md:top-0 md:h-screen">
        <div className="flex items-center gap-2 px-3 pt-3">
          <button type="button" className="min-h-9 flex-1 rounded-full bg-white px-3 text-left text-[13px] text-muted shadow-none" onClick={() => window.dispatchEvent(new Event("jobagent-search"))}>Search</button>
          <Link href="/bots" aria-label="New helper" className="flex h-8 w-8 items-center justify-center rounded-full text-lg">+</Link>
          <ThemeToggle />
        </div>
        <nav className="mt-2 flex-1 space-y-1 overflow-y-auto px-2 pb-3 text-[13px]">
          <Link href="/inbox" className={`flex items-center gap-2 rounded-lg px-2 py-2 ${pathname === "/inbox" ? "bg-black/5" : ""}`}>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[11px]">In</span>
            Inbox
          </Link>
          <Section title="Group chats" open={openGroups} onToggle={() => setOpenGroups((v) => !v)}>
            {rooms.map((room) => (
              <Link key={room.id} href={`/rooms/${room.id}`} className="block rounded-lg px-2 py-1.5 hover:bg-black/5">
                <span className="font-semibold">{room.name}</span>
                <span className="block truncate text-[var(--muted)]">{last(room.id) || "No messages yet"}</span>
              </Link>
            ))}
            {!rooms.length && <Link href="/rooms" className="block px-2 py-1 text-[var(--muted)]">Start a group chat</Link>}
          </Section>
          <Section title="Helpers" open={openHelpers} onToggle={() => setOpenHelpers((v) => !v)}>
            {bots.map((bot) => {
              const on = pathname.startsWith("/chat") && (helper ? helper === bot.id : bot.id === bots[0]?.id);
              return (
                <Link key={bot.id} href={`/chat?helper=${bot.id}`} className={`group flex items-start gap-2 rounded-lg px-1 py-1.5 ${on ? "bg-black/5" : "hover:bg-black/5"}`}>
                  <span className="mt-1 text-[10px] text-[var(--muted)]">›</span>
                  <HelperMark name={plainBot(bot.name)} />
                  <span className="min-w-0 flex-1">
                    <span className="font-semibold">{plainBot(bot.name)}</span>
                    <span className="ml-1 text-[var(--muted)]">{bot.role.split(" ").slice(0, 2).join(" ")}</span>
                    <span className="block truncate text-[var(--muted)]">{liveStatus(bot)}</span>
                  </span>
                </Link>
              );
            })}
          </Section>
          <Section title="Tools" open={openTools} onToggle={() => setOpenTools((v) => !v)}>
            <Tool href="/automations" label="Automations" />
            <Tool href="/team" label="Team map" />
            <Tool href="/shared" label="Published items" />
            <Tool href="/apps" label="Connected apps" />
            <Tool href="/jobs" label="Find jobs" />
            <Tool href="/tracker" label="My applications" />
          </Section>
        </nav>
        <div className="flex items-center gap-2 px-3 py-3">
          <Link href="/settings" className="flex min-w-0 flex-1 items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-[11px] text-white">{(user.email[0] || "Y").toUpperCase()}</span>
            <span className="truncate font-semibold">You</span>
          </Link>
          <Link href="/apps" aria-label="Connections" className="text-[var(--muted)]">⌁</Link>
          <button type="button" className="text-[12px] text-[var(--muted)]" onClick={() => void signOut().then(() => router.push("/"))}>Out</button>
        </div>
      </aside>
      <div className="min-w-0 bg-[var(--paper)]">
        <div className={wide ? "h-full" : "mx-auto max-w-3xl px-6 py-8"}>{children}</div>
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
        <span className="mr-1">{open ? "⌄" : "›"}</span>
        {title}
        <span className="ml-auto tracking-widest">⋮⋮</span>
      </button>
      {open && <div className="mt-1 space-y-0.5">{children}</div>}
    </div>
  );
}

function Tool({ href, label }: { href: string; label: string }) {
  return <Link href={href} className="block rounded-lg px-2 py-1.5 hover:bg-black/5">{label}</Link>;
}
