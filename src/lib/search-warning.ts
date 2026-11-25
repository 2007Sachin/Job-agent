/** Seeker-facing line. Key names stay in server logs and Advanced settings. */
export function searchKeyWarning(env: { adzuna?: string; greenhouse?: string; lever?: string }) {
  if (env.adzuna && env.greenhouse && env.lever) return null;
  return "Some public job lists are off until this site's search keys are set.";
}
