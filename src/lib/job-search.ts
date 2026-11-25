import { filterCatalog } from "./catalog";
import type { Job } from "./types";

export type SourceReport = { name: string; state: "answered" | "off" | "down"; count: number; detail: string };

export type SearchResult = {
  jobs: Job[];
  warnings: string[];
  note: string;
  sources: SourceReport[];
};

const cache = new Map<string, { at: number; body: unknown }>();
const CACHE_MS = 15 * 60 * 1000;

const CHAT_FILLER = new Set(["find", "me", "my", "jobs", "job", "in", "a", "an", "the", "for", "please", "search", "looking", "role", "roles", "opening", "openings", "any", "show", "some"]);

export function searchQuery(raw: string) {
  const text = raw.trim();
  if (!text || /^any job$/i.test(text)) return "";
  return text;
}

/** Chat utterances include instructions and a place. Keep the role words, and the place separately. */
export function roleFromChat(text: string) {
  let location = "";
  const withoutPlace = text.replace(/\b(?:in|near|around)\s+([A-Za-z][A-Za-z .'-]{1,40})$/i, (_, place: string) => {
    location = place.trim();
    return "";
  });
  const words = withoutPlace
    .split(/\s+/)
    .map((word) => word.replace(/[^A-Za-z0-9+-]/g, ""))
    .filter((word) => word && !CHAT_FILLER.has(word.toLowerCase()));
  return { q: searchQuery(words.join(" ")), location };
}

export function salaryLabel(min?: number, max?: number) {
  if (!min || !max) return undefined;
  return `${Math.round(min / 100000)}–${Math.round(max / 100000)} LPA`;
}

export function slugList(raw: string | undefined, fallback: string) {
  const value = (raw && raw.trim()) || fallback;
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}

function clip(text: string, n = 900) {
  const clean = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return clean.length > n ? `${clean.slice(0, n)}…` : clean;
}

function matchesQuery(job: Job, query: string) {
  if (!query) return true;
  const blob = `${job.title} ${job.company} ${(job.tags || []).join(" ")}`.toLowerCase();
  return query.toLowerCase().split(/\s+/).filter(Boolean).every((part) => blob.includes(part));
}

function locationRank(job: Job, location: string) {
  if (!location) return 1;
  const where = job.location.toLowerCase();
  const want = location.toLowerCase();
  if (where.includes(want)) return 3;
  if (/\bremote\b/.test(want) && /\bremote\b|worldwide|anywhere/.test(where)) return 3;
  if (/\bremote\b|worldwide|anywhere/.test(where)) return 2;
  return 0;
}

export function dedupeJobs(jobs: Job[]) {
  const seen = new Set<string>();
  const out: Job[] = [];
  for (const job of jobs) {
    const place = /\bremote\b|worldwide|anywhere/i.test(job.location) ? "remote" : job.location.toLowerCase();
    const key = `${job.title} ${job.company} ${place}`.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(job);
  }
  return out;
}

/** Location boosts a match. It does not drop every other role. */
export function rankJobs(jobs: Job[], query: string, location: string) {
  const q = searchQuery(query);
  const matched = dedupeJobs(jobs.filter((job) => matchesQuery(job, q)));
  const ranked = matched
    .map((job) => ({ job, rank: locationRank(job, location) }))
    .sort((a, b) => b.rank - a.rank)
    .map((row) => row.job);
  const city = Boolean(location) && !/^remote$/i.test(location);
  const local = !city || matched.some((job) => locationRank(job, location) >= 3);
  const note = local
    ? ""
    : ranked.some((job) => locationRank(job, location) >= 2)
      ? `Remote roles (none found in ${location})`
      : `None found in ${location}. Showing other matches.`;
  return { jobs: ranked.slice(0, 40), note };
}

async function cachedJson(url: string, timeoutMs = 12000): Promise<unknown> {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.body;
  const res = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
    headers: { "User-Agent": "Job-agent", Accept: "application/json" },
  });
  if (!res.ok) throw new Error(String(res.status));
  const body = await res.json();
  cache.set(url, { at: Date.now(), body });
  return body;
}

