export type Bucket = { day: string; count: number };

export function takeDailyToken(
  store: Map<string, Bucket>,
  key: string,
  cap: number,
  now = new Date(),
): { ok: boolean; remaining: number; limit: number } {
  const day = now.toISOString().slice(0, 10);
  const current = store.get(key);
  if (!current || current.day !== day) {
    store.set(key, { day, count: 1 });
    return { ok: true, remaining: Math.max(0, cap - 1), limit: cap };
  }
  if (current.count >= cap) {
    return { ok: false, remaining: 0, limit: cap };
  }
  current.count += 1;
  return { ok: true, remaining: cap - current.count, limit: cap };
}

const memory = new Map<string, Bucket>();

export function dailyCap(): number {
  const n = Number(process.env.LLM_DAILY_CAP ?? "25");
  return Number.isFinite(n) && n > 0 ? n : 25;
}

export function enforceDailyCap(key: string) {
  return takeDailyToken(memory, key, dailyCap());
}
