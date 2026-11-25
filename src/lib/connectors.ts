export type ConnectorMode = "api" | "assist";

export type ConnectorDef = {
  id: string;
  name: string;
  mode: ConnectorMode;
  search: boolean;
  detail: boolean;
  applyAssist: boolean;
  messageDraft: boolean;
  status: string;
  note: string;
  link: (query: string, location: string) => string;
};

export function connectors(env: {
  adzuna?: boolean;
  greenhouse?: boolean;
  lever?: boolean;
} = {}): ConnectorDef[] {
  return [
    {
      id: "remotive",
      name: "Remotive",
      mode: "api",
      search: true,
      detail: true,
      applyAssist: true,
      messageDraft: false,
      status: "Public API, no key",
      note: "Remote listings from Remotive's public jobs API.",
      link: (q) => `https://remotive.com/remote-jobs/search?query=${encodeURIComponent(q)}`,
    },
    {
      id: "adzuna",
      name: "Adzuna",
      mode: "api",
      search: true,
      detail: true,
      applyAssist: true,
      messageDraft: false,
      status: env.adzuna ? "API key configured" : "Needs ADZUNA_APP_ID and ADZUNA_APP_KEY",
      note: "India search when the Adzuna keys are set. Otherwise this row stays idle.",
      link: (q, loc) => `https://www.adzuna.in/search?q=${encodeURIComponent(q)}&w=${encodeURIComponent(loc)}`,
    },
    {
      id: "greenhouse",
      name: "Greenhouse",
      mode: "api",
      search: true,
      detail: true,
      applyAssist: true,
      messageDraft: false,
      status: env.greenhouse ? "Boards configured" : "Needs GREENHOUSE_BOARDS",
      note: "Reads public board APIs for boards you name. A single job URL on greenhouse.io can be fetched.",
      link: () => "https://job-boards.greenhouse.io/",
    },
    {
      id: "lever",
      name: "Lever",
      mode: "api",
      search: true,
      detail: true,
      applyAssist: true,
      messageDraft: false,
      status: env.lever ? "Companies configured" : "Needs LEVER_COMPANIES",
      note: "Reads Lever's public postings API for companies you name.",
      link: () => "https://jobs.lever.co/",
    },
    assist("linkedin", "LinkedIn", "https://www.linkedin.com/jobs/search/?keywords=", "No scraping, no login, no automated notes. Search opens in LinkedIn. Paste a description here."),
    assist("naukri", "Naukri", "https://www.naukri.com/", "Assist only. We do not store Naukri credentials or crawl listings."),
    assist("instahyre", "Instahyre", "https://www.instahyre.com/", "Assist only. Open the site yourself and paste the role you want help with."),
    assist("hirist", "Hirist", "https://www.hirist.tech/", "Assist only. Deep link plus a description you paste."),
    assist("cutshort", "Cutshort", "https://cutshort.io/jobs", "Assist only. No account connection."),
    assist("wellfound", "Wellfound", "https://wellfound.com/jobs?query=", "Assist only. We do not call a private Wellfound API."),
    assist("indeed", "Indeed", "https://in.indeed.com/jobs?q=", "Assist only. Indeed's terms do not allow collection here."),
    assist("foundit", "Foundit", "https://www.foundit.in/srp/results?query=", "Assist only. Paste the job URL and description."),
  ];
}

function assist(id: string, name: string, href: string, note: string): ConnectorDef {
  return {
    id,
    name,
    mode: "assist",
    search: false,
    detail: false,
    applyAssist: true,
    messageDraft: true,
    status: "Assist mode",
    note,
    link: (q) => `${href}${encodeURIComponent(q)}`,
  };
}
