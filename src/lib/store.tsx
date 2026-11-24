"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getBrowserSupabase } from "./supabase/browser";
import {
  emptyProfile,
  type Application,
  type AppState,
  type Job,
  type Outreach,
  type Profile,
  type SessionUser,
  type Stage,
} from "./types";
import { BUILTIN_BOTS, BUILTIN_SKILLS, type BotDef, type ChatMessage, type SkillDef } from "./workspace";

const KEY = "jobagent.v2";

const initial: AppState = {
  user: null,
  profile: emptyProfile(),
  applications: [],
  outreach: [],
  feed: [],
  syncNote: null,
  bots: BUILTIN_BOTS,
  skills: BUILTIN_SKILLS,
  conversations: [],
  messages: [],
};

function uid() {
  return crypto.randomUUID();
}

async function persistWorkspace(s: AppState) {
  const sb = getBrowserSupabase();
  if (!sb || s.user?.mode !== "supabase") return;
  const user_id = s.user.id;
  const now = new Date().toISOString();
  for (const bot of s.bots.filter((b) => !b.builtin)) {
    await sb.from("bots").upsert({ id: bot.id, user_id, payload: bot, updated_at: now });
  }
  for (const skill of s.skills.filter((sk) => !sk.builtin)) {
    await sb.from("skills").upsert({ id: skill.id, user_id, payload: skill, updated_at: now });
  }
  for (const conversation of s.conversations) {
    await sb.from("conversations").upsert({
      id: conversation.id,
      user_id,
      bot_id: conversation.botId,
      title: conversation.title,
      updated_at: conversation.updatedAt,
    });
  }
  for (const message of s.messages.slice(-30)) {
    await sb.from("messages").upsert({
      id: message.id,
      user_id,
      conversation_id: message.conversationId,
      payload: message,
      created_at: message.createdAt,
    });
  }
}

function scopeToUser(s: AppState, user: SessionUser): AppState {
  if (s.user?.id === user.id) {
    return { ...s, user, profile: { ...s.profile, email: s.profile.email || user.email } };
  }
  return {
    ...initial,
    user,
    profile: { ...emptyProfile(), email: user.email },
    syncNote: null,
  };
}

function mergeSkills(saved: SkillDef[]): SkillDef[] {
  const custom = saved.filter((s) => !BUILTIN_SKILLS.some((b) => b.id === s.id));
  return [...BUILTIN_SKILLS, ...custom];
}

type Store = AppState & {
  ready: boolean;
  signInDemo: (email?: string) => void;
  signOut: () => Promise<void>;
  adoptSupabaseUser: (id: string, email: string) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  completeOnboarding: (patch: Partial<Profile>) => void;
  setFeed: (jobs: Job[]) => void;
  saveJob: (job: Job) => Application;
  setStage: (id: string, stage: Stage) => void;
  patchApplication: (id: string, patch: Partial<Application>) => void;
  addOutreach: (item: Omit<Outreach, "id">) => Outreach;
  patchOutreach: (id: string, patch: Partial<Outreach>) => void;
  replaceAll: (next: AppState) => void;
  wipeLocal: () => void;
  saveBot: (bot: BotDef) => void;
  deleteBot: (id: string) => void;
  saveSkill: (skill: SkillDef) => void;
  deleteSkill: (id: string) => void;
  addMessage: (message: ChatMessage) => void;
  patchTool: (messageId: string, toolId: string, patch: Partial<ChatMessage["tools"][number]>) => void;
  ensureConversation: (botId: string) => string;
};

