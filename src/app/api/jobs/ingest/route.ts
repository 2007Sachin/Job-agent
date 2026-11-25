import { classifyJobUrl, clientKey } from "@/lib/job-sources";
import { enforceDailyCap } from "@/lib/rate-limit";
import type { Job } from "@/lib/types";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function clip(text: string) {
  const clean = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return clean.slice(0, 4000);
}

export async function POST(request: Request) {
  const limit = enforceDailyCap(`ingest:${clientKey(request)}`);
  if (!limit.ok) {
    return NextResponse.json({ error: "Daily paste limit reached. Try again tomorrow." }, { status: 429 });
  }
  const body = (await request.json()) as { url?: string; title?: string; company?: string; description?: string };
  const url = body.url?.trim() ?? "";
  const pasted = body.description?.trim() ?? "";
  if (url) {
    const kind = classifyJobUrl(url);
    if (kind.kind === "blocked") {
      return NextResponse.json(
        { error: `${kind.host} is not fetched. Paste the job description yourself. LinkedIn is never automated.` },
        { status: 400 },
      );
    }
    if (kind.kind === "greenhouse") {
      const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${kind.board}/jobs/${kind.jobId}`, {
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return NextResponse.json({ error: "Greenhouse did not return that job." }, { status: 502 });
      const job = (await res.json()) as { id: number; title: string; absolute_url: string; content?: string; location?: { name?: string } };
      const row: Job = {
        id: `gh-${kind.board}-${job.id}`,
        title: job.title,
        company: kind.board,
        location: job.location?.name || "See posting",
        source: "Greenhouse",
        url: job.absolute_url,
        description: clip(job.content || pasted),
        postedAt: new Date().toISOString().slice(0, 10),
      };
      return NextResponse.json({ job: row });
    }
    if (kind.kind === "lever") {
      const res = await fetch(`https://api.lever.co/v0/postings/${kind.company}/${kind.postingId}`, {
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return NextResponse.json({ error: "Lever did not return that job." }, { status: 502 });
      const job = (await res.json()) as { id: string; text: string; hostedUrl: string; descriptionPlain?: string; categories?: { location?: string } };
      const row: Job = {
        id: `lever-${kind.company}-${job.id}`,
        title: job.text,
        company: kind.company,
        location: job.categories?.location || "See posting",
        source: "Lever",
        url: job.hostedUrl,
        description: clip(job.descriptionPlain || pasted),
        postedAt: new Date().toISOString().slice(0, 10),
      };
      return NextResponse.json({ job: row });
    }
  }
  if (pasted.length < 40) {
    return NextResponse.json(
      { error: "Paste the job description (at least a short paragraph). Arbitrary websites are not scraped." },
      { status: 400 },
    );
  }
  const row: Job = {
    id: `paste-${crypto.randomUUID()}`,
    title: body.title?.trim() || "Pasted role",
    company: body.company?.trim() || "Employer",
    location: "See description",
    source: "Pasted by you",
    url: url || "",
    description: pasted,
    postedAt: new Date().toISOString().slice(0, 10),
  };
  return NextResponse.json({ job: row });
}
