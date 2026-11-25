import { Document, Packer, Paragraph } from "docx";
import { textFromDocx } from "@/lib/parse-docx";
import { describe, expect, it } from "vitest";

describe("docx resume", () => {
  it("reads the paragraphs", async () => {
    const doc = new Document({
      sections: [{ children: [new Paragraph("Ward nurse, City Hospital")] }],
    });
    const buffer = await Packer.toBuffer(doc);
    const text = await textFromDocx(buffer);
    expect(text).toContain("Ward nurse");
  });
});