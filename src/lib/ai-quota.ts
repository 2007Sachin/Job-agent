import { adminDb, firebaseAdminConfigured, userFromAuthHeader } from "./firebase/server";
import { extensionSecret, readExtensionToken } from "./extension-token";
import { takeDailyToken, type Bucket } from "./rate-limit";

/** Daily AI cap uses a UTC calendar day (YYYY-MM-DD from Date#toISOString). */
export function utcAiDay(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

export function aiDailyLimit() {
  const n = Number(process.env.AI_DAILY_LIMIT_PER_USER ?? "20");
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 20;
}

export function quotaMessage(limit: number) {
  return `You've used today's ${limit} AI actions; resets tomorrow.`;
}

/** Pure step used inside the Firestore transaction. */
export function applyAiCount(current: number, cap: number) {
  if (current >= cap) return { ok: false as const, count: current, remaining: 0 };
  const count = current + 1;
  return { ok: true as const, count, remaining: Math.max(0, cap - count) };
}

const memory = new Map<string, Bucket>();

export type AiIdentity = { id: string; store: "memory" | "firestore" };

export async function resolveAiIdentity(request: Request): Promise<AiIdentity | null> {
  const header = request.headers.get("authorization") || "";
  const bearer = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  const extensionToken = bearer.startsWith("ja1.") ? bearer : (request.headers.get("x-extension-token") || "");
  if (extensionToken.startsWith("ja1.")) {
    const session = readExtensionToken(extensionToken, extensionSecret());
    if (!session) return null;
    if (!firebaseAdminConfigured()) return { id: session.sub, store: "memory" };
    if (session.sub === "demo") return null;
    return { id: session.sub, store: "firestore" };
  }
  const user = await userFromAuthHeader(request);
  if (user) return { id: user.user.id, store: firebaseAdminConfigured() ? "firestore" : "memory" };
  if (!firebaseAdminConfigured()) return { id: "demo", store: "memory" };
  return null;
}

function usageRef(userId: string, day: string) {
  const db = adminDb();
  if (!db) return null;
  return db.collection("users").doc(userId).collection("usage").doc(`ai-${day}`);
}

export async function readAiQuota(request: Request, now = new Date()) {
  const identity = await resolveAiIdentity(request);
  const limit = aiDailyLimit();
  if (!identity) return null;
  const day = utcAiDay(now);
  if (identity.store === "memory") {
    const bucket = memory.get(identity.id);
    const count = bucket && bucket.day === day ? bucket.count : 0;
    return { remaining: Math.max(0, limit - count), limit, userId: identity.id };
  }
  const ref = usageRef(identity.id, day);
  if (!ref) return { remaining: limit, limit, userId: identity.id };
  const snap = await ref.get();
  const count = Number(snap.data()?.count ?? 0);
  return { remaining: Math.max(0, limit - count), limit, userId: identity.id };
}

export async function consumeAiCall(request: Request, now = new Date()) {
  const identity = await resolveAiIdentity(request);
  const limit = aiDailyLimit();
  if (!identity) {
    return { ok: false as const, status: 401 as const, error: "Sign in to use AI actions.", remaining: 0, limit };
  }
  const day = utcAiDay(now);
  if (identity.store === "memory") {
    const taken = takeDailyToken(memory, identity.id, limit, now);
    if (!taken.ok) {
      return { ok: false as const, status: 429 as const, error: quotaMessage(limit), remaining: 0, limit };
    }
    return { ok: true as const, remaining: taken.remaining, limit, userId: identity.id };
  }
  const ref = usageRef(identity.id, day);
  if (!ref) {
    return { ok: false as const, status: 401 as const, error: "Sign in to use AI actions.", remaining: 0, limit };
  }
  const db = adminDb()!;
  try {
    const remaining = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const current = Number(snap.data()?.count ?? 0);
      const step = applyAiCount(current, limit);
      if (!step.ok) {
        const error = new Error("cap");
        throw error;
      }
      tx.set(ref, { count: step.count, day, kind: "ai" }, { merge: true });
      return step.remaining;
    });
    return { ok: true as const, remaining, limit, userId: identity.id };
  } catch (error) {
    if (error instanceof Error && error.message === "cap") {
      return { ok: false as const, status: 429 as const, error: quotaMessage(limit), remaining: 0, limit };
    }
    throw error;
  }
}
