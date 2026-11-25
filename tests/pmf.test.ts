import { funnelCounts } from "@/lib/funnel";
import { modelLabel } from "@/lib/model-label";
import type { Application } from "@/lib/types";
import { describe, expect, it } from "vitest";

describe("pmf helpers", () => {
  it("hides the raw model env name", () => {
    expect(modelLabel("env:LLM_MODEL")).toBe("Free AI model");
    expect(modelLabel("llama-3.3-70b-versatile")).toBe("llama-3.3-70b-versatile");
  });

  it("counts the funnel from saved through offer", () => {
    const job = { id: "j", title: "Nurse", company: "City", location: "Pune", source: "demo", url: "", description: "" };
    const row = (stage: Application["stage"], id: string): Application => ({
      id, job, stage, notes: "", tailoredResume: "", coverLetter: "", linkedinNote: "", recruiterEmail: "", appliedAt: null, updatedAt: "",
    });
    const counts = funnelCounts([row("saved", "1"), row("applied", "2"), row("interviewing", "3"), row("offer", "4")]);
    expect(counts.map((c) => c.count)).toEqual([4, 3, 2, 1]);
  });
});