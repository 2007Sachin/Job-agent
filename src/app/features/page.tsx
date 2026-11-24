import { SiteFooter, SiteHeader } from "@/components/site-header";

const blocks = [
  ["Search without a scrape", "The feed uses public APIs you opt into: Remotive, Adzuna when you add keys, and Greenhouse or Lever boards you name. You can also paste a URL and the description. LinkedIn and sites that forbid collection are not fetched."],
  ["Resume and letter, per job", "Each saved role can hold an editable resume variant and a cover letter. Export DOCX, or print to PDF. The model is told not to invent employers or dates. Without an API key, a plain template still fills in."],
  ["Tracker", "Saved, applied, interviewing, offer, rejected. Drag a card. The apply panel copies the facts an employer form usually asks for and opens the posting. You submit it."],
  ["Follow-ups", "Cold email can record a follow-up date. The home desk lists what is due. Job-agent does not send the reminder for you."],
];

export default function FeaturesPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="text-5xl md:text-6xl">What the desk actually does</h1>
        <p className="mt-4 text-lg text-muted">Same tools whether you are applying to a hospital, a mill, a school, or a software company.</p>
        <div className="mt-12 space-y-10">
          {blocks.map(([title, body]) => (
            <section key={title} className="border-t border-line pt-6">
              <h2 className="text-3xl">{title}</h2>
              <p className="mt-3 max-w-[65ch] text-muted">{body}</p>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
