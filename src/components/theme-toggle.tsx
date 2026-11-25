"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.dataset.theme === "dark");
  }, []);
  function toggle() {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    if (next === "dark") document.documentElement.dataset.theme = "dark";
    else delete document.documentElement.dataset.theme;
    localStorage.setItem("jobagent-theme", next);
    setDark(next === "dark");
  }
  return (
    <button type="button" onClick={toggle} className="inline-flex items-center gap-2 text-sm text-muted" aria-label="Toggle color theme">
      {dark ? <Sun size={16} aria-hidden /> : <Moon size={16} aria-hidden />}
      <span className="hidden sm:inline">{dark ? "Light" : "Dark"}</span>
    </button>
  );
}
