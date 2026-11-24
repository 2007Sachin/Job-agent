import { Document, Packer, Paragraph, TextRun } from "docx";

export async function downloadDocx(filename: string, title: string, body: string) {
  const paragraphs = [title, ...body.split("\n")].map(
    (line) =>
      new Paragraph({
        children: [new TextRun({ text: line || " ", font: "Calibri", size: line === title ? 32 : 22 })],
        spacing: { after: 120 },
      }),
  );
  const doc = new Document({ sections: [{ children: paragraphs }] });
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".docx") ? filename : `${filename}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadPdfViaPrint(title: string, body: string) {
  const win = window.open("", "_blank", "noopener,noreferrer");
  if (!win) return;
  const safe = (s: string) =>
    s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);
  win.document.write(`<!doctype html><html><head><title>${safe(title)}</title>
    <style>
      body { font-family: Georgia, serif; color: #1a1714; margin: 48px; line-height: 1.45; }
      h1 { font-size: 22px; font-weight: 500; }
      pre { white-space: pre-wrap; font-family: Georgia, serif; font-size: 14px; }
    </style></head><body>
    <h1>${safe(title)}</h1><pre>${safe(body)}</pre>
    <script>window.onload=()=>window.print()<\/script>
    </body></html>`);
  win.document.close();
}
