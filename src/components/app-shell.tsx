"use client";

import { CommandPalette } from "./command-palette";
import { ThemeToggle } from "./theme-toggle";
import { useStore } from "@/lib/store";
import { Home, MessageSquare, Briefcase, Columns3, LineChart, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const nav = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/tracker", label: "Applications", icon: Columns3 },
  { href: "/analytics", label: "Insights", icon: LineChart },
];

const workspace = [
  ["/bots", "Bots"],
  ["/skills", "Skills"],
  ["/connectors", "Connectors"],
  ["/schedules", "Routines"],
  ["/workspace", "Memory and usage"],
  ["/library", "Library"],
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
    else if (profile.onboarded && pathname === "/onboarding") router.replace("/dashboard");
  }, [ready, user, profile.onboarded, pathname, router]);

  if (!ready || !user) {
    return <p className="px-8 py-16 text-muted">Opening the desk…</p>;
  }

  const inWorkspace = workspace.some(([href]) => pathname === href || pathname.startsWith(`${href}/`));

  return (
    <div className="min-h-screen md:grid md:grid-cols-[232px_1fr]">
      <aside className="border-b border-line bg-paper md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-4 py-5 md:block">
          <Link href="/dashboard" className="font-display text-2xl">Job-agent</Link>
          <div className="md:mt-4"><ThemeToggle /></div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-3 md:flex-col md:px-2">
          {nav.map((item) => {
            const on = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} aria-current={on ? "page" : undefined} className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm ${on ? "bg-ink text-paper" : "text-muted hover:text-ink"}`}>
                <Icon size={16} aria-hidden />
                {item.label}
              </Link>
            );
          })}
          <details className="md:mt-4" open={inWorkspace}>
            <summary className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-sm ${inWorkspace ? "text-ink" : "text-muted"}`}>
              <LayoutGrid size={16} aria-hidden /> Workspace
            </summary>
            <div className="ml-6 flex flex-col py-1">
              {workspace.map(([href, label]) => (
                <Link key={href} href={href} className={`px-3 py-1.5 text-sm ${pathname === href ? "text-ink" : "text-muted"}`}>{label}</Link>
              ))}
            </div>
          </details>
        </nav>
        <div className="hidden px-4 py-6 text-sm text-muted md:block">
          <p className="truncate">{user.email}</p>
          <button type="button" className="mt-2 underline" onClick={() => void signOut().then(() => router.push("/"))}>Sign out</button>
        </div>
      </aside>
      <div>
        {syncNote && <p className="border-b border-line px-6 py-2 text-sm text-muted">{syncNote}</p>}
        <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
        <CommandPalette />
      </div>
    </div>
  );
}
