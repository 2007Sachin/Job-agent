import { dedupeJobs, rankJobs, roleFromChat, salaryLabel, searchQuery, slugList } from "../src/lib/job-search";
import type { Job } from "../src/lib/types";
import { describe, expect, it } from "vitest";

function job(partial: Partial<Job> & Pick<Job, "id" | "title" | "company" | "location">): Job {
  return {
    source: "Test",
    url: "https://example.com",
    description: "",
    postedAt: "",
    ...partial,
  };
}

describe("live job search", () => {
  it("treats Any job and a blank role as no query", () => {
    expect(searchQuery("Any job")).toBe("");
    expect(searchQuery("  ")).toBe("");
    expect(searchQuery("nurse")).toBe("nurse");
    expect(roleFromChat("Find me data analyst jobs in Bengaluru")).toEqual({ q: "data analyst", location: "Bengaluru" });
    expect(salaryLabel(400000, 600000)).toBe("4–6 LPA");
  });

  it("ranks a city match ahead of remote and keeps remote when the city is missing", () => {
    const rows = [
      job({ id: "1", title: "Data analyst", company: "A", location: "Remote", tags: ["data"] }),
      job({ id: "2", title: "Data analyst", company: "B", location: "Bengaluru", tags: ["data"] }),
    ];
    const hit = rankJobs(rows, "data analyst", "Bengaluru");
    expect(hit.jobs[0]?.company).toBe("B");
    expect(hit.note).toBe("");
    const remoteOnly = rankJobs([rows[0]], "data analyst", "Bengaluru");
    expect(remoteOnly.note).toBe("Remote roles (none found in Bengaluru)");
    expect(remoteOnly.jobs).toHaveLength(1);
    const elsewhere = rankJobs([job({ id: "3", title: "Data analyst", company: "C", location: "USA" })], "data analyst", "Bengaluru");
    expect(elsewhere.note).toBe("None found in Bengaluru. Showing other matches.");
    expect(elsewhere.jobs).toHaveLength(1);
  });

  it("matches title, tags, and company, and drops duplicate postings", () => {
    const rows = [
      job({ id: "1", title: "Support", company: "Groww", location: "Remote", tags: ["product"] }),
      job({ id: "2", title: "Support", company: "Groww", location: "Mumbai" }),
    ];
    expect(rankJobs(rows, "product", "").jobs).toHaveLength(1);
    expect(dedupeJobs(rows)).toHaveLength(2);
    expect(dedupeJobs([rows[1], { ...rows[1], id: "3" }])).toHaveLength(1);
    expect(slugList(undefined, "paytm,meesho,cred")).toEqual(["paytm", "meesho", "cred"]);
    expect(slugList("a,b,c,d,e", "paytm")).toHaveLength(5);
  });
});
