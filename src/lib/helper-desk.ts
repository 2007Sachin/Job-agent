import type { BotDef } from "./workspace";

export type WorksOn = "auto" | "cloud" | "sandbox" | "local";
export type ScreenState = "idle" | "stopped" | "active";
export type Visibility = "only-me" | "invited";

export type HelperPrefs = {
  tone: string;
  visibility: Visibility;
  worksOn: WorksOn;
  screen: ScreenState;
  notify: boolean;
  approveEmail: boolean;
  approveApply: boolean;
};

export const PREF_DEFAULTS: HelperPrefs = {
  tone: "Plain and short. No hype.",
  visibility: "only-me",
  worksOn: "auto",
  screen: "idle",
  notify: true,
  approveEmail: true,
  approveApply: true,
};

export function prefsOf(bot: BotDef): HelperPrefs {
  const extra = bot as BotDef & Partial<HelperPrefs>;
  return {
    tone: extra.tone || PREF_DEFAULTS.tone,
    visibility: extra.visibility || PREF_DEFAULTS.visibility,
    worksOn: extra.worksOn || PREF_DEFAULTS.worksOn,
    screen: extra.screen || PREF_DEFAULTS.screen,
    notify: extra.notify ?? PREF_DEFAULTS.notify,
    approveEmail: extra.approveEmail ?? PREF_DEFAULTS.approveEmail,
    approveApply: extra.approveApply ?? PREF_DEFAULTS.approveApply,
  };
}

export function liveStatus(bot: BotDef) {
  const prefs = prefsOf(bot);
  if (prefs.screen === "stopped") return "Paused";
  if (prefs.screen === "active" && bot.skillIds.includes("skill-search")) return "Searching jobs…";
  if (prefs.screen === "active") return "Drafting…";
  return "Idle";
}

export const DRAWER_SECTIONS = [
  ["overview", "Overview"],
  ["identity", "Identity"],
  ["tone", "Personality"],
  ["skills", "Skills"],
  ["memory", "Memory"],
  ["files", "Library"],
  ["routines", "Routines"],
  ["apps", "Access"],
  ["model", "Model"],
  ["permissions", "Permissions"],
  ["alerts", "Voice and alerts"],
  ["visibility", "Who can see it"],
  ["history", "History"],
] as const;

export const WORKS_ON: { id: WorksOn; title: string; detail: string }[] = [
  { id: "auto", title: "Auto", detail: "Pick a free cloud model when a key exists." },
  { id: "cloud", title: "Cloud", detail: "Send the prompt to LLM_BASE_URL. No job site is opened." },
  { id: "sandbox", title: "Private sandbox", detail: "Draft in an isolated note. Nothing leaves this tab." },
  { id: "local", title: "This computer", detail: "Keep the draft here. Do not call a model provider." },
];

export type AppCard = {
  id: string;
  name: string;
  kind: "oauth" | "link";
  plain: string;
  scopes: string;
};

export const APP_CARDS: AppCard[] = [
  { id: "gmail", name: "Gmail", kind: "oauth", plain: "Send email you already approved, from your own account.", scopes: "Send mail. Read is not requested." },
  { id: "gcal", name: "Google Calendar", kind: "oauth", plain: "Read upcoming interviews so a helper can remind you.", scopes: "See events you choose. It cannot invite people." },
  { id: "gdrive", name: "Google Drive", kind: "oauth", plain: "Open a resume file you pick.", scopes: "Files you select. Not your whole drive." },
  { id: "notion", name: "Notion", kind: "oauth", plain: "Read a page you connect, such as a job tracker.", scopes: "Pages you share with the connection." },
  { id: "slack", name: "Slack", kind: "oauth", plain: "Post a draft in a channel only after you press Send.", scopes: "Post as you, when you confirm." },
  { id: "outlook", name: "Outlook", kind: "oauth", plain: "Same as Gmail, for a Microsoft mailbox.", scopes: "Send mail you approve." },
  { id: "github", name: "GitHub", kind: "oauth", plain: "Read public profile links you paste into a resume.", scopes: "Read your public profile. No repo writes." },
  { id: "linkedin", name: "LinkedIn", kind: "link", plain: "Opens in your tab. The extension saves a page only when you click.", scopes: "No sign-in stored. No automation." },
  { id: "naukri", name: "Naukri", kind: "link", plain: "Opens a search you built. We do not fetch the page.", scopes: "No stored password." },
];

export function withPrefs(bot: BotDef, patch: Partial<HelperPrefs>): BotDef {
  return { ...bot, ...prefsOf(bot), ...patch };
}
