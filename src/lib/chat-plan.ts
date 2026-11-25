import { allowedTools, type BotDef, type SkillDef, type ToolName } from "./workspace";

export function routeRoom(text: string, bots: BotDef[]): { speakerIds: string[]; handoff: string } {
  const active = bots.filter((b) => b.enabled !== false && b.id !== "bot-relay");
  const mentioned = active.filter((b) => text.toLowerCase().includes(`@${b.name.toLowerCase()}`));
  const speakers = (mentioned.length ? mentioned : active.slice(0, 2)).slice(0, 3);
  const names = speakers.map((b) => b.name).join(", then ");
  return {
    speakerIds: speakers.map((b) => b.id),
    handoff: mentioned.length ? `Relay hands this to ${names}.` : `Relay routes the room to ${names || "no enabled bots"}.`,
  };
}

export type PlannedTool = {
  name: ToolName;
  needsApproval: boolean;
  query: string;
};

export type TurnPlan = {
  bot: BotDef;
  handoffFrom: string | null;
  preface: string;
  tools: PlannedTool[];
};

const APPROVAL = new Set<ToolName>(["cold_email", "save_job"]);

export function findMentionedBot(text: string, bots: BotDef[], currentId: string): BotDef | null {
  const low = text.toLowerCase();
  return bots
    .filter((b) => b.id !== currentId)
    .sort((a, b) => b.name.length - a.name.length)
    .find((b) => low.includes(`@${b.name.toLowerCase()}`)) ?? null;
}

export function planTurn(text: string, bot: BotDef, bots: BotDef[], skills: SkillDef[]): TurnPlan {
  const mentioned = findMentionedBot(text, bots, bot.id);
  const active = mentioned ?? bot;
  const allow = allowedTools(active, skills);
  const q = text.replace(new RegExp(`@${active.name}`, "i"), "").trim();
  const low = q.toLowerCase();
  const tools: PlannedTool[] = [];

  const want = (name: ToolName, test: boolean) => {
    if (test && allow.has(name)) tools.push({ name, needsApproval: APPROVAL.has(name), query: q });
  };

  want("search_jobs", /find|search|job|opening|role/.test(low));
  want("score_job", /match|score|fit/.test(low));
  want("tailor_resume", /resume|tailor|cv/.test(low));
  want("cover_letter", /cover/.test(low));
  want("linkedin_note", /linkedin|note/.test(low));
  want("cold_email", /email|mail|recruiter/.test(low));
  want("save_job", /save|track/.test(low));
  want("interview_prep", /interview|practice|question/.test(low));
  want("connector_help", /naukri|linkedin|indeed|instahyre|hirist|cutshort|wellfound|foundit|connector/.test(low));

  if (!tools.length && allow.has("search_jobs")) {
    tools.push({ name: "search_jobs", needsApproval: false, query: q });
  }
  if (!tools.length && allow.has("interview_prep")) {
    tools.push({ name: "interview_prep", needsApproval: false, query: q });
  }
  if (!tools.length && allow.has("tailor_resume")) {
    tools.push({ name: "tailor_resume", needsApproval: false, query: q });
  }

  const preface = mentioned
    ? `${bot.name} is handing this to ${active.name}.`
    : `${active.name} is on it.`;

  return { bot: active, handoffFrom: mentioned ? bot.name : null, preface, tools: tools.slice(0, 3) };
}
