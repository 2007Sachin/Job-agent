import type { Job } from "./types";

/** Illustrative postings. Live results come from permitted APIs, not from these rows. */
export const CATALOG: Job[] = [
  {
    id: "demo-ward-nurse",
    title: "Staff Nurse",
    company: "Kaveri Care",
    location: "Hyderabad, India",
    source: "Demo catalog",
    url: "https://example.com/jobs/kaveri-care-nurse",
    salaryLabel: "4–6 LPA",
    postedAt: "2026-11-18",
    description:
      "Kaveri Care is hiring a staff nurse for a 40-bed ward. You will administer medication, document vitals, support families, and hand over cleanly at shift change. GNM or BSc Nursing and a valid state council registration required. Two years of ward experience preferred. Night shifts rotate. English and Telugu help on the floor.",
  },
  {
    id: "demo-frontend",
    title: "Frontend Engineer",
    company: "Nilgiri Cloud",
    location: "Bengaluru, India",
    source: "Demo catalog",
    url: "https://example.com/jobs/nilgiri-frontend",
    salaryLabel: "18–28 LPA",
    postedAt: "2026-11-20",
    description:
      "Build the customer console for a logistics platform. React, TypeScript, and accessible HTML. You will pair with design, write tests, and ship weekly. Three or more years shipping web apps. Familiarity with REST APIs. Hybrid in Bengaluru three days a week.",
  },
  {
    id: "demo-ae",
    title: "Enterprise Account Executive",
    company: "Harborstack",
    location: "Mumbai, India",
    source: "Demo catalog",
    url: "https://example.com/jobs/harborstack-ae",
    salaryLabel: "16–24 LPA + commission",
    postedAt: "2026-11-12",
    description:
      "Own a patch of mid-market and enterprise accounts across western India. Run discovery, demos, and commercial negotiation. Quota-carrying. Salesforce hygiene is part of the job. Four years of B2B software sales. Travel to Pune and Ahmedabad once a month.",
  },
  {
    id: "demo-designer",
    title: "Product Designer",
    company: "Loom & Field",
    location: "Remote, India",
    source: "Demo catalog",
    url: "https://example.com/jobs/loom-designer",
    salaryLabel: "14–22 LPA",
    postedAt: "2026-11-15",
    description:
      "Design onboarding and billing flows for a payments app used by small shops. Figma, prototyping, and research interviews with merchants. A portfolio with shipped mobile work. You write the specs designers and engineers share. Hindi or English user interviews.",
  },
  {
    id: "demo-accountant",
    title: "Senior Accountant",
    company: "Artha Ledger",
    location: "Pune, India",
    source: "Demo catalog",
    url: "https://example.com/jobs/artha-accountant",
    salaryLabel: "8–12 LPA",
    postedAt: "2026-11-09",
    description:
      "Close the books for three group entities. GST, TDS, Ind AS working papers, and coordination with statutory auditors. CA inter or M.Com with five years in practice or industry. Tally and Excel. Busy season includes Saturday mornings in March.",
  },
  {
    id: "demo-ops",
    title: "Warehouse Shift Lead",
    company: "Monsoon Cart",
    location: "Delhi NCR, India",
    source: "Demo catalog",
    url: "https://example.com/jobs/monsoon-warehouse",
    salaryLabel: "6–9 LPA",
    postedAt: "2026-11-17",
    description:
      "Lead a 25-person outbound shift. Pick accuracy, dispatch cut-offs, and incident reports. You have run a store, plant, or warehouse floor. Comfortable on your feet. Basic Excel for the daily tracker. Hindi required, English for carrier emails.",
  },
  {
    id: "demo-teacher",
    title: "Middle School Science Teacher",
    company: "Red Soil School",
    location: "Jaipur, India",
    source: "Demo catalog",
    url: "https://example.com/jobs/red-soil-science",
    salaryLabel: "5–7 LPA",
    postedAt: "2026-11-08",
    description:
      "Teach science to grades 6–8. Plan labs that survive a class of 32. B.Ed and a science degree. Experience with CBSE preferred. You communicate with parents in Hindi and English and contribute to the annual science fair.",
  },
  {
    id: "demo-fresher",
    title: "Management Trainee",
    company: "Sable Mills",
    location: "Coimbatore, India",
    source: "Demo catalog",
    url: "https://example.com/jobs/sable-trainee",
    salaryLabel: "4–5 LPA",
    postedAt: "2026-11-19",
    description:
      "A one-year rotation across production, sales, and finance for a textile mill. Fresh graduates from any discipline. We look for clear writing, Excel, and willingness to work a plant shift in month three. Stipend becomes a full role after review.",
  },
  {
    id: "demo-marketing",
    title: "Performance Marketing Associate",
    company: "Northwind Pay",
    location: "Gurugram, India",
    source: "Demo catalog",
    url: "https://example.com/jobs/northwind-marketing",
    salaryLabel: "7–11 LPA",
    postedAt: "2026-11-14",
    description:
      "Run paid social and search for a consumer finance app. Meta Ads, Google Ads, UTM discipline, and weekly readouts. One to three years. You do not need to be an engineer. Comfort with sheets and a plain explanation of CAC.",
  },
  {
    id: "demo-support",
    title: "Customer Support Lead",
    company: "Brightline Clinics",
    location: "Remote, India",
    source: "Demo catalog",
    url: "https://example.com/jobs/brightline-support",
    salaryLabel: "9–13 LPA",
    postedAt: "2026-11-11",
    description:
      "Lead a remote desk that helps patients reschedule and understand bills. Hiring, QA of calls, and a help-centre article each week. Three years in support, healthcare exposure welcome. English and one more Indian language. Laptop and stable home internet.",
  },
  {
    id: "demo-data",
    title: "Data Analyst",
    company: "Fieldnote",
    location: "Chennai, India",
    source: "Demo catalog",
    url: "https://example.com/jobs/fieldnote-analyst",
    salaryLabel: "10–16 LPA",
    postedAt: "2026-11-16",
    description:
      "SQL and a notebook to explain why claims spike. You write the query, the chart, and the paragraph a non-analyst can use. Python or R. Two years. Healthcare or insurance domain is a plus, not a gate.",
  },
  {
    id: "demo-chef",
    title: "Commis Chef",
    company: "Salt Line Kitchen",
    location: "Goa, India",
    source: "Demo catalog",
    url: "https://example.com/jobs/salt-line-chef",
    salaryLabel: "3.5–5 LPA + meals",
    postedAt: "2026-11-07",
    description:
      "Cold section in a 70-cover restaurant. Knife work, prep lists, and clean closes. A hospitality diploma or a year on the line. Six-day weeks in season. Staff meal included.",
  },
];

export function filterCatalog(query: string, location: string): Job[] {
  const q = query.trim().toLowerCase();
  const loc = location.trim().toLowerCase();
  return CATALOG.filter((job) => {
    const blob = `${job.title} ${job.company} ${job.description} ${job.location}`.toLowerCase();
    const qOk = !q || q.split(/\s+/).every((part) => blob.includes(part));
    const lOk = !loc || job.location.toLowerCase().includes(loc);
    return qOk && lOk;
  });
}
