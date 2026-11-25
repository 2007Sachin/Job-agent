import { clientKey } from "@/lib/job-sources";
import { apiModel, complete, llmConfigured } from "@/lib/llm";
import { enforceDailyCap } from "@/lib/rate-limit";
import { templateCover, templateEmail, templateLinkedIn, templateResume } from "@/lib/templates";
import { noteUsage } from "@/lib/usage-log";
import type { Job, Profile } from "@/lib/types";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SYSTEM = `You help a job seeker in India prepare application materials.
Use only facts present in the profile and resume. Never invent employers, dates, degrees, metrics, or tools.
Write in plain English. No buzzword stacks. Keep the seeker's voice.
The reader may be applying to any function or seniority.`;

export async function POST(request: Request) {
  const body = (await request.json()) as {
    kind?: "resume" | "cover" | "linkedin" | "email";
    profile?: Profile;
    job?: Job;
    userId?: string;
    model?: string;
    temperature?: number;
  };
  if (!body.kind || !body.profile || !body.job) {
    return NextResponse.json({ error: "Missing profile, job, or kind." }, { status: 400 });
  }
  const limit = enforceDailyCap(`llm:${clientKey(request)}`);
  void noteUsage(request, "generate");
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Daily generation cap (${limit.limit}) reached. Raise LLM_DAILY_CAP or wait until tomorrow.` },
      { status: 429 },
    );
  }

  const fallback = () => {
    if (body.kind === "resume") return { text: templateResume(body.profile!, body.job!), source: "template" as const };
    if (body.kind === "cover") return { text: templateCover(body.profile!, body.job!), source: "template" as const };
    if (body.kind === "linkedin") return { text: templateLinkedIn(body.profile!, body.job!), source: "template" as const };
    const email = templateEmail(body.profile!, body.job!);
    return { text: `Subject: ${email.subject}\n\n${email.body}`, subject: email.subject, source: "template" as const };
  };

  if (!llmConfigured()) {
    return NextResponse.json({ ...fallback(), note: "No LLM key configured. This draft is a local template." });
  }

  try {
    const prompt = [
      `Task: ${body.kind}`,
      `Candidate: ${JSON.stringify({ ...body.profile, resumeText: body.profile.resumeText.slice(0, 4000) })}`,
      `Job: ${JSON.stringify({ ...body.job, description: body.job.description.slice(0, 4000) })}`,
      body.kind === "email"
        ? "Return a subject line on the first line starting with 'Subject: ' and then the email body."
        : "Return only the document text.",
    ].join("\n\n");
    const text = await complete(prompt, SYSTEM, {
      model: apiModel(body.model),
      temperature: typeof body.temperature === "number" ? body.temperature : undefined,
    });
    const subject = text.startsWith("Subject:") ? text.split("\n")[0].replace(/^Subject:\s*/, "") : undefined;
    return NextResponse.json({ text, subject, source: "llm", remaining: limit.remaining });
  } catch (error) {
    const message = error instanceof Error ? error.message : "LLM error";
    return NextResponse.json({ ...fallback(), note: `LLM failed (${message}). Showing a template instead.` });
  }
}
