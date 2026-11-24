import { planTurn } from "@/lib/chat-plan";
import { filterCatalog } from "@/lib/catalog";
import { connectors } from "@/lib/connectors";
import { clientKey } from "@/lib/job-sources";
import { scoreMatch } from "@/lib/match";
import { enforceDailyCap } from "@/lib/rate-limit";
import { templateCover, templateEmail, templateLinkedIn, templateResume } from "@/lib/templates";
import type { Job, Profile } from "@/lib/types";
import type { BotDef, SkillDef } from "@/lib/workspace";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Body = {
  text?: string;
  bot?: BotDef;
  bots?: BotDef[];
  skills?: SkillDef[];
  profile?: Profile;
  attachment?: string;
};

function toolText(name: string, profile: Profile, query: string, attachment: string): { detail: string; draft: string } {
  const job = syntheticJob(query, attachment);
  if (name === "search_jobs") {
    const hits = filterCatalog(query, profile.locations[0] ?? "").slice(0, 4);
    const lines = (hits.length ? hits : filterCatalog("", "").slice(0, 3))
      .map((h) => `${h.title} · ${h.company} · ${h.location} · ${h.source}`)
      .join("\n");
    return { detail: "Catalog matches (live boards are searched from the Jobs page).", draft: lines };
  }
  if (name === "score_job") {
    const match = scoreMatch(profile, job);
    return { detail: `${match.score} match`, draft: match.reasons.join("\n") };
  }
  if (name === "tailor_resume") return { detail: "Resume draft", draft: templateResume(profile, job) };
  if (name === "cover_letter") return { detail: "Cover letter", draft: templateCover(profile, job) };
  if (name === "linkedin_note") return { detail: "Copy this into LinkedIn yourself", draft: templateLinkedIn(profile, job) };
  if (name === "cold_email") {
    const email = templateEmail(profile, job);
    return { detail: "Email draft. Nothing is sent until you approve and send from the job desk.", draft: `Subject: ${email.subject}\n\n${email.body}` };
  }
  if (name === "save_job") return { detail: "Save this role on your tracker?", draft: `${job.title} at ${job.company}` };
  if (name === "interview_prep") {
    return {
      detail: "One practice question",
      draft: `For ${job.title}: tell me about a time you handled the hardest part of this kind of work. Use a real example from your resume. I will not invent one for you.`,
    };
  }
  const rows = connectors({}).filter((c) => query.toLowerCase().includes(c.id) || query.toLowerCase().includes(c.name.toLowerCase()));
  const list = (rows.length ? rows : connectors({}).slice(0, 4))
    .map((c) => `${c.name}: ${c.mode}. ${c.status}. ${c.note}`)
    .join("\n");
  return { detail: "Connector status", draft: list };
}

function syntheticJob(query: string, attachment: string): Job {
  const title = query.split("\n")[0].slice(0, 80) || "Role from chat";
  return {
    id: "chat-job",
    title,
    company: "the employer in your note",
    location: "your preferred location",
    source: attachment ? "Attachment" : "Chat",
    url: "",
    description: attachment || query,
    postedAt: new Date().toISOString().slice(0, 10),
  };
}

export async function POST(request: Request) {
  const limit = enforceDailyCap(`chat:${clientKey(request)}`);
  if (!limit.ok) return NextResponse.json({ error: "Daily chat cap reached." }, { status: 429 });
  const body = (await request.json()) as Body;
  if (!body.text || !body.bot || !body.profile) {
    return NextResponse.json({ error: "Missing message." }, { status: 400 });
  }
  const plan = planTurn(body.text, body.bot, body.bots ?? [body.bot], body.skills ?? []);
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };
      const chunks = plan.preface.split(/(\s+)/);
      for (const chunk of chunks) {
        send("token", { text: chunk });
      }
      for (const tool of plan.tools) {
        const built = toolText(tool.name, body.profile!, tool.query, body.attachment ?? "");
        send("tool", {
          name: tool.name,
          needsApproval: tool.needsApproval,
          detail: built.detail,
          draft: built.draft,
          botId: plan.bot.id,
        });
      }
      send("done", { botId: plan.bot.id, handoffFrom: plan.handoffFrom });
      controller.close();
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  });
}
