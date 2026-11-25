import { ProductStage } from "@/components/product-stage";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Find the role. You still press send.",
  description: "Job-agent searches free job boards in one place, writes a resume from your real history, and tracks follow-ups. It never applies for you and never touches LinkedIn. Free to start. India-first, any kind of job.",
  openGraph: {
    title: "Find the role. You still press send.",
    description: "One search, a resume that only uses your real history, and a tracker. You apply. Job-agent does not.",
    type: "website",
  },
};

const steps = [
  ["Add your real history", "A resume file or a few lines you actually did. The draft will not invent a job, a degree, or a certificate."],
  ["Search once", "Live listings from public boards in one results list. Any kind of work, not only tech. You open the company page yourself."],
  ["Tailor, save, follow up", "A resume fitted to that listing, a Chrome click-to-save, and a reminder. Email goes out only after you approve it."],
];

const features = [
  ["Many boards, one search", "Public sources in a single query. You see which source answered. No board account required to look."],
  ["A resume that stays true", "Each listing gets a draft built from your history. Lines that were not yours are left out."],
  ["Helpers in chat", "Ask for roles, a rewrite, or a follow-up. The helper drafts. You decide what is kept."],
  ["Save from any job page", "The Chrome extension saves the listing you are already reading. It does not click apply."],
  ["A tracker with follow-ups", "Saved roles, stages, and a date to write back. The reminder is a draft until you send it."],
  ["Free to start", "Create an account when you want one. Or open the demo on this device with no sign-up."],
];

const never = [
  ["No auto-apply", "Job-agent does not submit applications, fill employer forms, or click apply."],
  ["No LinkedIn automation", "It can draft a note you copy. It does not connect, message, or scrape LinkedIn."],
  ["Your data stays yours", "The demo stays in this browser. With an account, your records are yours to export or delete."],
];

const compare = [
  ["Where you look", "A new tab for every board", "One search across public sources"],
  ["The resume", "Rewrite it for each listing", "A draft from your real history"],
  ["Saving a role", "Copy the link into a sheet", "Click to save in Chrome"],
  ["Follow-ups", "A date you might forget", "A draft reminder you approve"],
  ["Who applies", "You, if you remember", "You. Always you."],
];

const faqs = [
  ["Does it apply for me?", "No. You open the employer page and submit. Drafts stay editable."],
  ["Will it use LinkedIn?", "No. It does not log in, scrape, or send messages there."],
  ["Can it invent experience?", "No. The resume draft is limited to history you provided."],
  ["Which jobs?", "Any. The role is free text: nursing, teaching, sales, design, trades, or software."],
  ["Do I have to sign up to look?", "No. Try the demo on this device. An account is there when you want your work kept."],
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">India-first · any kind of job</p>
            <h1 className="mt-3 max-w-[16ch] text-5xl sm:text-6xl">Find the role. Fit the resume to your real history. You still press send.</h1>
            <p className="mt-5 max-w-[48ch] text-lg text-muted">
              Job-agent searches free job boards in one place, drafts a resume that only uses work you actually did, and keeps the follow-ups. It never applies for you.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className="btn bg-brass text-center">Start free</Link>
              <Link href="/login" className="btn border border-line text-center">Try the demo, no sign-up</Link>
            </div>
            <p className="mt-4 text-sm text-muted">Free to start. The demo stays on this device.</p>
          </div>
          <ProductStage />
        </section>

        <section className="mx-auto max-w-6xl px-5 py-8" aria-labelledby="problem">
          <h2 id="problem" className="max-w-[18ch] text-4xl">The hunt is a pile of tabs and one tired resume.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <article className="card p-5"><h3 className="text-2xl">Ten boards</h3><p className="mt-2 text-muted">The same search, typed again, with no memory of what you already opened.</p></article>
            <article className="card p-5"><h3 className="text-2xl">One resume</h3><p className="mt-2 text-muted">Rewritten late at night, and easy to stretch into work you did not do.</p></article>
            <article className="card p-5"><h3 className="text-2xl">A forgotten follow-up</h3><p className="mt-2 text-muted">The role you cared about sits in a chat thread until the date has passed.</p></article>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-12" aria-labelledby="how">
          <h2 id="how" className="text-4xl">How it works</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map(([title, body], i) => (
              <li key={title} className="card p-5">
                <p className="text-sm font-semibold text-[var(--accent)]">Step {i + 1}</p>
                <h3 className="mt-2 text-2xl">{title}</h3>
                <p className="mt-2 text-muted">{body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-8" aria-labelledby="features">
          <h2 id="features" className="text-4xl">What you get</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map(([title, body]) => (
              <article key={title} className="card p-5">
                <h3 className="text-2xl">{title}</h3>
                <p className="mt-2 text-muted">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-12" aria-labelledby="never">
          <h2 id="never" className="text-4xl">What we never do</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {never.map(([title, body]) => (
              <article key={title} className="card p-5">
                <h3 className="text-2xl">{title}</h3>
                <p className="mt-2 text-muted">{body}</p>
              </article>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted">Built with public job feeds, Firebase Auth when you sign in, and a Chrome extension that only saves what you click.</p>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-8" aria-labelledby="compare">
          <h2 id="compare" className="text-4xl">Against doing it by hand</h2>
          <div className="card mt-8 overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <caption className="sr-only">Manual job hunt compared with Job-agent</caption>
              <thead>
                <tr className="border-b border-line">
                  <th className="px-4 py-3 font-semibold"> </th>
                  <th className="px-4 py-3 font-semibold">By hand</th>
                  <th className="px-4 py-3 font-semibold">Job-agent</th>
                </tr>
              </thead>
              <tbody>
                {compare.map(([topic, hand, us]) => (
                  <tr key={topic} className="border-b border-line last:border-0">
                    <th className="px-4 py-3 font-semibold" scope="row">{topic}</th>
                    <td className="px-4 py-3 text-muted">{hand}</td>
                    <td className="px-4 py-3">{us}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-5 py-12" aria-labelledby="faq">
          <h2 id="faq" className="text-4xl">Questions</h2>
          <div className="mt-6 divide-y divide-line border-y border-line">
            {faqs.map(([q, a]) => (
              <details key={q} className="py-4">
                <summary className="cursor-pointer text-lg">{q}</summary>
                <p className="mt-2 text-muted">{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-16">
          <div className="card px-6 py-10 text-center sm:px-10">
            <h2 className="text-4xl">Start with the search. Keep the send button.</h2>
            <p className="mx-auto mt-3 max-w-[46ch] text-muted">Free to start. Look around in the demo first if you would rather not make an account yet.</p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/signup" className="btn bg-brass">Start free</Link>
              <Link href="/login" className="btn border border-line">Try the demo, no sign-up</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