async function safe(name: string, run: () => Promise<Job[]>): Promise<{ jobs: Job[]; report: SourceReport }> {
  try {
    const jobs = await run();
    return { jobs, report: { name, state: "answered", count: jobs.length, detail: `${name} answered with ${jobs.length}` } };
  } catch {
    return { jobs: [], report: { name, state: "down", count: 0, detail: `${name} did not answer` } };
  }
}

export async function searchJobs(input: { q: string; location: string; demo?: boolean }): Promise<SearchResult> {
  const query = searchQuery(input.q);
  const location = input.location.trim();
  const boards = slugList(process.env.GREENHOUSE_BOARDS, "groww");
  const levers = slugList(process.env.LEVER_COMPANIES, "paytm,meesho,cred");
  const adzunaOn = Boolean(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY);

  const batches = await Promise.all([
    safe("Remotive", () => remotive()),
    safe("Arbeitnow", () => arbeitnow()),
    safe("Remote OK", () => remoteOk()),
    safe("Jobicy", () => jobicy(query, location)),
    safe("Himalayas", () => himalayas()),
    adzunaOn
      ? safe("Adzuna", () => adzuna(query, location))
      : Promise.resolve({ jobs: [] as Job[], report: { name: "Adzuna", state: "off" as const, count: 0, detail: "India-wide listings are off" } }),
    safe("Greenhouse", () => greenhouse(boards)),
    safe("Lever", () => lever(levers)),
  ]);

  const live = batches.flatMap((batch) => batch.jobs);
  const demoJobs = input.demo
    ? filterCatalog(query, "").map((job) => ({ ...job, source: "Demo example" }))
    : [];
  const ranked = rankJobs([...live, ...demoJobs], query, location);
  const warnings = batches.map((batch) => batch.report.detail);
  if (ranked.note) warnings.unshift(ranked.note);
  return { jobs: ranked.jobs, warnings, note: ranked.note, sources: batches.map((batch) => batch.report) };
}

async function remotive(): Promise<Job[]> {
  const data = (await cachedJson("https://remotive.com/api/remote-jobs")) as {
    jobs?: { id: number; title: string; company_name: string; candidate_required_location: string; url: string; description: string; publication_date: string; tags?: string[]; salary?: string }[];
  };
  return (data.jobs ?? []).map((job) => ({
    id: `remotive-${job.id}`,
    title: job.title,
    company: job.company_name,
    location: job.candidate_required_location || "Remote",
    source: "Remotive",
    url: job.url,
    description: clip(job.description),
    tags: job.tags,
    salaryLabel: job.salary || undefined,
    postedAt: (job.publication_date || "").slice(0, 10),
  }));
}

async function arbeitnow(): Promise<Job[]> {
  const data = (await cachedJson("https://www.arbeitnow.com/api/job-board-api")) as {
    data?: { slug: string; title: string; company_name: string; location: string; description: string; remote?: boolean; tags?: string[]; url: string }[];
  };
  return (data.data ?? []).slice(0, 200).map((job) => ({
    id: `arbeitnow-${job.slug}`,
    title: job.title,
    company: job.company_name,
    location: job.remote ? `${job.location || "Remote"} · Remote` : job.location || "Remote",
    source: "Arbeitnow",
    url: job.url,
    description: clip(job.description || job.title),
    tags: job.tags,
    postedAt: "",
  }));
}

async function remoteOk(): Promise<Job[]> {
  const data = (await cachedJson("https://remoteok.com/api")) as ({
    id?: string;
    position?: string;
    company?: string;
    location?: string;
    tags?: string[];
    url?: string;
    description?: string;
    date?: string;
  } | string)[];
  return data.filter((row): row is { id?: string; position?: string; company?: string; location?: string; tags?: string[]; url?: string; description?: string; date?: string } => typeof row === "object" && Boolean(row.position)).map((job) => ({
    id: `remoteok-${job.id}`,
    title: job.position || "Role",
    company: job.company || "Company",
    location: job.location || "Remote",
    source: "Remote OK",
    url: job.url || "https://remoteok.com",
    description: clip(job.description || job.position || ""),
    tags: job.tags,
    postedAt: (job.date || "").slice(0, 10),
  }));
}

