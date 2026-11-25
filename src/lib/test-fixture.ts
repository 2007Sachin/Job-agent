type FixtureJob = { title?: string; company?: string; description?: string; url?: string };

/** Old Staff Nurse / Ward shifts test save, and any /fixture/job row. Shown only with the dev flag. */
export function showTestFixtures() {
  return process.env.NEXT_PUBLIC_SHOW_TEST_FIXTURE === "1";
}

export function isHiddenTestFixture(job: FixtureJob) {
  if (showTestFixtures()) return false;
  const title = (job.title || "").trim();
  const company = (job.company || "").trim();
  const description = (job.description || "").trim();
  const url = job.url || "";
  const oldSave = title === "Staff Nurse" && company === "City Hospital" && /ward shifts/i.test(description);
  return oldSave || url.includes("/fixture/job");
}
