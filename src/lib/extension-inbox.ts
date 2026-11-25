import type { Job } from "./types";

const revoked = new Set<string>();
const inbox = new Map<string, Job[]>();

export function revokeToken(token: string) {
  revoked.add(token);
}

export function isRevoked(token: string) {
  return revoked.has(token);
}

export function pushSavedJob(subject: string, job: Job) {
  const list = inbox.get(subject) ?? [];
  inbox.set(subject, [job, ...list.filter((row) => row.id !== job.id)].slice(0, 20));
}

export function takeSavedJobs(subject: string) {
  const list = inbox.get(subject) ?? [];
  inbox.delete(subject);
  return list;
}
