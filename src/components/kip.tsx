type Mood = "idle" | "thinking" | "celebrating";

/** Kip, an original river-kite mascot. Not based on any other product character. */
export function Kip({ mood = "idle", className = "h-16 w-16" }: { mood?: Mood; className?: string }) {
  const bob = mood === "thinking" ? "origin-center animate-[kip_1.4s_ease-in-out_infinite]" : "";
  return (
    <svg viewBox="0 0 80 80" className={`${className} ${bob}`} aria-hidden>
      <ellipse cx="40" cy="70" rx="18" ry="4" fill="currentColor" opacity="0.12" />
      <path d="M18 46c2-16 14-28 28-26 10 1 16 8 18 16 6 2 12 8 10 14-2 6-10 8-16 6-2 8-10 14-20 14-12 0-20-8-22-16-6 0-12-4-10-10 2-4 8-6 12 2z" fill="#9a4318" />
      <circle cx="46" cy="34" r="12" fill="#f4efe6" stroke="#1c1915" strokeWidth="2" />
      <circle cx="50" cy="33" r="1.6" fill="#1c1915" />
      <path d="M54 36c2 2 5 2 7 0" fill="none" stroke="#1c1915" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M22 44c8 4 16 4 24-2" fill="none" stroke="#1c1915" strokeWidth="2" />
      {mood === "celebrating" && <path d="M14 18l4 8M66 16l-2 8M40 8v8" stroke="#9a4318" strokeWidth="2" strokeLinecap="round" />}
      {mood === "thinking" && <circle cx="62" cy="20" r="3" fill="none" stroke="#1c1915" strokeWidth="1.5" />}
    </svg>
  );
}
