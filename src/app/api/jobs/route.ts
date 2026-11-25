import { filterCatalog } from "@/lib/catalog";
import { searchKeyWarning } from "@/lib/search-warning";
import type { Job } from "@/lib/types";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function clip(text: string, n = 1800) {
  const clean = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return clean.length > n ? `${clean.slice(0, n)}…` : clean;
}

async function fromRemotive(query: string): Promise<Job[]> {
  const url = new URL("https://remotive.com/api/remote-jobs");
  if (query) url.searchParams.set("search", query);
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`Remotive ${res.status}`);
  const data = (await res.json()) as {
    jobs?: { id: number; title: string; company_name: string; candidate_required_location: string; url: string; description: string; publication_date: string; salary?: string }[];
  };
  return (data.jobs ?? []).slice(0, 15).map((job) => ({
    id: `remotive-${job.id}`,
    title: job.title,
    company: job.company_name,
    location: job.candidate_required_location || "Remote",
    source: "Remotive",
    url: job.url,
    description: clip(job.description),
    salaryLabel: job.salary || undefined,
    postedAt: (job.publication_date || "").slice(0, 10),
  }));
}

async function fromAdzuna(query: string, location: string): Promise<Job[]> {
  const id = process.env.ADZUNA_APP_ID;
  const key = process.env.ADZUNA_APP_KEY;
  if (!id || !key) return [];
  const url = new URL("https://api.adzuna.com/v1/api/jobs/in/search/1");
  url.searchParams.set("app_id", id);
  url.searchParams.set("app_key", key);
  url.searchParams.set("results_per_page", "15");
  if (query) url.searchParams.set("what", query);
  if (location) url.searchParams.set("where", location);
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`Adzuna ${res.status}`);
  const data = (await res.json()) as {
    results?: { id: string; title: string; company: { display_name: string }; location: { display_name: string }; redirect_url: string; description: string; created: string; salary_min?: number; salary_max?: number }[];
  };
  return (data.results ?? []).map((job) => ({
    id: `adzuna-${job.id}`,
    title: job.title,
    company: job.company?.display_name || "Company",
    location: job.location?.display_name || "India",
    source: "Adzuna",
    url: job.redirect_url,
    description: clip(job.description),
    salaryLabel:
      job.salary_min && job.salary_max
        ? `${Math.round(job.salary_min / 100000)}–${Math.round(job.salary_max / 100000)} LPA`
        : undefined,
    postedAt: (job.created || "").slice(0, 10),
  }));
}

async function fromGreenhouse(): Promise<Job[]> {
  const boards = (process.env.GREENHOUSE_BOARDS || "").split(",").map((s) => s.trim()).filter(Boolean);
  const jobs: Job[] = [];
  for (const board of boards.slice(0, 4)) {
    const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${board}/jobs?content=true`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) continue;
    const data = (await res.json()) as {
      jobs?: { id: number; title: string; absolute_url: string; location?: { name?: string }; content?: string; updated_at?: string }[];
    };
    for (const job of (data.jobs ?? []).slice(0, 8)) {
      jobs.push({
        id: `gh-${board}-${job.id}`,
        title: job.title,
        company: board,
        location: job.location?.name || "See posting",
        source: "Greenhouse",
        url: job.absolute_url,
        description: clip(job.content || job.title),
        postedAt: (job.updated_at || "").slice(0, 10),
      });
    }
  }
  return jobs;
}

async function fromLever(): Promise<Job[]> {
  const companies = (process.env.LEVER_COMPANIES || "").split(",").map((s) => s.trim()).filter(Boolean);
  const jobs: Job[] = [];
  for (const company of companies.slice(0, 4)) {
    const res = await fetch(`https://api.lever.co/v0/postings/${company}?mode=json`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) continue;
    const data = (await res.json()) as {
      id: string;
      text: string;
      hostedUrl: string;
      descriptionPlain?: string;
      categories?: { location?: string };
      createdAt?: number;
    }[];
    for (const job of data.slice(0, 8)) {
      jobs.push({
        id: `lever-${company}-${job.id}`,
        title: job.text,
        company,
        location: job.categories?.location || "See posting",
        source: "Lever",
        url: job.hostedUrl,
        description: clip(job.descriptionPlain || job.text),
        postedAt: job.createdAt ? new Date(job.createdAt).toISOString().slice(0, 10) : "",
      });
    }
  }
  return jobs;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const location = searchParams.get("location") ?? "";
  const warnings: string[] = [];
  const batches = await Promise.all([
    fromRemotive(q).catch((e: Error) => {
      warnings.push(`Remotive unavailable (${e.message})`);
      return [] as Job[];
    }),
    fromAdzuna(q, location).catch((e: Error) => {
      warnings.push(`Adzuna unavailable (${e.message})`);
      return [] as Job[];
    }),
    fromGreenhouse().catch((e: Error) => {
      warnings.push(`Greenhouse unavailable (${e.message})`);
      return [] as Job[];
    }),
    fromLever().catch((e: Error) => {
      warnings.push(`Lever unavailable (${e.message})`);
      return [] as Job[];
    }),
  ]);
  const live = batches.flat();
  const qLower = q.toLowerCase();
  const locLower = location.toLowerCase();
  const filteredLive = live.filter((job) => {
    const blob = `${job.title} ${job.company} ${job.description} ${job.location}`.toLowerCase();
    const qOk = !qLower || qLower.split(/\s+/).every((part) => blob.includes(part));
    const lOk = !locLower || job.location.toLowerCase().includes(locLower);
    return qOk && lOk;
  });
  const demo = filterCatalog(q, location);
  const jobs = [...filteredLive, ...demo].slice(0, 40);
  const seeker = searchKeyWarning({
    adzuna: process.env.ADZUNA_APP_ID,
    greenhouse: process.env.GREENHOUSE_BOARDS,
    lever: process.env.LEVER_COMPANIES,
  });
  if (seeker) {
    warnings.push(seeker);
    if (!process.env.ADZUNA_APP_ID) console.info("Find jobs: ADZUNA_APP_ID and ADZUNA_APP_KEY are unset.");
    if (!process.env.GREENHOUSE_BOARDS) console.info("Find jobs: GREENHOUSE_BOARDS is unset.");
    if (!process.env.LEVER_COMPANIES) console.info("Find jobs: LEVER_COMPANIES is unset.");
  }
  return NextResponse.json({
    jobs,
    warnings,
    sources: ["Demo catalog", "Remotive", "Adzuna", "Greenhouse", "Lever"],
  });
}
