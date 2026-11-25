import { readFileSync } from "fs";
import { join } from "path";
import { signExtensionToken } from "../src/lib/extension-token";
import { applyAiCount, consumeAiCall, quotaMessage } from "../src/lib/ai-quota";
import { describe, expect, it } from "vitest";

describe("AI daily quota", () => {
  it("stops at the cap inside one increment", () => {
    expect(applyAiCount(19, 20)).toEqual({ ok: true, count: 20, remaining: 0 });
    expect(applyAiCount(20, 20).ok).toBe(false);
  });

  it("counts extension calls against the token owner in memory when Firebase is off", async () => {
    process.env.AI_DAILY_LIMIT_PER_USER = "2";
    delete process.env.FIREBASE_PROJECT_ID;
    delete process.env.FIREBASE_CLIENT_EMAIL;
    delete process.env.FIREBASE_PRIVATE_KEY;
    const token = signExtensionToken("quota-owner", "job-agent-dev");
    const call = () => consumeAiCall(new Request("http://local/api/chat", { headers: { authorization: `Bearer ${token}` } }));
    expect((await call()).ok).toBe(true);
    const second = await call();
    expect(second.ok && second.remaining).toBe(0);
    const blocked = await call();
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.status).toBe(429);
      expect(blocked.error).toBe(quotaMessage(2));
    }
  });

  it("lets the owner read usage and blocks client writes in the rules", () => {
    const rules = readFileSync(join(process.cwd(), "firestore.rules"), "utf8");
    expect(rules).toMatch(/match \/usage\/\{id\}[\s\S]*allow read: if owner\(userId\);[\s\S]*allow write: if false;/);
  });
});