const Ctx = createContext<Store | null>(null);

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY) || localStorage.getItem("jobagent.v1");
    if (!raw) return initial;
    const parsed = JSON.parse(raw) as AppState;
    return {
      ...initial,
      ...parsed,
      profile: { ...emptyProfile(), ...parsed.profile },
      bots: parsed.bots?.length ? parsed.bots : BUILTIN_BOTS,
      skills: parsed.skills?.length ? mergeSkills(parsed.skills) : BUILTIN_SKILLS,
      conversations: parsed.conversations ?? [],
      messages: parsed.messages ?? [],
    };
  } catch {
    return initial;
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initial);
  const [ready, setReady] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  const commit = useCallback((recipe: (prev: AppState) => AppState) => {
    const next = recipe(stateRef.current);
    stateRef.current = next;
    setState(next);
    void persistWorkspace(next);
    return next;
  }, []);

  useEffect(() => {
    setState(load());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, ready]);

  useEffect(() => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      if (u) {
        setState((s) => scopeToUser(s, { id: u.id, email: u.email ?? "", mode: "supabase" }));
        void pullRemote(u.id);
      }
    });
  }, []);

  async function pullRemote(userId: string) {
    const sb = getBrowserSupabase();
    if (!sb) return;
    const [profileRes, botsRes, skillsRes, convRes, msgRes] = await Promise.all([
      sb.from("profiles").select("*").eq("id", userId).maybeSingle(),
      sb.from("bots").select("*").eq("user_id", userId),
      sb.from("skills").select("*").eq("user_id", userId),
      sb.from("conversations").select("*").eq("user_id", userId),
      sb.from("messages").select("*").eq("user_id", userId),
    ]);
    if (profileRes.error && botsRes.error) {
      setState((s) => s.user?.id === userId ? { ...s, syncNote: "Signed in. Profile sync is waiting on the Supabase tables (see the migration)." } : s);
      return;
    }
    const data = profileRes.data;
    setState((s) => {
      if (s.user?.id !== userId) return s;
      const customBots = (botsRes.data ?? []).map((row) => row.payload as BotDef).filter((b) => b && !b.builtin);
      const customSkills = (skillsRes.data ?? []).map((row) => row.payload as SkillDef).filter((sk) => sk && !sk.builtin);
      const conversations = (convRes.data ?? []).map((row) => ({
        id: row.id as string,
        title: (row.title as string) || "Chat",
        botId: row.bot_id as string,
        updatedAt: (row.updated_at as string) || new Date().toISOString(),
      }));
      const messages = (msgRes.data ?? []).map((row) => row.payload as ChatMessage).filter(Boolean);
      return {
        ...s,
        syncNote: null,
        profile: data
          ? {
              ...s.profile,
              fullName: data.full_name ?? "",
              email: data.email ?? s.profile.email,
              onboarded: Boolean(data.onboarded),
              targetRoles: data.target_roles ?? [],
              locations: data.locations ?? [],
              salaryMinLpa: data.salary_min_lpa,
              salaryMaxLpa: data.salary_max_lpa,
              experienceYears: data.experience_years,
              skills: data.skills ?? [],
              linkedinUrl: data.linkedin_url ?? "",
              preferences: data.preferences ?? "",
              resumeText: data.resume_text ?? "",
              resumeFileName: data.resume_file_name ?? "",
              emailConsent: Boolean(data.email_consent),
              consentAt: data.consent_at,
              smtpHost: data.smtp_host ?? "",
              smtpPort: data.smtp_port ?? "587",
              smtpUser: data.smtp_user ?? "",
              smtpFrom: data.smtp_from ?? "",
            }
          : s.profile,
        bots: customBots.length ? [...BUILTIN_BOTS, ...customBots] : s.bots,
        skills: customSkills.length ? mergeSkills([...BUILTIN_SKILLS, ...customSkills]) : s.skills,
        conversations: conversations.length ? conversations : s.conversations,
        messages: messages.length ? messages : s.messages,
      };
    });
  }

  const pushProfile = useCallback(async (profile: Profile, userId: string) => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    const { error } = await sb.from("profiles").upsert({
      id: userId,
      email: profile.email,
      full_name: profile.fullName,
      onboarded: profile.onboarded,
      target_roles: profile.targetRoles,
      locations: profile.locations,
      salary_min_lpa: profile.salaryMinLpa,
      salary_max_lpa: profile.salaryMaxLpa,
      experience_years: profile.experienceYears,
      skills: profile.skills,
      linkedin_url: profile.linkedinUrl,
      preferences: profile.preferences,
      resume_text: profile.resumeText,
      resume_file_name: profile.resumeFileName,
      email_consent: profile.emailConsent,
      consent_at: profile.consentAt,
      smtp_host: profile.smtpHost,
      smtp_port: profile.smtpPort,
      smtp_user: profile.smtpUser,
      smtp_from: profile.smtpFrom,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      setState((s) => ({ ...s, syncNote: "Profile saved on this device. Supabase rejected the write." }));
    }
  }, []);

  const signInDemo = useCallback((email?: string) => {
    const addr = email?.trim() || "demo@jobagent.local";
    setState((s) => ({
      ...scopeToUser(s, { id: "demo", email: addr, mode: "demo" }),
      syncNote: "Demo mode keeps data in this browser only.",
    }));
  }, []);

  const signOut = useCallback(async () => {
    const sb = getBrowserSupabase();
    if (sb) await sb.auth.signOut();
    setState((s) => ({ ...s, user: null }));
  }, []);

  const adoptSupabaseUser = useCallback((id: string, email: string) => {
    setState((s) => scopeToUser(s, { id, email, mode: "supabase" }));
    void pullRemote(id);
  }, []);

  const updateProfile = useCallback((patch: Partial<Profile>) => {
    setState((s) => {
      const profile = { ...s.profile, ...patch };
      if (s.user?.mode === "supabase") void pushProfile(profile, s.user.id);
      return { ...s, profile };
    });
  }, [pushProfile]);

  const completeOnboarding = useCallback((patch: Partial<Profile>) => {
    updateProfile({ ...patch, onboarded: true });
  }, [updateProfile]);

  const setFeed = useCallback((jobs: Job[]) => setState((s) => ({ ...s, feed: jobs })), []);

  const saveJob = useCallback((job: Job) => {
    const existing = stateRef.current.applications.find((a) => a.job.id === job.id);
    if (existing) return existing;
    const application: Application = {
      id: uid(),
      job,
      stage: "saved",
      notes: "",
      tailoredResume: "",
      coverLetter: "",
      linkedinNote: "",
      recruiterEmail: "",
      appliedAt: null,
      updatedAt: new Date().toISOString(),
    };
    commit((s) => ({ ...s, applications: [application, ...s.applications] }));
    return application;
  }, [commit]);

  const setStage = useCallback((id: string, stage: Stage) => {
    setState((s) => ({
      ...s,
      applications: s.applications.map((a) =>
        a.id === id
          ? {
              ...a,
              stage,
              updatedAt: new Date().toISOString(),
              appliedAt: stage === "applied" && !a.appliedAt ? new Date().toISOString() : a.appliedAt,
            }
          : a,
      ),
    }));
  }, []);

  const patchApplication = useCallback((id: string, patch: Partial<Application>) => {
    commit((s) => ({
      ...s,
      applications: s.applications.map((a) =>
        a.id === id ? { ...a, ...patch, updatedAt: new Date().toISOString() } : a,
      ),
    }));
  }, [commit]);

  const addOutreach = useCallback((item: Omit<Outreach, "id">) => {
    const row: Outreach = { ...item, id: uid() };
    setState((s) => ({ ...s, outreach: [row, ...s.outreach] }));
    return row;
  }, []);

  const patchOutreach = useCallback((id: string, patch: Partial<Outreach>) => {
    setState((s) => ({
      ...s,
      outreach: s.outreach.map((o) => (o.id === id ? { ...o, ...patch } : o)),
    }));
  }, []);

  const saveBot = useCallback((bot: BotDef) => {
    commit((s) => ({
      ...s,
      bots: s.bots.some((b) => b.id === bot.id) ? s.bots.map((b) => (b.id === bot.id ? bot : b)) : [...s.bots, bot],
    }));
  }, [commit]);

  const deleteBot = useCallback((id: string) => {
    commit((s) => ({ ...s, bots: s.bots.filter((b) => b.id !== id || b.builtin) }));
  }, [commit]);

  const saveSkill = useCallback((skill: SkillDef) => {
    commit((s) => ({
      ...s,
      skills: s.skills.some((sk) => sk.id === skill.id)
        ? s.skills.map((sk) => (sk.id === skill.id ? skill : sk))
        : [...s.skills, skill],
    }));
  }, [commit]);

  const deleteSkill = useCallback((id: string) => {
    commit((s) => ({ ...s, skills: s.skills.filter((sk) => sk.id !== id || sk.builtin) }));
  }, [commit]);

  const ensureConversation = useCallback((botId: string) => {
    const existing = stateRef.current.conversations.find((c) => c.botId === botId);
    if (existing) return existing.id;
    const id = uid();
    const bot = stateRef.current.bots.find((b) => b.id === botId);
    commit((s) => ({
      ...s,
      conversations: [{ id, title: bot?.name ?? "Chat", botId, updatedAt: new Date().toISOString() }, ...s.conversations],
    }));
    return id;
  }, [commit]);

  const addMessage = useCallback((message: ChatMessage) => {
    commit((s) => ({
      ...s,
      messages: [...s.messages, message],
      conversations: s.conversations.map((c) =>
        c.id === message.conversationId ? { ...c, updatedAt: message.createdAt } : c,
      ),
    }));
  }, [commit]);

  const patchTool = useCallback((messageId: string, toolId: string, patch: Partial<ChatMessage["tools"][number]>) => {
    commit((s) => ({
      ...s,
      messages: s.messages.map((m) =>
        m.id === messageId ? { ...m, tools: m.tools.map((t) => (t.id === toolId ? { ...t, ...patch } : t)) } : m,
      ),
    }));
  }, [commit]);

  const replaceAll = useCallback((next: AppState) => setState(next), []);
  const wipeLocal = useCallback(() => {
    const user = state.user;
    setState({ ...initial, user, profile: { ...emptyProfile(), email: user?.email ?? "" } });
  }, [state.user]);

  const value = useMemo<Store>(
    () => ({
      ...state,
      ready,
      signInDemo,
      signOut,
      adoptSupabaseUser,
      updateProfile,
      completeOnboarding,
      setFeed,
      saveJob,
      setStage,
      patchApplication,
      addOutreach,
      patchOutreach,
      replaceAll,
      wipeLocal,
      saveBot,
      deleteBot,
      saveSkill,
      deleteSkill,
      addMessage,
      patchTool,
      ensureConversation,
    }),
    [
      state,
      ready,
      signInDemo,
      signOut,
      adoptSupabaseUser,
      updateProfile,
      completeOnboarding,
      setFeed,
      saveJob,
      setStage,
      patchApplication,
      addOutreach,
      patchOutreach,
      replaceAll,
      wipeLocal,
      saveBot,
      deleteBot,
      saveSkill,
      deleteSkill,
      addMessage,
      patchTool,
      ensureConversation,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore outside provider");
  return ctx;
}
