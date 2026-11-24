export type SkillDef = {
  id: string;
  name: string;
  description: string;
  instructions: string;
  tools: string[];
  builtin: boolean;
};

export type BotDef = {
  id: string;
  name: string;
  avatar: string;
  role: string;
  systemPrompt: string;
  model: string;
  skillIds: string[];
  connectorIds: string[];
  builtin: boolean;
  temperature?: number;
  enabled?: boolean;
};

export type Room = { id: string; name: string; instructions: string; botIds: string[]; updatedAt: string };
export type RoomMessage = { id: string; roomId: string; role: "user" | "assistant"; botId: string; content: string; createdAt: string };
export type DeskTask = { id: string; title: string; status: "todo" | "doing" | "done"; botId: string; updatedAt: string };
export type Schedule = { id: string; name: string; botId: string; prompt: string; time: string; enabled: boolean; lastRun: string | null };
export type MemoryFact = { id: string; botId: string; text: string; updatedAt: string };
export type LibraryItem = { id: string; name: string; kind: string; body: string; createdAt: string };
export type ActivityItem = { id: string; text: string; createdAt: string };
export type UsageRow = { botId: string; model: string; count: number };

export const BOT_TEMPLATES: Omit<BotDef, "id" | "builtin">[] = [
  {
    name: "Offer reader",
    avatar: "offer",
    role: "Compares an offer with the pay and constraints already on the profile.",
    systemPrompt: "Read only the offer text the person pastes. Do not invent equity or benefits.",
    model: "Groq",
    skillIds: ["skill-match"],
    connectorIds: [],
    temperature: 0.2,
    enabled: true,
  },
  {
    name: "Follow-up clerk",
    avatar: "follow",
    role: "Drafts a short follow-up the person still has to approve before it sends.",
    systemPrompt: "Write one follow-up. Never send it.",
    model: "Gemini",
    skillIds: ["skill-outreach"],
    connectorIds: [],
    temperature: 0.4,
    enabled: true,
  },
  {
    name: "Portfolio editor",
    avatar: "portfolio",
    role: "Helps describe shipped work for any craft, from kitchens to code.",
    systemPrompt: "Ask for a real project. Do not embellish the outcome.",
    model: "NVIDIA",
    skillIds: ["skill-resume", "skill-interview"],
    connectorIds: [],
    temperature: 0.5,
    enabled: true,
  },
];

export type ToolCard = {
  id: string;
  name: string;
  detail: string;
  draft: string;
  status: "complete" | "needs_approval" | "approved" | "rejected" | "edited";
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  botId: string;
  content: string;
  tools: ToolCard[];
  attachmentName?: string;
  createdAt: string;
};

export type Conversation = {
  id: string;
  title: string;
  botId: string;
  updatedAt: string;
};

export const TOOL_NAMES = [
  "search_jobs",
  "score_job",
  "tailor_resume",
  "cover_letter",
  "linkedin_note",
  "cold_email",
  "save_job",
  "interview_prep",
  "connector_help",
] as const;

export type ToolName = (typeof TOOL_NAMES)[number];

