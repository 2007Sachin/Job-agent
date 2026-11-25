import { clientAuth } from "./firebase/browser";

export async function aiAuthHeaders(): Promise<Record<string, string>> {
  const auth = clientAuth();
  const token = auth?.currentUser ? await auth.currentUser.getIdToken() : "";
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function publishQuota(detail: { remaining?: number; limit?: number; error?: string }) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("jobagent-quota", { detail }));
}
