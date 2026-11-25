import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HomeScreen } from "../src/components/home-screen";
import type { Application, Outreach } from "../src/lib/types";

const job = {
  id: "j1",
  title: "Staff Nurse",
  company: "City Hospital",
  location: "Pune",
  source: "Catalog",
  url: "https://example.com/job",
  description: "Ward shifts.",
  postedAt: "2026-11-20",
};

const application: Application = {
  id: "a1",
  job,
  stage: "saved",
  notes: "",
  tailoredResume: "Ward nurse.",
  coverLetter: "",
  linkedinNote: "",
  recruiterEmail: "",
  appliedAt: null,
  updatedAt: "2026-11-20",
};

const due: Outreach = {
  id: "o1",
  applicationId: "a1",
  to: "hr@city.example",
  subject: "Staff Nurse follow-up",
  body: "Hello",
  status: "draft",
  provider: "unsent",
  followUpOn: "2026-11-01",
  approved: false,
  sentAt: null,
  error: null,
};

describe("home route", () => {
  it("is the app dashboard page, not a missing path", () => {
    const route = join(process.cwd(), "src/app/(app)/dashboard/page.tsx");
    expect(existsSync(route)).toBe(true);
    const source = readFileSync(route, "utf8");
    expect(source).toContain("HomeScreen");
    expect(source).not.toContain("notFound(");
  });

  it("renders the job loop", () => {
    const html = renderToStaticMarkup(createElement(HomeScreen, {
      role: "Staff nurse",
      location: "Pune",
      onRole: () => {},
      onLocation: () => {},
      recent: [application],
      due: [due],
      resumes: [application],
    }));
    expect(html).toContain("Find a job");
    expect(html).toContain("Staff nurse");
    expect(html).toContain("Staff Nurse");
    expect(html).toContain("Staff Nurse follow-up");
    expect(html).toContain('action="/jobs"');
    expect(html).not.toContain("This page could not be found");
  });
});
