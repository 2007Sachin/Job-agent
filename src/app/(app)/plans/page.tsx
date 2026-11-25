"use client";

export default function PlansPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl">Plans</h1>
      <p>No card is charged. This page only shows the free limits. A paid plan is not for sale yet.</p>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="card space-y-2 p-4">
          <h2 className="text-2xl">Free</h2>
          <p>What you can do now.</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Search public job lists and open other boards in your tab.</li>
            <li>Save jobs and keep a tracker.</li>
            <li>One resume draft per saved job, from your own facts.</li>
            <li>25 helper replies a day when a free model key is set.</li>
            <li>Email only after you approve each one.</li>
          </ul>
        </section>
        <section className="card space-y-2 p-4">
          <h2 className="text-2xl">Plus</h2>
          <p className="text-danger">Not for sale. No checkout.</p>
          <ul className="list-disc space-y-1 pl-5 text-muted">
            <li>Higher daily helper cap.</li>
            <li>Saved searches kept on your account.</li>
            <li>Still no LinkedIn automation and no auto-apply.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
