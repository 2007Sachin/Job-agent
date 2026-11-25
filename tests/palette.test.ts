import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    if (name === "google-mark.tsx") return [];
    return /\.(css|tsx)$/.test(name) ? [path] : [];
  });
}

const banned = /#1b6b3a|#1f4d2e|#30d158|#b6f27c|#2f6fed|#8aafff|#eaf1fe|#059669|#2563eb|#7c3aed|#0891b2|emerald-|green-|teal-|blue-|indigo-|violet-|purple-|sky-/i;

describe("palette", () => {
  it("keeps green and extra brand colours out of styles", () => {
    const hits = files(join(process.cwd(), "src"))
      .flatMap((path) => readFileSync(path, "utf8").split("\n").map((line, i) => ({ path, line, i })).filter((row) => banned.test(row.line)));
    expect(hits).toEqual([]);
  });
});