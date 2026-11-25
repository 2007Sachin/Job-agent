import { adminDb, userFromAuthHeader } from "./firebase/server";

export function nextUsageCount(current: number | null | undefined) {
  return (current ?? 0) + 1;
}

export async function noteUsage(request: Request, kind: string) {
  const db = adminDb();
  if (!db) return;
  const session = await userFromAuthHeader(request);
  if (!session) return;
  const day = new Date().toISOString().slice(0, 10);
  const ref = db.collection("users").doc(session.user.id).collection("usage").doc(`${day}_${kind}`);
  const snap = await ref.get();
  const count = nextUsageCount(snap.data()?.count as number | undefined);
  await ref.set({ day, kind, count });
}
