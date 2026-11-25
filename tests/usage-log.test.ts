import { nextUsageCount } from "@/lib/usage-log";
import { describe, expect, it } from "vitest";

describe("usage count", () => {
  it("starts at 1 and increments", () => {
    expect(nextUsageCount(null)).toBe(1);
    expect(nextUsageCount(3)).toBe(4);
  });
});