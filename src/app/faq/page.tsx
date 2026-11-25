import { SiteFooter, SiteHeader } from "@/components/site-header";

const faqs = [
  ["Which jobs does this cover?", "Any. Target roles are free text. Search is not limited to product, engineering, or campus listings."],
  ["Do you apply on my behalf?", "No. You open the employer link and submit. Drafts stay editable. Email sends only after you approve that message and have recorded consent."],
  ["Will it message recruiters on LinkedIn?", "It writes a note you can copy. It can open LinkedIn. It does not click, connect, or send."],
  ["Where does my data live?", "In this browser until you connect Firebase. With Firebase, your Firestore documents are readable only by you. Settings can export or delete them. That export is there for the Digital Personal Data Protection Act, not as legal advice."],
  ["Which model?", "Any OpenAI-compatible endpoint you put in environment variables. Gemini, Groq, and NVIDIA NIM are the intended free options. Keys are never written into the repo."],
];

export default function FaqPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="text-5xl">Questions</h1>
        <div className="mt-8 divide-y divide-line border-y border-line">
          {faqs.map(([q, a]) => (
            <details key={q} className="py-4">
              <summary className="cursor-pointer text-lg">{q}</summary>
              <p className="mt-2 max-w-[65ch] text-muted">{a}</p>
            </details>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
