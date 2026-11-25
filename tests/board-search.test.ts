import { linkedInJobsUrl } from "@/lib/board-search";
import { describe, expect, it } from "vitest";

describe("board search urls", () => {
  it("builds a LinkedIn jobs URL and does not call the network", () => {
    const url = new URL(linkedInJobsUrl({
      keywords: "staff nurse",
      location: "Pune",
      remote: true,
      experience: "entry",
      posted: "week",
      easyApply: true,
    }));
    expect(url.hostname).toBe("www.linkedin.com");
    expect(url.searchParams.get("keywords")).toBe("staff nurse");
    expect(url.searchParams.get("f_WT")).toBe("2");
    expect(url.searchParams.get("f_E")).toBe("2");
    expect(url.searchParams.get("f_TPR")).toBe("r604800");
    expect(url.searchParams.get("f_AL")).toBe("true");
  });
});
