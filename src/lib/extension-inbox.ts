import type { Job } from "./types";

type Bag = { revoked: Set<string>; inbox: Map<string, Job[]> };
const bag: Bag = ((globalThis as unknown as { __jobAgentInbox?: Bag }).__jobAgentInbox ??= {
  revoked: new Set<string>(),
  inbox: new Map<string, Job[]>(),
});
const { revoked, inbox } = bag;

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
