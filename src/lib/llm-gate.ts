import { createHash } from "crypto";
import { adminDb, firebaseAdminConfigured } from "./firebase/server";

export const BUSY_MESSAGE = "Busy right now, try again in a moment.";

export function globalRpm() {
  const n = Number(process.env.LLM_GLOBAL_RPM ?? "35");
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 35;
}

export function queueTimeoutMs() {
  const n = Number(process.env.LLM_QUEUE_TIMEOUT_MS ?? "15000");
  return Number.isFinite(n) && n >= 0 ? n : 15000;
}

export function cacheTtlMs() {
  const hours = Number(process.env.LLM_CACHE_TTL_HOURS ?? "24");
  const safe = Number.isFinite(hours) && hours > 0 ? hours : 24;
  return safe * 60 * 60 * 1000;
}

export function minuteKey(now = new Date()) {
  return now.toISOString().slice(0, 16);
}

export function takeRpmSlot(count: number, rpm: number) {
  if (count >= rpm) return { ok: false as const, count };
  return { ok: true as const, count: count + 1 };
}

/** Shared cache only when the prompt is public, or scoped to one user so it cannot leak. */
export function promptCacheId(input: { model: string; system: string; user: string; userId?: string; shareable?: boolean }) {
  if (!input.shareable && !input.userId) return null;
  const scope = input.shareable ? "shared" : `user:${input.userId}`;
  return createHash("sha256").update(`${scope}\n${input.model}\n${input.system}\n${input.user}\n`).digest("hex");
}

export function draftText(message?: { content?: string | null; reasoning_content?: string | null } | null) {
  return message?.content?.trim() || message?.reasoning_content?.trim() || "";
}

export function retryAfterMs(header: string | null, now = Date.now()) {
  if (!header) return 1000;
  const seconds = Number(header);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const when = Date.parse(header);
  if (Number.isFinite(when)) return Math.max(0, when - now);
  return 1000;
}

const memoryRpm = new Map<string, number>();
const memoryCache = new Map<string, { text: string; expires: number }>();

export function resetLlmGateForTests() {
  memoryRpm.clear();
  memoryCache.clear();
}

async function sleep(ms: number) {
  if (ms <= 0) return;
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function takeMemory(now: Date) {
  const key = minuteKey(now);
  const step = takeRpmSlot(memoryRpm.get(key) ?? 0, globalRpm());
  if (!step.ok) return false;
  memoryRpm.set(key, step.count);
  return true;
}

async function takeFirestore(now: Date) {
  const db = adminDb();
  if (!db) return takeMemory(now);
  const key = minuteKey(now);
  const ref = db.collection("llmBudget").doc(key);
  const rpm = globalRpm();
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const step = takeRpmSlot(Number(snap.data()?.count ?? 0), rpm);
    if (!step.ok) return false;
    tx.set(ref, { count: step.count, minute: key }, { merge: true });
    return true;
  });
}

export async function acquireGlobalSlot(now = new Date(), timeoutMs = queueTimeoutMs()) {
  const deadline = Date.now() + timeoutMs;
  let wait = 200;
  while (true) {
    const ok = firebaseAdminConfigured() ? await takeFirestore(now) : await takeMemory(new Date());
    if (ok) return;
    if (Date.now() >= deadline) throw new Error(BUSY_MESSAGE);
    const pause = Math.min(wait, deadline - Date.now());
    await sleep(pause);
    wait = Math.min(wait * 2, 2000);
    now = new Date();
  }
}

export async function readCachedDraft(id: string | null, now = Date.now()) {
  if (!id) return null;
  if (!firebaseAdminConfigured()) {
    const row = memoryCache.get(id);
    if (!row || row.expires <= now) return null;
    return row.text;
  }
  const db = adminDb();
  if (!db) return null;
  const snap = await db.collection("llmCache").doc(id).get();
  const data = snap.data();
  if (!data?.text || Number(data.expiresAt ?? 0) <= now) return null;
  return String(data.text);
}

export async function writeCachedDraft(id: string | null, text: string, now = Date.now()) {
  if (!id) return;
  const expires = now + cacheTtlMs();
  if (!firebaseAdminConfigured()) {
    memoryCache.set(id, { text, expires });
    return;
  }
  const db = adminDb();
  if (!db) return;
  await db.collection("llmCache").doc(id).set({ text, expiresAt: expires });
}
