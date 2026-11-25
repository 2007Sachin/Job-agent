import { signExtensionToken } from "@/lib/extension-token";
import { POST as save } from "@/app/api/extension/save/route";
import { describe, expect, it } from "vitest";

describe("extension save", () => {
  it("rejects a missing token and accepts a signed one", async () => {
    const bad = await save(new Request("http://local/api/extension/save", {
      method: "POST",
      body: JSON.stringify({ title: "Nurse", company: "City" }),
    }));
    expect(bad.status).toBe(401);

    const token = signExtensionToken("demo", "job-agent-dev");
    const ok = await save(new Request("http://local/api/extension/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        title: "Staff <b>Nurse</b>",
        company: "City Hospital",
        location: "Pune",
        description: "Ward",
        url: "http://127.0.0.1:3000/fixture/job",
      }),
    }));
    expect(ok.status).toBe(200);
    const json = await ok.json();
    expect(json.job.title).toBe("Staff Nurse");
    expect(json.job.description).toBe("Ward");
  });
});