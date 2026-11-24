import { describe, expect, it } from "vitest";
import { planTurn, routeRoom } from "../src/lib/chat-plan";
import { connectors } from "../src/lib/connectors";
import { BUILTIN_BOTS, BUILTIN_SKILLS } from "../src/lib/workspace";

describe("planTurn", () => {
  it("hands a resume request to Resume Tailor", () => {
    const scout = BUILTIN_BOTS[0];
    const plan = planTurn("@Resume Tailor tailor my resume for this nurse job", scout, BUILTIN_BOTS, BUILTIN_SKILLS);
    expect(plan.bot.name).toBe("Resume Tailor");
    expect(plan.tools.some((t) => t.name === "tailor_resume")).toBe(true);
    expect(plan.handoffFrom).toBe("Job Scout");
  });

  it("requires approval before a cold email counts as ready", () => {
    const writer = BUILTIN_BOTS.find((b) => b.name === "Outreach Writer")!;
    const plan = planTurn("draft an email to the recruiter", writer, BUILTIN_BOTS, BUILTIN_SKILLS);
    const email = plan.tools.find((t) => t.name === "cold_email");
    expect(email?.needsApproval).toBe(true);
  });
});

describe("routeRoom", () => {
  it("mentions one bot and otherwise takes the first two", () => {
    const named = routeRoom("@Resume Tailor rewrite this", BUILTIN_BOTS);
    expect(named.speakerIds).toEqual(["bot-tailor"]);
    expect(named.handoff).toContain("Resume Tailor");
    const open = routeRoom("find a role and draft a resume", BUILTIN_BOTS);
    expect(open.speakerIds.length).toBe(2);
  });
});

describe("connectors", () => {
  it("keeps job boards that forbid collection in assist mode", () => {
    const rows = connectors({});
    for (const id of ["linkedin", "naukri", "instahyre", "hirist", "cutshort", "wellfound", "indeed", "foundit"]) {
      expect(rows.find((r) => r.id === id)?.mode).toBe("assist");
    }
    expect(rows.find((r) => r.id === "remotive")?.mode).toBe("api");
  });
});
