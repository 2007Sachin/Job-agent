import { sourceLabel } from "../src/lib/source-label";
import { describe, expect, it } from "vitest";

describe("source labels", () => {
  it("does not call a user save a catalog", () => {
    expect(sourceLabel("Catalog")).toBe("Saved by you");
    expect(sourceLabel("Remotive")).toBe("Remotive");
  });
});
