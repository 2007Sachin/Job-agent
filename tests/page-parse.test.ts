import { parseJobPage } from "../extension/page-parse.mjs";
import { describe, expect, it } from "vitest";

const html = `<main>
  <h1 data-job-title>Staff Nurse</h1>
  <div data-job-company>City Hospital</div>
  <div data-job-location>Pune</div>
  <p data-job-description>Ward shifts and notes.</p>
</main>`;

describe("job page parser", () => {
  it("reads the visible fields from fixture html", () => {
    const job = parseJobPage(html, "http://127.0.0.1:3000/fixture/job");
    expect(job.title).toBe("Staff Nurse");
    expect(job.company).toBe("City Hospital");
    expect(job.location).toBe("Pune");
    expect(job.description).toContain("Ward");
    expect(job.url).toContain("/fixture/job");
  });
});
