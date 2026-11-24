"use client";

import { CommandPalette } from "./command-palette";
import { ThemeToggle } from "./theme-toggle";
import { useStore } from "@/lib/store";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const nav = [
  { href: "/chat", label: "Chat" },
  { href: "/rooms", label: "Rooms" },
  { href: "/tasks", label: "Tasks" },
  { href: "/schedules", label: "Schedules" },
  { href: "/library", label: "Library" },
  { href: "/activity", label: "Activity" },
  { href: "/workspace", label: "Workspace" },
  { href: "/bots", label: "Bots" },
  { href: "/jobs", label: "Jobs" },
  { href: "/settings", label: "Settings" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, profile, ready, signOut, syncNote } = useStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/login");
    else if (!profile.onboarded && pathname !== "/onboarding") router.replace("/onboarding");
    else if (profile.onboarded && pathname === "/onboarding") router.replace("/chat");
  }, [ready, user, profile.onboarded, pathname, router]);

  if (!ready || !user) {
    return <p className="px-6 py-16 text-muted">Opening your desk…</p>;
  }

  return (
    <div className="min-h-screen md:grid md:grid-cols-[220px_1fr]">
      <aside className="border-b border-line md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-5 py-4 md:block">
          <Link href="/chat" className="font-display text-2xl">Job-agent</Link>
          <div className="md:mt-6 md:px-0">
            <ThemeToggle />
          </div>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-3 pb-3 md:flex-col md:px-3 md:pb-6">
          {nav.map((item) => {
            const on = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap px-3 py-2 text-sm ${on ? "bg-ink text-paper" : "text-muted hover:text-ink"}`}
                aria-current={on ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden px-5 pb-6 text-sm text-muted md:block">
          <p className="truncate">{user.email}</p>
          <button type="button" className="mt-2 underline" onClick={() => void signOut().then(() => router.push("/"))}>
            Sign out
          </button>
        </div>
      </aside>
      <div>
        {syncNote && <p className="border-b border-line px-5 py-2 text-sm text-muted">{syncNote}</p>}
        <div className="mx-auto max-w-5xl px-5 py-8">{children}</div>
        <CommandPalette />
      </div>
    </div>
  );
}
