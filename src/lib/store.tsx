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
  type Stage,
} from "./types";

const KEY = "jobagent.v1";

const initial: AppState = {
  user: null,
  profile: emptyProfile(),
  applications: [],
  outreach: [],
  feed: [],
  syncNote: null,
};

function uid() {
  return crypto.randomUUID();
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
};

const Ctx = createContext<Store | null>(null);

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw) as AppState;
    return { ...initial, ...parsed, profile: { ...emptyProfile(), ...parsed.profile } };
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
        setState((s) => ({
          ...s,
          user: { id: u.id, email: u.email ?? s.profile.email, mode: "supabase" },
          profile: { ...s.profile, email: s.profile.email || u.email || "" },
        }));
        void pullRemote(u.id);
      }
    });
  }, []);

  async function pullRemote(userId: string) {
    const sb = getBrowserSupabase();
    if (!sb) return;
    const { data, error } = await sb.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (error || !data) {
      if (error) {
        setState((s) => ({
          ...s,
          syncNote: "Signed in. Profile sync is waiting on the Supabase tables (see the migration).",
        }));
      }
      return;
    }
    setState((s) => ({
      ...s,
      syncNote: null,
      profile: {
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
      },
    }));
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
      ...s,
      user: { id: "demo", email: addr, mode: "demo" },
      profile: { ...s.profile, email: s.profile.email || addr },
      syncNote: "Demo mode keeps data in this browser only.",
    }));
  }, []);

  const signOut = useCallback(async () => {
    const sb = getBrowserSupabase();
    if (sb) await sb.auth.signOut();
    setState((s) => ({ ...s, user: null }));
  }, []);

  const adoptSupabaseUser = useCallback((id: string, email: string) => {
    setState((s) => ({
      ...s,
      user: { id, email, mode: "supabase" },
      profile: { ...s.profile, email: s.profile.email || email },
    }));
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
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore outside provider");
  return ctx;
}
