import { routineDue } from "@/lib/routine-due";
import { describe, expect, it } from "vitest";

describe("routineDue", () => {
  const now = new Date("2026-06-01T09:30:00.000Z");

  it("is due after the clock time when it has not run today", () => {
    expect(routineDue({ time: "09:00", enabled: true, lastRun: null }, now)).toBe(true);
  });

  it("waits until the clock time", () => {
    expect(routineDue({ time: "10:00", enabled: true, lastRun: null }, now)).toBe(false);
  });

  it("does not run twice the same day", () => {
    expect(routineDue({ time: "09:00", enabled: true, lastRun: "2026-06-01T09:05:00.000Z" }, now)).toBe(false);
  });
});