async function jobicy(query: string, location: string): Promise<Job[]> {
  const geo = !query && /india|bengaluru|bangalore|mumbai|delhi|hyderabad|pune|chennai/i.test(location) ? "india" : "";
  const tag = query.split(/\s+/).filter((part) => part.length > 2).at(-1) || "";
  const params = new URLSearchParams({ count: "50" });
  if (geo) params.set("geo", geo);
  if (tag) params.set("tag", tag);
  const data = (await cachedJson(`https://jobicy.com/api/v2/remote-jobs?${params}`)) as {
    jobs?: { id: number; jobTitle: string; companyName: string; jobGeo?: string; jobExcerpt?: string; url: string; jobIndustry?: string[] }[];
  };
  return (data.jobs ?? []).map((job) => ({
    id: `jobicy-${job.id}`,
    title: job.jobTitle,
    company: job.companyName,
    location: job.jobGeo || "Remote",
    source: "Jobicy",
    url: job.url,
    description: clip(job.jobExcerpt || job.jobTitle),
    tags: job.jobIndustry,
    postedAt: "",
  }));
}

async function himalayas(): Promise<Job[]> {
  const data = (await cachedJson("https://himalayas.app/jobs/api?limit=50")) as {
    jobs?: { title: string; companyName: string; locationRestrictions?: string[]; excerpt?: string; applicationLink?: string; guid?: string; pubDate?: string }[];
  };
  return (data.jobs ?? []).map((job, index) => ({
    id: `himalayas-${job.guid || index}`,
    title: job.title,
    company: job.companyName,
    location: job.locationRestrictions?.join(", ") || "Remote",
    source: "Himalayas",
    url: job.applicationLink || "https://himalayas.app",
    description: clip(job.excerpt || job.title),
    postedAt: (job.pubDate || "").slice(0, 10),
  }));
}

async function adzuna(query: string, location: string): Promise<Job[]> {
  const url = new URL("https://api.adzuna.com/v1/api/jobs/in/search/1");
  url.searchParams.set("app_id", process.env.ADZUNA_APP_ID!);
  url.searchParams.set("app_key", process.env.ADZUNA_APP_KEY!);
  url.searchParams.set("results_per_page", "15");
  if (query) url.searchParams.set("what", query);
  if (location) url.searchParams.set("where", location);
  const data = (await cachedJson(url.toString())) as {
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
    salaryLabel: salaryLabel(job.salary_min, job.salary_max),
    postedAt: (job.created || "").slice(0, 10),
  }));
}

async function greenhouse(boards: string[]): Promise<Job[]> {
  const jobs: Job[] = [];
  for (const board of boards) {
    try {
      const data = (await cachedJson(`https://boards-api.greenhouse.io/v1/boards/${board}/jobs?content=true`)) as {
        jobs?: { id: number; title: string; absolute_url: string; location?: { name?: string }; content?: string; updated_at?: string }[];
      };
      for (const job of (data.jobs ?? []).slice(0, 12)) {
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
    } catch {
      /* one board can fail without dropping the rest */
    }
  }
  if (!jobs.length) throw new Error("empty");
  return jobs;
}

async function lever(companies: string[]): Promise<Job[]> {
  const jobs: Job[] = [];
  for (const company of companies) {
    try {
      const data = (await cachedJson(`https://api.lever.co/v0/postings/${company}?mode=json`)) as {
        id: string;
        text: string;
        hostedUrl: string;
        descriptionPlain?: string;
        categories?: { location?: string; team?: string };
        createdAt?: number;
      }[];
      for (const job of data.slice(0, 12)) {
        jobs.push({
          id: `lever-${company}-${job.id}`,
          title: job.text,
          company,
          location: job.categories?.location || "See posting",
          source: "Lever",
          url: job.hostedUrl,
          description: clip(job.descriptionPlain || job.text),
          tags: job.categories?.team ? [job.categories.team] : undefined,
          postedAt: job.createdAt ? new Date(job.createdAt).toISOString().slice(0, 10) : "",
        });
      }
    } catch {
      /* one company can fail */
    }
  }
  if (!jobs.length) throw new Error("empty");
  return jobs;
}
