export type PublicPosting =
  | { kind: "greenhouse"; board: string; jobId: string }
  | { kind: "lever"; company: string; postingId: string }
  | { kind: "blocked"; host: string }
  | { kind: "unknown" };

const BLOCKED = ["linkedin.com", "naukri.com", "indeed.com", "glassdoor.com", "instahyre.com", "foundit.in", "monster.com"];

export function classifyJobUrl(raw: string): PublicPosting {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { kind: "unknown" };
  }
  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  if (BLOCKED.some((b) => host === b || host.endsWith(`.${b}`))) {
    return { kind: "blocked", host };
  }
  const gh = url.pathname.match(/^\/([^/]+)\/jobs\/(\d+)/);
  if (host.endsWith("greenhouse.io") && gh) {
    return { kind: "greenhouse", board: gh[1], jobId: gh[2] };
  }
  const lever = url.pathname.match(/^\/([^/]+)\/([0-9a-f-]{8,})/i);
  if (host === "jobs.lever.co" && lever) {
    return { kind: "lever", company: lever[1], postingId: lever[2] };
  }
  return { kind: "unknown" };
}

export function clientKey(request: Request, userId?: string | null): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local";
  return userId ? `${userId}:${ip}` : ip;
}
