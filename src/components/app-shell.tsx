"use client";

import { CommandPalette } from "./command-palette";
import { ThemeToggle } from "./theme-toggle";
import { Toasts } from "./toast";
import { useStore } from "@/lib/store";
import { Briefcase, MessageSquare, Columns3, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const nav = [
  { href: "/jobs", label: "Find jobs", icon: Briefcase },
  { href: "/tracker", label: "My applications", icon: Columns3 },
  { href: "/chat", label: "Chat with helper", icon: MessageSquare },
];

const more = [
  ["/dashboard", "Home"],
  ["/analytics", "How you are doing"],
  ["/bots", "Helper setup"],
  ["/skills", "Helper instructions"],
  ["/connectors", "Job-site links"],
  ["/schedules", "Reminders"],
  ["/workspace", "Notes and usage"],
  ["/library", "Saved drafts"],
  ["/settings", "Settings"],
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, profile, ready, signOut, syncNote } = useStore();
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

  const inMore = more.some(([href]) => pathname === href);

  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <aside className="border-b border-line bg-paper md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-4 py-4 md:block">
          <Link href="/jobs" className="text-xl font-semibold">Job-agent</Link>
          <div className="md:mt-3"><ThemeToggle /></div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-3 md:flex-col">
          {nav.map((item) => {
            const on = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} aria-current={on ? "page" : undefined} className={`flex min-h-11 items-center gap-2 whitespace-nowrap rounded-lg px-3 ${on ? "bg-ink text-paper" : ""}`}>
                <Icon size={18} aria-hidden />
                {item.label}
              </Link>
            );
          })}
          <details className="md:mt-6" open={inMore}>
            <summary className="flex min-h-11 cursor-pointer items-center gap-2 px-3">
              <MoreHorizontal size={18} aria-hidden /> More tools
            </summary>
            <div className="ml-7 flex flex-col py-1">
              {more.map(([href, label]) => (
                <Link key={href} href={href} className="flex min-h-11 items-center px-3">{label}</Link>
              ))}
            </div>
          </details>
        </nav>
        <div className="hidden px-4 py-6 md:block">
          <p className="truncate text-sm">{user.email}</p>
          <button type="button" className="mt-2 underline" onClick={() => void signOut().then(() => router.push("/"))}>Sign out</button>
        </div>
      </aside>
      <div>
        {syncNote && <p className="border-b border-line px-6 py-2">{syncNote}</p>}
        <div className="mx-auto max-w-3xl px-6 py-8">{children}</div>
        <CommandPalette />
        <Toasts />
      </div>
    </div>
  );
}
