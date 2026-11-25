import { SiteFooter, SiteHeader } from "@/components/site-header";

export default function PricingPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-5 py-16">
        <h1 className="text-5xl">Pricing, not finished</h1>
        <p className="mt-4 max-w-[60ch] text-muted">
          The product runs today on your own free-tier model key. These numbers are a placeholder so the page exists. Nothing is billed.
        </p>
        <table className="mt-10 w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line">
              <th className="py-3 font-medium"> </th>
              <th className="py-3 font-medium">Desk</th>
              <th className="py-3 font-medium">Practice</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Price", "₹0 while in preview", "To be decided"],
              ["Accounts", "One seeker", "A counsellor and their seekers"],
              ["Drafts", "Your LLM daily cap", "Shared cap"],
              ["Email", "Your Gmail or SMTP", "Same, still per message approval"],
            ].map((row) => (
              <tr key={row[0]} className="border-b border-line">
                {row.map((cell) => (
                  <td key={cell} className="py-3 pr-4 align-top">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </main>
      <SiteFooter />
    </>
  );
}
