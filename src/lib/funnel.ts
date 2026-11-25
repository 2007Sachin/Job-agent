import type { Application } from "./types";

export function funnelCounts(applications: Application[]) {
  const saved = applications.length;
  const applied = applications.filter((a) => a.stage === "applied" || a.stage === "interviewing" || a.stage === "offer" || a.stage === "rejected").length;
  const interview = applications.filter((a) => a.stage === "interviewing" || a.stage === "offer").length;
  const offer = applications.filter((a) => a.stage === "offer").length;
  return [
    { id: "saved", label: "Saved", count: saved },
    { id: "applied", label: "Applied", count: applied },
    { id: "interview", label: "Interview", count: interview },
    { id: "offer", label: "Offer", count: offer },
  ];
}
