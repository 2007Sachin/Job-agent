import { searchKeyWarning } from "../src/lib/search-warning";
import { isHiddenTestFixture } from "../src/lib/test-fixture";
import { describe, expect, it } from "vitest";

describe("search warnings", () => {
  it("does not name server keys", () => {
    const line = searchKeyWarning({});
    expect(line).toBe("Some public job lists are off until this site's search keys are set.");
    expect(line).not.toMatch(/ADZUNA|GREENHOUSE|LEVER/);
    expect(searchKeyWarning({ adzuna: "a", greenhouse: "g", lever: "l" })).toBeNull();
  });
});

describe("test-save fixture", () => {
  it("hides the old Staff Nurse ward-shifts save unless the dev flag is on", () => {
    const hidden = isHiddenTestFixture({
      title: "Staff Nurse",
      company: "City Hospital",
      description: "Ward shifts",
      url: "http://127.0.0.1:3000/fixture/job",
    });
    expect(hidden).toBe(process.env.NEXT_PUBLIC_SHOW_TEST_FIXTURE !== "1");
  });
});
