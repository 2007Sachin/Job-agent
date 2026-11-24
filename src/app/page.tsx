import { Kip } from "@/components/kip";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-[1.3fr_0.7fr] md:py-24">
          <div className="pointer-events-none absolute -left-10 top-8 h-40 w-40 rounded-full bg-brass/30 blur-3xl" aria-hidden />
          <div>
            <Kip className="mb-4 h-16 w-16" />
            <h1 className="max-w-[16ch] text-5xl leading-[1.02] md:text-7xl">
              A glass desk for every application.
            </h1>
            <p className="draw mt-6 h-px w-40 bg-brass" />
            <p className="mt-6 max-w-[62ch] text-lg text-muted">
              Kipdesk, still labeled Job-agent here, puts several bots in one room. They search allowed sources, draft from your real history, and wait for you before anything is sent.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="bg-brass px-4 py-3 text-paper">Create an account</Link>
              <Link href="/features" className="border border-line px-4 py-3">See the workflow</Link>
            </div>
          </div>
          <aside className="border border-line bg-card p-6">
            <p className="font-display text-3xl leading-tight">Today, one desk.</p>
            <ol className="mt-6 space-y-4 text-sm">
              <li><span className="text-brass">1</span> Keep a resume and the roles, cities, and pay you will accept.</li>
              <li><span className="text-brass">2</span> Search public boards or paste a description you already have.</li>
              <li><span className="text-brass">3</span> Edit the draft. Open the apply link yourself. Send email only after you approve it.</li>
            </ol>
          </aside>
        </section>
        <section className="border-t border-line">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-2">
            <div>
              <h2 className="text-4xl">A match score you can argue with</h2>
              <p className="mt-4 max-w-[58ch] text-muted">
                The score compares your skills, target roles, locations, pay floor, and resume wording with the description. It is a reading aid, not a verdict, and it works the same way for a ward shift as for a staff engineer seat.
              </p>
            </div>
            <div>
              <h2 className="text-4xl">Messages stay yours</h2>
              <p className="mt-4 max-w-[58ch] text-muted">
                Cover letters, resume variants, and LinkedIn notes are drafts. LinkedIn is never automated. Email leaves this app only through your Gmail or SMTP, and only after you approve that message.
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
