import { describe, expect, it } from "vitest";
import { takeDailyToken } from "../src/lib/rate-limit";

describe("takeDailyToken", () => {
  it("blocks after the cap and resets the next day", () => {
    const store = new Map();
    const day = new Date("2026-11-24T10:00:00Z");
    expect(takeDailyToken(store, "u", 2, day).ok).toBe(true);
    expect(takeDailyToken(store, "u", 2, day).remaining).toBe(0);
    expect(takeDailyToken(store, "u", 2, day).ok).toBe(false);
    const next = takeDailyToken(store, "u", 2, new Date("2026-11-25T01:00:00Z"));
    expect(next.ok).toBe(true);
    expect(next.remaining).toBe(1);
  });
});
