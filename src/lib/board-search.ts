export type BoardSearch = {
  keywords: string;
  location: string;
  remote: boolean;
  experience: "" | "entry" | "mid" | "senior";
  posted: "" | "day" | "week" | "month";
  easyApply: boolean;
};

const experienceCode: Record<string, string> = { entry: "2", mid: "4", senior: "5" };
const postedCode: Record<string, string> = { day: "r86400", week: "r604800", month: "r2592000" };

export function linkedInJobsUrl(q: BoardSearch) {
  const params = new URLSearchParams();
  if (q.keywords) params.set("keywords", q.keywords);
  if (q.location) params.set("location", q.location);
  if (q.remote) params.set("f_WT", "2");
  if (q.experience && experienceCode[q.experience]) params.set("f_E", experienceCode[q.experience]);
  if (q.posted && postedCode[q.posted]) params.set("f_TPR", postedCode[q.posted]);
  if (q.easyApply) params.set("f_AL", "true");
  return `https://www.linkedin.com/jobs/search/?${params.toString()}`;
}

export type BoardLink = { id: string; name: string; url: string };

export function boardSearchLinks(q: BoardSearch): BoardLink[] {
  const words = encodeURIComponent(q.keywords);
  const place = encodeURIComponent(q.location);
  return [
    { id: "linkedin", name: "LinkedIn", url: linkedInJobsUrl(q) },
    { id: "naukri", name: "Naukri", url: `https://www.naukri.com/jobs?k=${words}&l=${place}` },
    { id: "instahyre", name: "Instahyre", url: `https://www.instahyre.com/search/?q=${words}` },
    { id: "hirist", name: "Hirist", url: `https://www.hirist.tech/search/?q=${words}` },
    { id: "cutshort", name: "Cutshort", url: `https://cutshort.io/jobs?search=${words}` },
    { id: "wellfound", name: "Wellfound", url: `https://wellfound.com/jobs?query=${words}` },
    { id: "indeed", name: "Indeed", url: `https://in.indeed.com/jobs?q=${words}&l=${place}` },
    { id: "glassdoor", name: "Glassdoor", url: `https://www.glassdoor.co.in/Job/jobs.htm?sc.keyword=${words}&locKeyword=${place}` },
  ];
}
