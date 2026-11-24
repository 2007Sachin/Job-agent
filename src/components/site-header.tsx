"use client";

import { ThemeToggle } from "./theme-toggle";
import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="font-display text-2xl tracking-tight">Job-agent</Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-muted hover:text-ink">{l.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/login" className="hidden text-sm sm:inline">Log in</Link>
          <Link href="/signup" className="bg-ink px-3 py-2 text-sm text-paper">Start</Link>
          <button type="button" className="text-sm md:hidden" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
            Menu
          </button>
        </div>
      </div>
      {open && (
        <div className="flex flex-col gap-3 border-t border-line px-5 py-4 md:hidden">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</Link>
          ))}
          <Link href="/login">Log in</Link>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-sm text-muted sm:flex-row sm:justify-between">
        <p>Job-agent prepares applications. You decide what gets sent.</p>
        <p>Built for seekers across India, any role.</p>
      </div>
    </footer>
  );
}
