import type { Profile } from "./types";

export const sampleProfile = (): Partial<Profile> => ({
  fullName: "Ananya Iyer",
  targetRoles: ["Customer support", "Operations coordinator"],
  locations: ["Bengaluru", "Remote"],
  salaryMinLpa: 6,
  salaryMaxLpa: 12,
  experienceYears: 3,
  skills: ["Excel", "Hindi", "English", "customer calls", "scheduling", "writing"],
  linkedinUrl: "https://www.linkedin.com/in/example-ananya",
  preferences: "Weekday shifts. Open to healthcare, retail, or software companies. No night shifts.",
  resumeFileName: "ananya-iyer.txt",
  resumeText: `Ananya Iyer
Bengaluru

Work
Clinic desk associate, Bright Path Diagnostics, 2023–present
- Scheduled 40 patients a day and cut no-shows by calling the evening before.
- Explained invoices in Hindi and English. Escalated billing disputes with a written note.
- Trained two new hires on the appointment sheet.

Store supervisor, Daily Basket, 2021–2023
- Closed the register, counted cash, and wrote the shift report in Excel.
- Covered the floor when the manager was out. Handled returns without raising my voice.

Education
B.Com, Christ University, 2021

Tools
Excel, Google sheets, a helpdesk shared inbox, basic English email.`,
});
