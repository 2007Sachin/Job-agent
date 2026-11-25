import type { Job, Profile } from "./types";

function name(profile: Profile) {
  return profile.fullName.trim() || "there";
}

export function templateResume(profile: Profile, job: Job): string {
  const skills = profile.skills.length ? profile.skills.join(", ") : "the skills in your resume";
  return [
    `${name(profile)}`,
    profile.email,
    profile.linkedinUrl,
    profile.locations.join(" · "),
    "",
    `Target: ${job.title} at ${job.company}`,
    "",
    "Summary",
    `I am applying for the ${job.title} role at ${job.company} in ${job.location}. My background covers ${skills}. ${profile.experienceYears != null ? `I have about ${profile.experienceYears} years of relevant experience.` : "I am early in my career and learn quickly on the job."} ${profile.preferences ? profile.preferences : ""}`.replace(/\s+/g, " ").trim(),
    "",
    "Evidence from my current resume",
    profile.resumeText.trim() || "(Paste or upload a resume in onboarding. This draft will quote it once it is there.)",
    "",
    "What I would want a hiring manager to notice",
    `The description asks for work I can connect to concrete tasks. I will speak to ${job.title} in the language of the posting, without inventing employers, tools, or dates that are not already in my history.`,
  ].join("\n");
}

export function templateCover(profile: Profile, job: Job): string {
  return [
    `Dear ${job.company} hiring team,`,
    "",
    `I am writing for the ${job.title} opening in ${job.location}. I want this specific job, not a generic seat in the industry.`,
    "",
    profile.resumeText
      ? `A short read of my background: ${profile.resumeText.slice(0, 500).trim()}${profile.resumeText.length > 500 ? "…" : ""}`
      : "I have not uploaded a resume yet, so this letter stays short until that history is available.",
    "",
    `What drew me in is the day-to-day described in the posting. I can contribute with ${profile.skills.slice(0, 5).join(", ") || "the strengths already in my experience"}.`,
    "",
    "I would welcome a conversation.",
    "",
    name(profile),
    profile.email,
    profile.linkedinUrl,
  ].join("\n");
}

export function templateLinkedIn(profile: Profile, job: Job): string {
  return `Hello — I am ${name(profile)}, interested in the ${job.title} role at ${job.company}. I am based around ${profile.locations[0] || job.location}. If you are the right person, I would value ten minutes. If not, a pointer to who hires for this seat would help. Thank you.`;
}

export function templateEmail(profile: Profile, job: Job): { subject: string; body: string } {
  return {
    subject: `${job.title} — ${name(profile)}`,
    body: [
      "Hello,",
      "",
      `I am applying for ${job.title} at ${job.company} (${job.location}). I am writing directly so my materials do not sit only in an applicant queue.`,
      "",
      profile.skills.length
        ? `Relevant strengths: ${profile.skills.slice(0, 6).join(", ")}.`
        : "I can share a resume that matches the description.",
      "",
      job.url ? `Posting: ${job.url}` : "",
      "",
      "If this reached the wrong desk, I would be grateful for a redirect.",
      "",
      name(profile),
      profile.email,
      profile.linkedinUrl,
    ]
      .filter((line) => line !== "")
      .join("\n"),
  };
}
