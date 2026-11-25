import type { Job, Profile } from "./types";

export type MatchResult = {
  score: number;
  reasons: string[];
};

const STOP = new Set([
  "and", "the", "for", "with", "you", "your", "our", "are", "job", "role",
  "this", "that", "from", "will", "have", "has", "who", "any", "all", "per",
]);

export function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9+#./-]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !STOP.has(t));
}

function yearsInText(text: string): number | null {
  const match = text.match(/(\d+)\+?\s*(?:years|yrs)/i);
  return match ? Number(match[1]) : null;
}

function salaryNumbers(label: string | undefined): number[] {
  if (!label) return [];
  return [...label.matchAll(/(\d+(?:\.\d+)?)/g)].map((m) => Number(m[1]));
}

export function scoreMatch(profile: Profile, job: Pick<Job, "title" | "location" | "description" | "salaryLabel">): MatchResult {
  const reasons: string[] = [];
  let score = 18;

  const haystack = `${job.title}\n${job.description}`.toLowerCase();
  const titleTokens = new Set(tokenize(job.title));

  const skills = profile.skills.map((s) => s.trim()).filter(Boolean);
  if (skills.length) {
    const hit = skills.filter((s) => haystack.includes(s.toLowerCase()));
    const ratio = hit.length / skills.length;
    score += Math.round(ratio * 42);
    if (hit.length) reasons.push(`Skills mentioned: ${hit.slice(0, 4).join(", ")}`);
    else reasons.push("None of your listed skills appear in this description");
  } else {
    reasons.push("Add skills so matching can read the description");
  }

  const roles = profile.targetRoles.map((r) => r.trim()).filter(Boolean);
  if (roles.length) {
    const roleHit = roles.some((role) => {
      const parts = tokenize(role);
      return parts.some((p) => titleTokens.has(p) || haystack.includes(role.toLowerCase()));
    });
    if (roleHit) {
      score += 22;
      reasons.push("Title lines up with a role you are targeting");
    } else {
      score += 4;
      reasons.push("Title is outside the roles you listed");
    }
  }

  const locations = profile.locations.map((l) => l.toLowerCase().trim()).filter(Boolean);
  const loc = job.location.toLowerCase();
  const direct = locations.some((l) => loc.includes(l));
  const remoteOk = locations.some((l) => l.includes("remote")) && loc.includes("remote");
  if (!locations.length) {
    score += 4;
  } else if (direct) {
    score += 12;
    reasons.push("Location matches where you want to work");
  } else if (remoteOk) {
    score += 8;
    reasons.push("Remote posting matches a remote preference");
  } else {
    reasons.push("Location differs from your preferences");
  }

  if (profile.experienceYears != null) {
    const asked = yearsInText(job.description);
    if (asked == null) score += 4;
    else if (profile.experienceYears + 1 >= asked && profile.experienceYears <= asked + 4) {
      score += 8;
      reasons.push("Experience is close to what the description asks");
    } else if (profile.experienceYears < asked) {
      reasons.push(`Description asks for about ${asked} years`);
    } else {
      score += 3;
      reasons.push("You may be more experienced than the posting asks");
    }
  }

  const nums = salaryNumbers(job.salaryLabel);
  if (profile.salaryMinLpa && nums.length) {
    const top = Math.max(...nums);
    if (top >= profile.salaryMinLpa) {
      score += 6;
      reasons.push("Listed pay meets your minimum");
    } else {
      reasons.push("Listed pay is below your minimum");
    }
  }

  const resumeTokens = new Set(tokenize(profile.resumeText).slice(0, 400));
  if (resumeTokens.size) {
    const descTokens = tokenize(job.description);
    const overlap = descTokens.filter((t) => resumeTokens.has(t)).length;
    const boost = Math.min(10, Math.round((overlap / Math.max(descTokens.length, 1)) * 40));
    score += boost;
    if (boost >= 4) reasons.push("Resume language overlaps this description");
  }

  return { score: Math.max(0, Math.min(100, score)), reasons };
}
