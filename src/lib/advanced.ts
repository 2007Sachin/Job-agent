export const ADVANCED_KEY = "jobagent.advanced";

export function readAdvanced() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ADVANCED_KEY) === "on";
}
