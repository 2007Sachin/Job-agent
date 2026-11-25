import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (name === "node_modules" || name.startsWith(".")) return [];
    if (statSync(path).isDirectory()) return files(path);
    return path.endsWith(".tsx") ? [path] : [];
  });
}

describe("trust copy", () => {
  it("does not show raw model env names or a fake connect button", () => {
    const banned = /LLM_BASE_URL|env:LLM_MODEL|Mark connected/;
    const hits = files(join(process.cwd(), "src")).flatMap((path) =>
      readFileSync(path, "utf8").split("\n").filter((line) => banned.test(line)).map((line) => `${path}: ${line.trim()}`),
    );
    expect(hits).toEqual([]);
  });
});