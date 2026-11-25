import { supabaseAdmin } from "./supabase/server";
import type { Job } from "./types";
import { createHash } from "crypto";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function userId(subject: string) {
  return /^[0-9a-f-]{36}$/i.test(subject) ? subject : null;
}

export async function rememberToken(token: string, subject: string) {
  const admin = supabaseAdmin();
  if (!admin) return;
  await admin.from("extension_tokens").upsert({
    token_hash: hashToken(token),
    subject,
    user_id: userId(subject),
    revoked: false,
  });
}

export async function rememberRevoke(token: string) {
  const admin = supabaseAdmin();
  if (!admin) return;
  await admin.from("extension_tokens").update({ revoked: true }).eq("token_hash", hashToken(token));
}

export async function remoteRevoked(token: string) {
  const admin = supabaseAdmin();
  if (!admin) return false;
  const { data } = await admin.from("extension_tokens").select("revoked").eq("token_hash", hashToken(token)).maybeSingle();
  return Boolean(data?.revoked);
}

export async function rememberJob(subject: string, job: Job) {
  const admin = supabaseAdmin();
  if (!admin) return;
  await admin.from("extension_jobs").upsert({
    id: job.id,
    subject,
    user_id: userId(subject),
    payload: job,
  });
}

export async function takeRemoteJobs(subject: string): Promise<Job[]> {
  const admin = supabaseAdmin();
  if (!admin) return [];
  const { data } = await admin.from("extension_jobs").select("id, payload").eq("subject", subject);
  const jobs = (data ?? []).map((row) => row.payload as Job).filter((job) => job?.id);
  if (jobs.length) await admin.from("extension_jobs").delete().eq("subject", subject);
  return jobs;
}
