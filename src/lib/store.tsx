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
import { applicationFromRow, applicationRow, outreachFromRow, outreachRow } from "./remote-rows";
import { isHiddenTestFixture } from "./test-fixture";
import { clientAuth, clientDb } from "./firebase/browser";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
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
import { BUILTIN_BOTS, BUILTIN_SKILLS, type BotDef, type ChatMessage, type DeskTask, type LibraryItem, type MemoryFact, type Room, type RoomMessage, type Schedule, type SkillDef } from "./workspace";

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
  rooms: [],
  roomMessages: [],
  tasks: [],
  schedules: [],
  memories: [],
  library: [],
  activity: [],
  usage: [],
};

function uid() {
  return crypto.randomUUID();
}

async function put(path: [string, ...string[]], data: Record<string, unknown>) {
  const db = clientDb();
  if (!db) return;
  await setDoc(doc(db, path[0], path[1], ...path.slice(2)), data, { merge: true });
}

async function persistWorkspace(s: AppState) {
  if (!clientDb() || s.user?.mode !== "firebase") return;
  const userId = s.user.id;
  const now = new Date().toISOString();
  for (const bot of s.bots.filter((b) => !b.builtin)) {
    await put(["users", userId, "bots", bot.id], { payload: bot, updatedAt: now });
  }
  for (const skill of s.skills.filter((sk) => !sk.builtin)) {
    await put(["users", userId, "skills", skill.id], { payload: skill, updatedAt: now });
  }
  for (const conversation of s.conversations) {
    await put(["users", userId, "conversations", conversation.id], {
      botId: conversation.botId,
      title: conversation.title,
      updatedAt: conversation.updatedAt,
    });
  }
  for (const message of s.messages.slice(-30)) {
    await put(["users", userId, "messages", message.id], { payload: message, createdAt: message.createdAt });
  }
  const desk = [
    ...s.rooms.map((row) => ({ id: row.id, kind: "room", payload: row })),
    ...s.tasks.map((row) => ({ id: row.id, kind: "task", payload: row })),
    ...s.schedules.map((row) => ({ id: row.id, kind: "schedule", payload: row })),
    ...s.memories.map((row) => ({ id: row.id, kind: "memory", payload: row })),
    ...s.library.map((row) => ({ id: row.id, kind: "library", payload: row })),
    ...s.activity.slice(0, 40).map((row) => ({ id: row.id, kind: "activity", payload: row })),
  ];
  for (const row of desk) {
    await put(["users", userId, "desk", row.id], { kind: row.kind, payload: row.payload, updatedAt: now });
  }
  for (const app of s.applications) {
    await put(["users", userId, "applications", app.id], applicationRow(userId, app) as Record<string, unknown>);
  }
  for (const item of s.outreach) {
    await put(["users", userId, "outreach", item.id], outreachRow(userId, item) as Record<string, unknown>);
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

function mergeBots(saved: BotDef[]): BotDef[] {
  const custom = saved.filter((b) => !BUILTIN_BOTS.some((x) => x.id === b.id));
  const builtins = BUILTIN_BOTS.map((b) => ({ ...b, ...(saved.find((s) => s.id === b.id) ?? {}) }));
  return [...builtins, ...custom];
}

function mergeSkills(saved: SkillDef[]): SkillDef[] {
  const custom = saved.filter((s) => !BUILTIN_SKILLS.some((b) => b.id === s.id));
  return [...BUILTIN_SKILLS, ...custom];
}

type Store = AppState & {
  ready: boolean;
  signInDemo: (email?: string) => void;
  signOut: () => Promise<void>;
  adoptFirebaseUser: (id: string, email: string) => void;
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
  saveRoom: (room: Room) => void;
  addRoomMessage: (message: RoomMessage) => void;
  saveTask: (task: DeskTask) => void;
  saveSchedule: (schedule: Schedule) => void;
  saveMemory: (fact: MemoryFact) => void;
  deleteMemory: (id: string) => void;
  saveLibrary: (item: LibraryItem) => void;
  logActivity: (text: string) => void;
  bumpUsage: (botId: string, model: string) => void;
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
      applications: (parsed.applications ?? []).filter((row) => !isHiddenTestFixture(row.job)),
      feed: (parsed.feed ?? []).filter((row) => !isHiddenTestFixture(row)),
      bots: parsed.bots?.length ? mergeBots(parsed.bots) : BUILTIN_BOTS,
      rooms: parsed.rooms ?? [],
      roomMessages: parsed.roomMessages ?? [],
      tasks: parsed.tasks ?? [],
      schedules: parsed.schedules ?? [],
      memories: parsed.memories ?? [],
      library: parsed.library ?? [],
      activity: parsed.activity ?? [],
      usage: parsed.usage ?? [],
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
    const auth = clientAuth();
    if (!auth) return;
    return onAuthStateChanged(auth, (u) => {
      if (!u) return;
      setState((s) => scopeToUser(s, { id: u.uid, email: u.email ?? "", mode: "firebase" }));
      void pullRemote(u.uid);
      void u.getIdToken().then((token) => fetch("/api/session", { method: "POST", headers: { Authorization: `Bearer ${token}` } }));
    });
  }, []);

  async function list(userId: string, name: string): Promise<Array<Record<string, unknown> & { id: string }>> {
    const db = clientDb();
    if (!db) return [];
    const snap = await getDocs(collection(db, "users", userId, name));
    return snap.docs.map((row) => ({ id: row.id, ...(row.data() as Record<string, unknown>) }));
  }

  async function pullRemote(userId: string) {
    const db = clientDb();
    if (!db) return;
    try {
      const [profileSnap, bots, skills, conv, msgs, desk, apps, outs] = await Promise.all([
        getDoc(doc(db, "users", userId)),
        list(userId, "bots"),
        list(userId, "skills"),
        list(userId, "conversations"),
        list(userId, "messages"),
        list(userId, "desk"),
        list(userId, "applications"),
        list(userId, "outreach"),
      ]);
      const data = profileSnap.data();
      setState((s) => {
        if (s.user?.id !== userId) return s;
        const customBots = bots.map((row) => row.payload as BotDef).filter((b) => b && !b.builtin);
        const customSkills = skills.map((row) => row.payload as SkillDef).filter((sk) => sk && !sk.builtin);
        const conversations = conv.map((row) => ({
          id: String(row.id),
          title: String(row.title || "Chat"),
          botId: String(row.botId || ""),
          updatedAt: String(row.updatedAt || new Date().toISOString()),
        }));
        const messages = msgs.map((row) => row.payload as ChatMessage).filter(Boolean);
        const take = <T,>(kind: string) => desk.filter((row) => row.kind === kind).map((row) => row.payload as T);
        const applications = apps.map((row) => applicationFromRow(row as Record<string, unknown>)).filter((row): row is NonNullable<typeof row> => Boolean(row));
        const outreach = outs.map((row) => outreachFromRow(row as Record<string, unknown>)).filter((row): row is NonNullable<typeof row> => Boolean(row));
        return {
          ...s,
          syncNote: null,
          profile: data
            ? {
                ...s.profile,
                fullName: String(data.fullName ?? ""),
                email: String(data.email ?? s.profile.email),
                onboarded: Boolean(data.onboarded),
                targetRoles: (data.targetRoles as string[]) ?? [],
                locations: (data.locations as string[]) ?? [],
                salaryMinLpa: (data.salaryMinLpa as number | null) ?? null,
                salaryMaxLpa: (data.salaryMaxLpa as number | null) ?? null,
                experienceYears: (data.experienceYears as number | null) ?? null,
                skills: (data.skills as string[]) ?? [],
                linkedinUrl: String(data.linkedinUrl ?? ""),
                preferences: String(data.preferences ?? ""),
                resumeText: String(data.resumeText ?? ""),
                resumeFileName: String(data.resumeFileName ?? ""),
                emailConsent: Boolean(data.emailConsent),
                consentAt: (data.consentAt as string | null) ?? null,
                smtpHost: String(data.smtpHost ?? ""),
                smtpPort: String(data.smtpPort ?? "587"),
                smtpUser: String(data.smtpUser ?? ""),
                smtpFrom: String(data.smtpFrom ?? ""),
              }
            : s.profile,
          bots: customBots.length ? [...BUILTIN_BOTS, ...customBots] : s.bots,
          skills: customSkills.length ? mergeSkills([...BUILTIN_SKILLS, ...customSkills]) : s.skills,
          conversations: conversations.length ? conversations : s.conversations,
          messages: messages.length ? messages : s.messages,
          rooms: desk.length ? take("room") : s.rooms,
          tasks: desk.length ? take("task") : s.tasks,
          schedules: desk.length ? take("schedule") : s.schedules,
          memories: desk.length ? take("memory") : s.memories,
          library: desk.length ? take("library") : s.library,
          activity: desk.length ? take("activity") : s.activity,
          applications: applications.length ? applications : s.applications,
          outreach: outreach.length ? outreach : s.outreach,
        };
      });
    } catch {
      setState((s) => s.user?.id === userId ? { ...s, syncNote: "Signed in. Firestore rejected the read. Check the rules." } : s);
    }
  }

  const pushProfile = useCallback(async (profile: Profile, userId: string) => {
    const db = clientDb();
    if (!db) return;
    try {
      await setDoc(doc(db, "users", userId), { ...profile, updatedAt: new Date().toISOString() }, { merge: true });
    } catch {
      setState((s) => ({ ...s, syncNote: "Profile saved on this device. Firestore rejected the write." }));
    }
  }, []);

  const signInDemo = useCallback((email?: string) => {
    const addr = email?.trim() || "";
    setState((s) => ({
      ...scopeToUser(s, { id: "demo", email: addr, mode: "demo" }),
      syncNote: "Demo mode keeps data in this browser only.",
    }));
  }, []);

  const signOut = useCallback(async () => {
    const auth = clientAuth();
    if (auth) await firebaseSignOut(auth);
    await fetch("/api/session", { method: "DELETE" });
    setState((s) => ({ ...s, user: null }));
  }, []);

  const adoptFirebaseUser = useCallback((id: string, email: string) => {
    setState((s) => scopeToUser(s, { id, email, mode: "firebase" }));
    void pullRemote(id);
  }, []);

  const updateProfile = useCallback((patch: Partial<Profile>) => {
    setState((s) => {
      const profile = { ...s.profile, ...patch };
      if (s.user?.mode === "firebase") void pushProfile(profile, s.user.id);
      return { ...s, profile };
    });
  }, [pushProfile]);

  const completeOnboarding = useCallback((patch: Partial<Profile>) => {
    updateProfile({ ...patch, onboarded: true });
  }, [updateProfile]);

  const setFeed = useCallback((jobs: Job[]) => { commit((s) => ({ ...s, feed: jobs })); }, [commit]);

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

  const saveRoom = useCallback((room: Room) => {
    commit((s) => ({
      ...s,
      rooms: s.rooms.some((r) => r.id === room.id) ? s.rooms.map((r) => (r.id === room.id ? room : r)) : [room, ...s.rooms],
    }));
  }, [commit]);
  const addRoomMessage = useCallback((message: RoomMessage) => {
    commit((s) => ({ ...s, roomMessages: [...s.roomMessages, message] }));
  }, [commit]);
  const saveTask = useCallback((task: DeskTask) => {
    commit((s) => ({
      ...s,
      tasks: s.tasks.some((t) => t.id === task.id) ? s.tasks.map((t) => (t.id === task.id ? task : t)) : [task, ...s.tasks],
    }));
  }, [commit]);
  const saveSchedule = useCallback((schedule: Schedule) => {
    commit((s) => ({
      ...s,
      schedules: s.schedules.some((x) => x.id === schedule.id) ? s.schedules.map((x) => (x.id === schedule.id ? schedule : x)) : [schedule, ...s.schedules],
    }));
  }, [commit]);
  const saveMemory = useCallback((fact: MemoryFact) => {
    commit((s) => ({
      ...s,
      memories: s.memories.some((m) => m.id === fact.id) ? s.memories.map((m) => (m.id === fact.id ? fact : m)) : [fact, ...s.memories],
    }));
  }, [commit]);
  const deleteMemory = useCallback((id: string) => {
    commit((s) => ({ ...s, memories: s.memories.filter((m) => m.id !== id) }));
  }, [commit]);
  const saveLibrary = useCallback((item: LibraryItem) => {
    commit((s) => ({ ...s, library: [item, ...s.library] }));
  }, [commit]);
  const logActivity = useCallback((text: string) => {
    commit((s) => ({
      ...s,
      activity: [{ id: uid(), text, createdAt: new Date().toISOString() }, ...s.activity].slice(0, 40),
    }));
  }, [commit]);
  const bumpUsage = useCallback((botId: string, model: string) => {
    commit((s) => {
      const hit = s.usage.find((u) => u.botId === botId && u.model === model);
      const usage = hit
        ? s.usage.map((u) => (u === hit ? { ...u, count: u.count + 1 } : u))
        : [...s.usage, { botId, model, count: 1 }];
      return { ...s, usage };
    });
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
      adoptFirebaseUser,
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
      saveRoom,
      addRoomMessage,
      saveTask,
      saveSchedule,
      saveMemory,
      deleteMemory,
      saveLibrary,
      logActivity,
      bumpUsage,
    }),
    [
      state,
      ready,
      signInDemo,
      signOut,
      adoptFirebaseUser,
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
      saveRoom,
      addRoomMessage,
      saveTask,
      saveSchedule,
      saveMemory,
      deleteMemory,
      saveLibrary,
      logActivity,
      bumpUsage,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore outside provider");
  return ctx;
}
