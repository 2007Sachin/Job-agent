import { adminDb } from "./firebase/server";
import type { Job } from "./types";
import { createHash } from "crypto";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function rememberToken(token: string, subject: string) {
  const db = adminDb();
  if (!db) return;
  await db.collection("extensionTokens").doc(hashToken(token)).set({
    subject,
    revoked: false,
    updatedAt: new Date().toISOString(),
  });
}

export async function rememberRevoke(token: string) {
  const db = adminDb();
  if (!db) return;
  await db.collection("extensionTokens").doc(hashToken(token)).set({ revoked: true }, { merge: true });
}

export async function remoteRevoked(token: string) {
  const db = adminDb();
  if (!db) return false;
  const snap = await db.collection("extensionTokens").doc(hashToken(token)).get();
  return Boolean(snap.data()?.revoked);
}

export async function rememberJob(subject: string, job: Job) {
  const db = adminDb();
  if (!db) return;
  await db.collection("extensionJobs").doc(job.id).set({
    subject,
    payload: job,
    updatedAt: new Date().toISOString(),
  });
}

export async function takeRemoteJobs(subject: string): Promise<Job[]> {
  const db = adminDb();
  if (!db) return [];
  const snap = await db.collection("extensionJobs").where("subject", "==", subject).get();
  const jobs = snap.docs.map((row) => row.data().payload as Job).filter((job) => job?.id);
  await Promise.all(snap.docs.map((row) => row.ref.delete()));
  return jobs;
}
