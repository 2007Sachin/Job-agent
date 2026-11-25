export function routineDue(
  schedule: { time: string; enabled: boolean; lastRun: string | null },
  now = new Date(),
) {
  if (schedule.enabled === false) return false;
  const [h, m] = schedule.time.split(":").map(Number);
  if (!Number.isFinite(h)) return false;
  const minutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  if (minutes < h * 60 + (m || 0)) return false;
  const today = now.toISOString().slice(0, 10);
  return !schedule.lastRun || schedule.lastRun.slice(0, 10) !== today;
}
