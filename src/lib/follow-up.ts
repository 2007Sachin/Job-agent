const ZONE = "Asia/Calcutta";

export function formatFollowUpDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  const utc = new Date(Date.UTC(year, month - 1, day, 6, 30));
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: ZONE }).format(utc);
}

export function followUpTiming(iso: string, now = new Date()) {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: ZONE }).format(now);
  if (iso < today) return "Overdue";
  if (iso === today) return "Due today";
  return "";
}
