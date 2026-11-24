import { describe, expect, it } from "vitest";
import { scoreMatch } from "../src/lib/match";
import { emptyProfile, type Profile } from "../src/lib/types";

const nurse: Profile = {
  ...emptyProfile(),
  skills: ["medication", "Telugu", "ward"],
  targetRoles: ["Staff Nurse"],
  locations: ["Hyderabad"],
  experienceYears: 2,
  resumeText: "Ward nurse documenting vitals and administering medication.",
};

describe("scoreMatch", () => {
  it("scores a close role higher than an unrelated one", () => {
    const close = scoreMatch(nurse, {
      title: "Staff Nurse",
      location: "Hyderabad, India",
      description: "Administer medication on a ward. Telugu helps. Two years.",
      salaryLabel: "5 LPA",
    });
    const far = scoreMatch(nurse, {
      title: "Commis Chef",
      location: "Goa, India",
      description: "Cold section, knife work, six-day weeks.",
    });
    expect(close.score).toBeGreaterThan(far.score);
    expect(close.score).toBeLessThanOrEqual(100);
    expect(far.score).toBeGreaterThanOrEqual(0);
  });

  it("explains a missing skill list", () => {
    const result = scoreMatch(emptyProfile(), {
      title: "Teacher",
      location: "Jaipur",
      description: "Teach science.",
    });
    expect(result.reasons.some((r) => r.toLowerCase().includes("skill"))).toBe(true);
  });
});
