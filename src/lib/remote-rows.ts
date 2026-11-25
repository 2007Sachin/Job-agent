import type { Application, Outreach } from "./types";

export function applicationRow(userId: string, app: Application) {
  return {
    id: app.id,
    user_id: userId,
    job_id: app.job.id,
    job: app.job,
    stage: app.stage,
    notes: app.notes,
    tailored_resume: app.tailoredResume,
    cover_letter: app.coverLetter,
    linkedin_note: app.linkedinNote,
    recruiter_email: app.recruiterEmail,
    applied_at: app.appliedAt,
    updated_at: app.updatedAt,
  };
}

export function applicationFromRow(row: Record<string, unknown>): Application | null {
  const job = row.job as Application["job"] | undefined;
  if (!row.id || !job?.id) return null;
  return {
    id: String(row.id),
    job,
    stage: (row.stage as Application["stage"]) || "saved",
    notes: String(row.notes ?? ""),
    tailoredResume: String(row.tailored_resume ?? ""),
    coverLetter: String(row.cover_letter ?? ""),
    linkedinNote: String(row.linkedin_note ?? ""),
    recruiterEmail: String(row.recruiter_email ?? ""),
    appliedAt: (row.applied_at as string | null) ?? null,
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  };
}

export function outreachRow(userId: string, item: Outreach) {
  return {
    id: item.id,
    user_id: userId,
    application_id: item.applicationId,
    recipient: item.to,
    subject: item.subject,
    body: item.body,
    status: item.status,
    provider: item.provider,
    approved: item.approved,
    follow_up_on: item.followUpOn,
    sent_at: item.sentAt,
    error: item.error,
  };
}

export function outreachFromRow(row: Record<string, unknown>): Outreach | null {
  if (!row.id) return null;
  return {
    id: String(row.id),
    applicationId: (row.application_id as string | null) ?? null,
    to: String(row.recipient ?? ""),
    subject: String(row.subject ?? ""),
    body: String(row.body ?? ""),
    status: (row.status as Outreach["status"]) || "draft",
    provider: (row.provider as Outreach["provider"]) || "unsent",
    approved: Boolean(row.approved),
    followUpOn: (row.follow_up_on as string | null) ?? null,
    sentAt: (row.sent_at as string | null) ?? null,
    error: (row.error as string | null) ?? null,
  };
}