export const BUILTIN_SKILLS: SkillDef[] = [
  {
    id: "skill-search",
    name: "Job search",
    description: "Look up roles from permitted sources and the local catalog.",
    instructions: "Search with the seeker's words. Do not scrape. Say which source each hit came from.",
    tools: ["search_jobs", "connector_help"],
    builtin: true,
  },
  {
    id: "skill-match",
    name: "Match score",
    description: "Compare a posting with the seeker's profile.",
    instructions: "Explain the score in plain language. Never treat it as a hiring decision.",
    tools: ["score_job"],
    builtin: true,
  },
  {
    id: "skill-resume",
    name: "Resume tailoring",
    description: "Draft a resume variant from facts already on the profile.",
    instructions: "Do not invent employers, dates, or metrics.",
    tools: ["tailor_resume"],
    builtin: true,
  },
  {
    id: "skill-cover",
    name: "Cover letter",
    description: "Draft a cover letter for one posting.",
    instructions: "One specific job. Short. No filler claims.",
    tools: ["cover_letter"],
    builtin: true,
  },
  {
    id: "skill-outreach",
    name: "Outreach drafts",
    description: "LinkedIn notes and cold email the person sends themselves.",
    instructions: "Email stays a draft until the person approves it. Never automate LinkedIn.",
    tools: ["linkedin_note", "cold_email"],
    builtin: true,
  },
  {
    id: "skill-tracker",
    name: "Application tracker",
    description: "Save a role and talk through stages.",
    instructions: "Saving a role needs a yes. The person still submits the application.",
    tools: ["save_job"],
    builtin: true,
  },
  {
    id: "skill-interview",
    name: "Interview prep",
    description: "Practice questions for any function.",
    instructions: "Ask one question at a time. Use the job text if it was provided.",
    tools: ["interview_prep"],
    builtin: true,
  },
];

export const BUILTIN_BOTS: BotDef[] = [
  {
    id: "bot-scout",
    name: "Job Scout",
    avatar: "scout",
    role: "Finds roles from sources we are allowed to read.",
    systemPrompt: "You find jobs. You name the source. You hand off writing to other bots when asked.",
    model: "env:LLM_MODEL",
    skillIds: ["skill-search", "skill-match"],
    connectorIds: ["remotive", "adzuna", "greenhouse", "lever", "linkedin", "naukri", "indeed", "wellfound"],
    builtin: true,
  },
  {
    id: "bot-tailor",
    name: "Resume Tailor",
    avatar: "tailor",
    role: "Rewrites a resume for one posting using only real history.",
    systemPrompt: "You tailor resumes and cover letters. You never invent experience.",
    model: "env:LLM_MODEL",
    skillIds: ["skill-resume", "skill-cover", "skill-match"],
    connectorIds: [],
    builtin: true,
  },
  {
    id: "bot-outreach",
    name: "Outreach Writer",
    avatar: "outreach",
    role: "Drafts LinkedIn notes and cold email for the person to send.",
    systemPrompt: "You draft messages. You wait for approval before any email is treated as ready.",
    model: "env:LLM_MODEL",
    skillIds: ["skill-outreach"],
    connectorIds: ["linkedin"],
    builtin: true,
  },
  {
    id: "bot-coach",
    name: "Application Coach",
    avatar: "coach",
    role: "Keeps the tracker honest and the next step small.",
    systemPrompt: "You coach the application process. You do not apply on anyone's behalf.",
    model: "env:LLM_MODEL",
    skillIds: ["skill-tracker", "skill-match"],
    connectorIds: [],
    builtin: true,
  },
  {
    id: "bot-interview",
    name: "Interview Prep",
    avatar: "interview",
    role: "Runs practice for any role, from ward nurse to sales to engineering.",
    systemPrompt: "You prepare people for interviews in their own field. One question at a time.",
    model: "env:LLM_MODEL",
    skillIds: ["skill-interview"],
    connectorIds: [],
    builtin: true,
    temperature: 0.4,
    enabled: true,
  },
  {
    id: "bot-relay",
    name: "Relay",
    avatar: "relay",
    role: "Routes a room. Speaks the hand-off, then lets the other bots work.",
    systemPrompt: "You only route. You do not apply or send email.",
    model: "Gemini",
    skillIds: ["skill-search"],
    connectorIds: [],
    builtin: true,
    temperature: 0.2,
    enabled: true,
  },
];

export function allowedTools(bot: BotDef, skills: SkillDef[]): Set<string> {
  const set = new Set<string>();
  for (const id of bot.skillIds) {
    const skill = skills.find((s) => s.id === id);
    skill?.tools.forEach((t) => {
      if ((TOOL_NAMES as readonly string[]).includes(t)) set.add(t);
    });
  }
  return set;
}
