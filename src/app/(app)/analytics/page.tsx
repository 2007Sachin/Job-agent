"use client";

import { useStore } from "@/lib/store";
import { STAGES } from "@/lib/types";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function AnalyticsPage() {
  const { applications, outreach } = useStore();
  const byWeek = new Map<string, number>();
  for (const app of applications) {
    const day = (app.appliedAt || app.updatedAt).slice(0, 10);
    const date = new Date(day);
    const monday = new Date(date);
    monday.setDate(date.getDate() - ((date.getDay() + 6) % 7));
    const key = monday.toISOString().slice(0, 10);
    byWeek.set(key, (byWeek.get(key) ?? 0) + (app.stage === "saved" ? 0 : 1));
  }
  const weekData = [...byWeek.entries()].map(([week, count]) => ({ week, count }));
  const funnel = STAGES.map((stage) => ({
    stage,
    count: applications.filter((a) => a.stage === stage).length,
  }));
  const sources = new Map<string, number>();
  for (const app of applications) sources.set(app.job.source, (sources.get(app.job.source) ?? 0) + 1);
  const sourceData = [...sources.entries()].map(([source, count]) => ({ source, count }));
  const sent = outreach.filter((o) => o.sentAt || o.status === "sent" || o.status === "opened" || o.status === "replied");
  const replied = outreach.filter((o) => o.status === "replied").length;
  const opened = outreach.filter((o) => o.status === "opened" || o.status === "replied").length;
  const responded = applications.filter((a) => a.stage === "interviewing" || a.stage === "offer").length;
  const applied = applications.filter((a) => a.stage !== "saved").length;
  const responseRate = applied ? Math.round((responded / applied) * 100) : 0;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-5xl">Analytics</h1>
        <p className="mt-2 max-w-[62ch] text-muted">Counts come from the tracker on this device. Email open and reply are what you mark. There is no tracking pixel.</p>
      </div>
      <dl className="grid gap-6 sm:grid-cols-3">
        <div>
          <dt className="text-sm text-muted">Response rate</dt>
          <dd className="font-display text-5xl">{responseRate}%</dd>
          <p className="text-sm text-muted">Interview or offer, among roles past saved.</p>
        </div>
        <div>
          <dt className="text-sm text-muted">Emails sent</dt>
          <dd className="font-display text-5xl">{sent.length}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Marked opened / replied</dt>
          <dd className="font-display text-5xl">{opened} / {replied}</dd>
        </div>
      </dl>
      <Chart title="Applications by week" data={weekData} x="week" y="count" empty="Move a role to Applied to start this chart." />
      <Chart title="Funnel" data={funnel} x="stage" y="count" empty="Save a role to see the funnel." />
      <Chart title="Sources" data={sourceData} x="source" y="count" empty="Saved roles record where they came from." />
    </div>
  );
}

function Chart({ title, data, x, y, empty }: { title: string; data: object[]; x: string; y: string; empty: string }) {
  return (
    <section>
      <h2 className="text-3xl">{title}</h2>
      {data.length === 0 ? <p className="mt-3 text-sm text-muted">{empty}</p> : (
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid stroke="var(--line)" vertical={false} />
              <XAxis dataKey={x} stroke="var(--muted)" fontSize={12} />
              <YAxis allowDecimals={false} stroke="var(--muted)" fontSize={12} />
              <Tooltip />
              <Bar dataKey={y} fill="var(--brass)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
