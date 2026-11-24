export const STAGES = [
  "saved",
  "applied",
  "interviewing",
  "offer",
  "rejected",
] as const;

export type Stage = (typeof STAGES)[number];

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  source: string;
  url: string;
  description: string;
  salaryLabel?: string;
  postedAt: string;
};

export type Profile = {
  fullName: string;
  email: string;
  onboarded: boolean;
  targetRoles: string[];
  locations: string[];
  salaryMinLpa: number | null;
  salaryMaxLpa: number | null;
  experienceYears: number | null;
  skills: string[];
  linkedinUrl: string;
  preferences: string;
  resumeText: string;
  resumeFileName: string;
  emailConsent: boolean;
  consentAt: string | null;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpFrom: string;
};

export type Application = {
  id: string;
  job: Job;
  stage: Stage;
  notes: string;
  tailoredResume: string;
  coverLetter: string;
  linkedinNote: string;
  recruiterEmail: string;
  appliedAt: string | null;
  updatedAt: string;
};

export type Outreach = {
  id: string;
  applicationId: string | null;
  to: string;
  subject: string;
  body: string;
  status: "draft" | "sent" | "failed" | "opened" | "replied";
  provider: "gmail" | "smtp" | "unsent";
  approved: boolean;
  followUpOn: string | null;
  sentAt: string | null;
  error: string | null;
};

export type SessionUser = {
  id: string;
  email: string;
  mode: "demo" | "supabase";
};

export type AppState = {
  user: SessionUser | null;
  profile: Profile;
  applications: Application[];
  outreach: Outreach[];
  feed: Job[];
  syncNote: string | null;
};

export const emptyProfile = (): Profile => ({
  fullName: "",
  email: "",
  onboarded: false,
  targetRoles: [],
  locations: [],
  salaryMinLpa: null,
  salaryMaxLpa: null,
  experienceYears: null,
  skills: [],
  linkedinUrl: "",
  preferences: "",
  resumeText: "",
  resumeFileName: "",
  emailConsent: false,
  consentAt: null,
  smtpHost: "",
  smtpPort: "587",
  smtpUser: "",
  smtpFrom: "",
});
