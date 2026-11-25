import { Orbit } from "@/components/orbit";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 md:grid-cols-[1.1fr_0.9fr] md:py-28">
          <div>
            <h1 className="max-w-[14ch] text-5xl leading-[1.02] md:text-6xl">
              The application moves. You decide when it leaves.
            </h1>
            <p className="mt-6 max-w-[58ch] text-lg text-muted">
              Scout finds a role. Tailor writes from your real history. Relay hands the work across. Nothing is sent until you say so.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="bg-brass px-4 py-3 text-paper">Create an account</Link>
              <Link href="/features" className="border border-line px-4 py-3">See the workflow</Link>
            </div>
          </div>
          <Orbit />
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
