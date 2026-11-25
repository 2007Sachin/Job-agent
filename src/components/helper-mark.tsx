export function HelperMark({ name, active }: { name: string; active?: boolean }) {
  const letter = (name.trim()[0] || "H").toUpperCase();
  return (
    <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${active ? "bg-brass text-paper" : "bg-ink text-paper"}`} aria-hidden>
      {letter}
    </span>
  );
}
