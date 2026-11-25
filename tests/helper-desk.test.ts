import { liveStatus, prefsOf } from "@/lib/helper-desk";
import { BUILTIN_BOTS } from "@/lib/workspace";
import { describe, expect, it } from "vitest";

describe("helper desk", () => {
  it("defaults to idle and a plain status", () => {
    const bot = BUILTIN_BOTS[0];
    expect(prefsOf(bot).worksOn).toBe("auto");
    expect(prefsOf(bot).approveApply).toBe(true);
    expect(liveStatus(bot)).toBe("Ready when you ask");
    expect(liveStatus({ ...bot, screen: "active" } as typeof bot)).toBe("Searching jobs…");
  });
});
