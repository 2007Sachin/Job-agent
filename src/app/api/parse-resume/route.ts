import { textFromDocx } from "@/lib/parse-docx";
import { clientKey } from "@/lib/job-sources";
import { enforceDailyCap } from "@/lib/rate-limit";
import { extractText, getDocumentProxy } from "unpdf";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const limit = enforceDailyCap(`parse:${clientKey(request)}`);
  if (!limit.ok) {
    return NextResponse.json({ error: "Daily resume parse limit reached." }, { status: 429 });
  }
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose a PDF, DOCX, or text resume." }, { status: 400 });
  }
  if (file.size > 4_000_000) {
    return NextResponse.json({ error: "Keep the file under 4 MB." }, { status: 400 });
  }
  const name = file.name.toLowerCase();
  if (name.endsWith(".txt")) {
    return NextResponse.json({ text: await file.text(), filename: file.name });
  }
  if (name.endsWith(".docx")) {
    const text = await textFromDocx(Buffer.from(await file.arrayBuffer()));
    if (!text) return NextResponse.json({ error: "No text found in that Word file. Paste the text instead." }, { status: 422 });
    return NextResponse.json({ text, filename: file.name });
  }
  if (!name.endsWith(".pdf")) {
    return NextResponse.json({ error: "Upload a PDF, a DOCX, or a .txt file." }, { status: 400 });
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdf = await getDocumentProxy(bytes);
  const extracted = await extractText(pdf, { mergePages: true });
  const text = Array.isArray(extracted.text) ? extracted.text.join("\n") : extracted.text;
  if (!text?.trim()) {
    return NextResponse.json({ error: "No text found. If this is a scanned PDF, paste the text instead." }, { status: 422 });
  }
  return NextResponse.json({ text: text.trim(), filename: file.name });
}
