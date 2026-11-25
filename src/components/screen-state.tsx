export function ScreenState({ kind, title, detail, onRetry }: { kind: "empty" | "loading" | "error"; title: string; detail: string; onRetry?: () => void }) {
  if (kind === "loading") {
    return (
      <div className="space-y-2" role="status" aria-label={title}>
        <div className="h-4 w-1/3 rounded-lg bg-[var(--panel)]" />
        <div className="h-16 rounded-xl bg-[var(--panel)]" />
        <div className="h-16 rounded-xl bg-[var(--panel)]" />
      </div>
    );
  }
  return (
    <div className="rounded-xl bg-[var(--panel)] p-4" role={kind === "error" ? "alert" : "status"}>
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-[13px] text-[var(--muted)]">{detail}</p>
      {onRetry && <button type="button" className="mt-3 bg-[var(--accent)] text-white" onClick={onRetry}>Try again</button>}
    </div>
  );
}
