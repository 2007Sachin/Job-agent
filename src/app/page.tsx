import { SiteFooter, SiteHeader } from "@/components/site-header";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="max-w-[20ch] text-4xl">Find a job. Make your resume. Keep track.</h1>
        <p className="mt-4 max-w-[62ch]">
          Tell us the work you want. We show jobs and write a resume from your real history. You choose what to send. We never apply for you.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/signup" className="btn bg-brass">Try it</Link>
          <Link href="/features" className="btn border border-line">See how it works</Link>
        </div>
        <ol className="mt-12 space-y-3">
          <li className="card px-4 py-3"><strong>1. Add your resume.</strong> A file or a sample is fine.</li>
          <li className="card px-4 py-3"><strong>2. Say what jobs you want.</strong> Any kind of work.</li>
          <li className="card px-4 py-3"><strong>3. Save one job.</strong> Then make a resume for that job.</li>
        </ol>
      </main>
      <SiteFooter />
    </>
  );
}
