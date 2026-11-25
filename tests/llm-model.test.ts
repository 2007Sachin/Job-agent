import { apiModel } from "@/lib/llm";
import { describe, expect, it } from "vitest";

describe("apiModel", () => {
  it("ignores provider nicknames", () => {
    expect(apiModel("Groq")).toBeUndefined();
    expect(apiModel("Gemini")).toBeUndefined();
  });

  it("keeps a real model id", () => {
    expect(apiModel("llama-3.3-70b-versatile")).toBe("llama-3.3-70b-versatile");
    expect(apiModel("google/gemma-2-9b-it")).toBe("google/gemma-2-9b-it");
  });
});