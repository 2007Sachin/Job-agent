# Job-agent

Suggested product name: **Kipdesk**. The mascot is Kip, a river kite drawn for this app. The repository and UI still say Job-agent until the name is chosen.

Chat is the main desk. Starter bots are Job Scout, Resume Tailor, Outreach Writer, Application Coach, and Interview Prep. Mention another bot with `@` to hand off. Skills are markdown instructions plus an allow-list of tools. Connectors are either a public API (Remotive, and Adzuna, Greenhouse, and Lever when configured) or assist-only (LinkedIn, Naukri, Instahyre, Hirist, Cutshort, Wellfound, Indeed, Foundit): a deep link, a paste box, and drafts. Those sites are not scraped, and their passwords are never stored.

Workspace rows for bots, skills, conversations, and messages are in `supabase/migrations/0002_workspace.sql` with row level security. Demo mode keeps them in the browser. The chat route streams a planned reply. With no model key it uses the same local templates as the job desk. Email still sends only after consent and an explicit send on the job page. Approving a card in chat does not send mail.

Rooms, tasks, schedules, memory, a file library, activity, a command palette (Ctrl or Cmd K), and a usage meter are on this branch. Schedules do not run in the background. Run now performs the routine once. `supabase/migrations/0003_desk.sql` stores those records with row level security.

Job-agent helps people in India apply for work in any function or seniority. It keeps a profile, searches permitted public sources, scores a posting against that profile, drafts a resume, cover letter, LinkedIn note, and email, and tracks stages. You submit applications yourself. Email goes out only after you approve that message.

## What works

- Marketing pages: home, features, pricing placeholder, FAQ.
- Email + password and Google sign-in when Supabase is configured. A demo desk works with no keys and stores data in the browser.
- Onboarding: PDF or text resume, free-text roles, locations, pay, experience, skills, LinkedIn URL, preferences. A sample profile is included.
- Job search: Remotive (no key), Adzuna / Greenhouse / Lever when env vars are set, plus an illustrative catalog. Paste a description. Greenhouse and Lever job URLs are read from their public APIs. LinkedIn and a short deny-list are not fetched.
- Match score from skills, target roles, location, experience, pay, and resume overlap.
- Per-job resume, cover letter, and LinkedIn draft. DOCX download and print-to-PDF. LinkedIn opens in a new tab; nothing is sent there automatically.
- Cold email via the user's SMTP (password is not stored) or Gmail OAuth. Each send requires consent in Settings and a checkbox on that email. Follow-up dates show on the home desk. They are not auto-sent.
- Kanban tracker and an apply-assist panel of facts to copy.
- Analytics charts from local tracker data. Open and reply are manual marks. There is no tracking pixel.
- Export and delete. With Supabase, row-level security limits rows to the signed-in user. Deleting the auth user needs the service role key.

## What is stubbed or limited

- Pricing is a placeholder. Nothing is billed.
- In-memory daily caps reset per server instance. The `usage_daily` table is in the migration but the API does not increment it yet.
- Gmail refresh tokens are stored in an httpOnly cookie and, when the service role is set, in `gmail_tokens`. There is no background worker.
- Profile sync to Supabase covers the profile row. Applications and outreach stay in the browser unless you export them. The export API reads Supabase tables when those rows exist.
- Resume upload parses PDF and `.txt`. It does not parse DOCX. Storage bucket policies are in the migration; the app does not upload files to Storage yet (text is saved on the profile).
- Demo catalog companies are fictional.
- Email open/reply analytics are self-reported.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000 and choose “Explore with demo data” or configure Supabase.

### Supabase

1. Create a project.
2. Run `supabase/migrations/0001_init.sql` in the SQL editor.
3. Auth → Providers: enable Email and Google. Add redirect `https://<your-domain>/auth/callback` and `http://localhost:3000/auth/callback`.
4. Put the project URL and anon key in `.env.local`. Add the service role only on the server (Vercel env), never in client code.

### Model

Set `LLM_BASE_URL`, `LLM_API_KEY`, and `LLM_MODEL` to a free OpenAI-compatible endpoint (Gemini, Groq, or NVIDIA NIM). Without them, drafts use local templates. `LLM_DAILY_CAP` defaults to 25 generations per key per UTC day on that instance.

### Deploy (Vercel + Supabase)

- Import the repo in Vercel. Framework preset: Next.js.
- Set the same environment variables as `.env.example`.
- Add the Vercel URL to Supabase Auth redirects and to the Google OAuth client (`/api/email/gmail/callback` and `/auth/callback`).
- Do not commit `.env.local`.

## Scripts

```bash
npm run lint
npm test
npm run build
```
