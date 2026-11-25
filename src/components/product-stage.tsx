export function ProductStage() {
  return (
    <div className="product-stage card relative min-h-[420px] overflow-hidden p-4 sm:p-5" aria-hidden="true">
      <div className="mb-3 flex items-center gap-2 text-xs text-muted">
        <span className="size-2 rounded-full bg-[var(--accent)]" />
        <span className="size-2 rounded-full bg-[var(--line)]" />
        <span className="size-2 rounded-full bg-[var(--line)]" />
        <span className="ml-2">Job-agent</span>
      </div>
      <div className="stage-panel stage-a space-y-3">
        <p className="text-sm text-muted">You</p>
        <p className="card px-3 py-2 text-sm">Staff nurse roles in Pune, night shifts ok.</p>
        <p className="text-sm text-muted">Helper</p>
        <div className="card px-3 py-3 text-sm">
          <p className="font-semibold">3 live matches</p>
          <p className="mt-1 text-muted">City Hospital · Ward nurse · Pune</p>
          <p className="text-muted">Apollo clinic · Staff nurse · Pune</p>
          <p className="mt-2 text-xs text-faint">From public boards. Open the company page to apply.</p>
        </div>
      </div>
      <div className="stage-panel stage-b space-y-2">
        <p className="text-sm font-semibold">Resume for City Hospital</p>
        <p className="rounded-xl bg-[var(--accent-soft)] px-3 py-2 text-sm">Kept: 4 years on a medical ward in Nagpur.</p>
        <p className="rounded-xl px-3 py-2 text-sm line-through opacity-60">Dropped: a made-up ICU certificate.</p>
        <p className="text-xs text-muted">Only lines from your history stay. You edit before anything is saved.</p>
      </div>
      <div className="stage-panel stage-c space-y-3">
        <p className="text-sm font-semibold">Saved from the page you were on</p>
        <div className="card px-3 py-3 text-sm">
          <p>School counsellor · Bengaluru</p>
          <p className="text-muted">Chrome extension · click to save</p>
        </div>
        <p className="text-sm">Follow up Friday. Nothing is sent until you approve it.</p>
      </div>
    </div>
  );
}
