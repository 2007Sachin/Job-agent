import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return /\.(css|tsx)$/.test(name) ? [path] : [];
  });
}

const banned = /#1b6b3a|#1f4d2e|#30d158|#b6f27c|#9a4318|emerald-|green-|teal-/i;

describe("palette", () => {
  it("keeps green and extra brand colours out of styles", () => {
    const hits = files(join(process.cwd(), "src"))
      .flatMap((path) => readFileSync(path, "utf8").split("\n").map((line, i) => ({ path, line, i })).filter((row) => banned.test(row.line)));
    expect(hits).toEqual([]);
  });
});