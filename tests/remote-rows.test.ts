import { applicationFromRow, applicationRow, outreachFromRow, outreachRow } from "@/lib/remote-rows";
import { describe, expect, it } from "vitest";

const app = {
  id: "11111111-1111-1111-1111-111111111111",
  job: { id: "j1", title: "Nurse", company: "City", location: "Pune", source: "paste", url: "", description: "Ward", postedAt: "2026-01-01" },
  stage: "saved" as const,
  notes: "",
  tailoredResume: "text",
  coverLetter: "",
  linkedinNote: "",
  recruiterEmail: "a@b.co",
  appliedAt: null,
  updatedAt: "2026-01-02T00:00:00.000Z",
};

describe("remote rows", () => {
  it("round-trips an application", () => {
    const row = applicationRow("user", app);
    expect(applicationFromRow(row)?.tailoredResume).toBe("text");
    expect(applicationFromRow(row)?.job.title).toBe("Nurse");
  });

  it("round-trips outreach", () => {
    const item = {
      id: "22222222-2222-2222-2222-222222222222",
      applicationId: app.id,
      to: "a@b.co",
      subject: "Hello",
      body: "Hi",
      status: "draft" as const,
      provider: "unsent" as const,
      approved: false,
      followUpOn: "2026-02-01",
      sentAt: null,
      error: null,
    };
    expect(outreachFromRow(outreachRow("user", item))?.followUpOn).toBe("2026-02-01");
  });
});