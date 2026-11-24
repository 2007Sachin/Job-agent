import { describe, expect, it } from "vitest";
import { classifyJobUrl } from "../src/lib/job-sources";

describe("classifyJobUrl", () => {
  it("accepts public Greenhouse and Lever postings", () => {
    expect(classifyJobUrl("https://boards.greenhouse.io/acme/jobs/12345").kind).toBe("greenhouse");
    expect(classifyJobUrl("https://jobs.lever.co/acme/123e4567-e89b-12d3-a456-426614174000").kind).toBe("lever");
  });

  it("refuses LinkedIn and unknown pages", () => {
    expect(classifyJobUrl("https://www.linkedin.com/jobs/view/1").kind).toBe("blocked");
    expect(classifyJobUrl("https://example.com/careers/1").kind).toBe("unknown");
  });
});
