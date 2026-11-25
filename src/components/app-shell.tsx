"use client";

import { CommandPalette } from "./command-palette";
import { ThemeToggle } from "./theme-toggle";
import { Toasts } from "./toast";
import { HelperMark } from "./helper-mark";
import { liveStatus } from "@/lib/helper-desk";
import { plainBot } from "@/lib/plain";
import { useStore } from "@/lib/store";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const store = useStore();
  const { user, profile, ready, signOut, syncNote, bots, activity } = store;
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/login");
    else if (!profile.onboarded && pathname !== "/onboarding") router.replace("/onboarding");
  }, [ready, user, profile.onboarded, pathname, router]);

  if (!ready || !user) {
    return <p className="px-8 py-16 text-muted">Loading…</p>;
  }

  const wide = pathname.startsWith("/chat") || pathname.startsWith("/rooms");
  const notices = activity.filter((item) => /updated|paused|idle|active|ready/i.test(item.text)).slice(0, 1);

  return (
    <div className="min-h-screen md:grid md:grid-cols-[260px_1fr]">
      <aside className="bar flex flex-col border-b border-line md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-4 py-4">
          <Link href="/chat" className="text-xl font-semibold">Job-agent</Link>
          <ThemeToggle />
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 pb-3">
          <button type="button" className="min-h-11 px-3 text-left" onClick={() => window.dispatchEvent(new Event("jobagent-search"))}>Search</button>
          <ShellLink href="/inbox" on={pathname === "/inbox"}>Inbox{notices.length ? " · 1" : ""}</ShellLink>
          <ShellLink href="/rooms" on={pathname.startsWith("/rooms")}>Group chats</ShellLink>
          <p className="mt-4 px-3 text-sm font-semibold">Helpers</p>
          {bots.map((bot) => (
            <Link key={bot.id} href={`/chat?helper=${bot.id}`} className="flex min-h-11 items-center gap-2 px-3">
              <HelperMark name={plainBot(bot.name)} active={pathname === "/chat"} />
              <span className="min-w-0">
                <span className="block truncate">{plainBot(bot.name)}</span>
                <span className="block truncate text-sm text-muted">{liveStatus(bot)}</span>
              </span>
            </Link>
          ))}
          <p className="mt-4 px-3 text-sm font-semibold">Tools</p>
          <ShellLink href="/automations" on={pathname === "/automations"}>Automations</ShellLink>
          <ShellLink href="/team" on={pathname === "/team"}>Team map</ShellLink>
          <ShellLink href="/shared" on={pathname === "/shared"}>Shared items</ShellLink>
          <ShellLink href="/apps" on={pathname === "/apps"}>Connected apps</ShellLink>
          <ShellLink href="/jobs" on={pathname.startsWith("/jobs")}>Find jobs</ShellLink>
          <ShellLink href="/tracker" on={pathname === "/tracker"}>My applications</ShellLink>
        </nav>
        <div className="border-t border-line px-4 py-4">
          <Link href="/settings" className="block font-semibold">You</Link>
          <p className="truncate text-sm">{user.email}</p>
          <button type="button" className="mt-1 underline" onClick={() => void signOut().then(() => router.push("/"))}>Sign out</button>
        </div>
      </aside>
      <div className="min-w-0">
        {syncNote && <p className="border-b border-line px-6 py-2">{syncNote}</p>}
        <div className={wide ? "" : "mx-auto max-w-3xl px-6 py-8"}>{children}</div>
        <CommandPalette />
        <Toasts />
      </div>
    </div>
  );
}

function ShellLink({ href, on, children }: { href: string; on: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} aria-current={on ? "page" : undefined} className={`flex min-h-11 items-center rounded-lg px-3 ${on ? "bg-ink text-paper" : ""}`}>{children}</Link>
  );
}
