import { BUSY_MESSAGE, acquireGlobalSlot, draftText, promptCacheId, readCachedDraft, resetLlmGateForTests, retryAfterMs, takeRpmSlot, writeCachedDraft } from "../src/lib/llm-gate";
import { describe, expect, it } from "vitest";

describe("global LLM gate", () => {
  it("stops when the minute budget is full", () => {
    expect(takeRpmSlot(34, 35)).toEqual({ ok: true, count: 35 });
    expect(takeRpmSlot(35, 35).ok).toBe(false);
  });

  it("keeps a personal cache per user and a public cache shared", () => {
    const personal = { model: "m", system: "s", user: "hello" };
    expect(promptCacheId({ ...personal, userId: "a" })).not.toBe(promptCacheId({ ...personal, userId: "b" }));
    expect(promptCacheId(personal)).toBeNull();
    expect(promptCacheId({ ...personal, shareable: true })).toBe(promptCacheId({ ...personal, shareable: true, userId: "a" }));
  });

  it("reads retry-after as seconds", () => {
    expect(retryAfterMs("2", 0)).toBe(2000);
  });

  it("uses reasoning text when content is empty", () => {
    expect(draftText({ content: "", reasoning_content: "Because the posting matches." })).toBe("Because the posting matches.");
    expect(draftText({ content: "Draft" })).toBe("Draft");
  });

  it("queues in memory and then says the server is busy", async () => {
    resetLlmGateForTests();
    process.env.LLM_GLOBAL_RPM = "1";
    delete process.env.FIREBASE_PROJECT_ID;
    await acquireGlobalSlot(new Date(), 0);
    await expect(acquireGlobalSlot(new Date(), 0)).rejects.toThrow(BUSY_MESSAGE);
    resetLlmGateForTests();
    delete process.env.LLM_GLOBAL_RPM;
  });

  it("does not return an expired memory cache entry", async () => {
    resetLlmGateForTests();
    delete process.env.FIREBASE_PROJECT_ID;
    const id = promptCacheId({ model: "m", system: "s", user: "u", shareable: true });
    await writeCachedDraft(id, "cached", 0);
    expect(await readCachedDraft(id, 0)).toBe("cached");
    expect(await readCachedDraft(id, Number.MAX_SAFE_INTEGER)).toBeNull();
  });
});
