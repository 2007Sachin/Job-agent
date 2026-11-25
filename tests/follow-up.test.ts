import { followUpTiming, formatFollowUpDate } from "../src/lib/follow-up";
import { describe, expect, it } from "vitest";

describe("follow-up dates", () => {
  const now = new Date("2026-11-25T08:00:00+05:30");

  it("formats a calendar day in Asia/Calcutta", () => {
    expect(formatFollowUpDate("2026-11-01")).toBe("1 Nov 2026");
  });

  it("labels overdue and due today", () => {
    expect(followUpTiming("2026-11-01", now)).toBe("Overdue");
    expect(followUpTiming("2026-11-25", now)).toBe("Due today");
    expect(followUpTiming("2026-12-01", now)).toBe("");
  });
});
