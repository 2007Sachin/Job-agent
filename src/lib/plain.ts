const names: Record<string, string> = {
  "Job Scout": "Scout",
  "Resume Tailor": "Tailor",
  "Outreach Writer": "Note",
  "Application Coach": "Tracker",
  "Interview Prep": "Coach",
  Relay: "Guide",
};

const hints: Record<string, string> = {
  "Job Scout": "Looks for jobs that fit you.",
  "Resume Tailor": "Writes a resume from your real history.",
  "Outreach Writer": "Writes a note you still have to send yourself.",
  "Application Coach": "Tells you the next step on an application.",
  "Interview Prep": "Practices questions for one job.",
  Relay: "Picks which helper should answer in a group.",
};

export function plainBot(name: string) {
  return names[name] ?? name;
}

export function botHint(name: string) {
  return hints[name] ?? "A helper. It drafts words. It does not apply for you.";
}
