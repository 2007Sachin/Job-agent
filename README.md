# Job-agent

Suggested product name: **Kipdesk**. The mascot is Kip, a river kite drawn for this app. The repository and UI still say Job-agent until the name is chosen.

The signed-in desk opens on Home. Primary navigation is Home, Chat, Jobs, Applications, and Insights. Bots, skills, connectors, routines, memory, the library, usage, and settings live under Workspace. Chat lists one-to-one bots and group rooms together. Activity and tasks show on Home. Onboarding lands on Home.

Chat is one desk among those. Starter bots are Job Scout, Resume Tailor, Outreach Writer, Application Coach, and Interview Prep. Mention another bot with `@` to hand off. Skills are markdown instructions plus an allow-list of tools. Connectors are either a public API (Remotive, and Adzuna, Greenhouse, and Lever when configured) or assist-only (LinkedIn, Naukri, Instahyre, Hirist, Cutshort, Wellfound, Indeed, Foundit): a deep link, a paste box, and drafts. Those sites are not scraped, and their passwords are never stored.

Workspace rows live in Firestore under `users/{uid}` when Firebase is configured. Rules in `firestore.rules` allow only that user to read and write them. Demo mode keeps them in the browser. The chat route streams a planned reply. With no model key it uses the same local templates as the job desk. Email still sends only after consent and an explicit send on the job page. Approving a card in chat does not send mail.

Rooms, tasks, schedules, memory, a file library, activity, a command palette (Ctrl or Cmd K), and a usage meter are on this branch. Schedules do not run in the background. Run now performs the routine once. Those records are the `desk` subcollection.

Job-agent helps people in India apply for work in any function or seniority. It keeps a profile, searches permitted public sources, scores a posting against that profile, drafts a resume, cover letter, LinkedIn note, and email, and tracks stages. You submit applications yourself. Email goes out only after you approve that message.

## What works

- Marketing pages: home, features, pricing placeholder, FAQ.
- Email + password and Google sign-in when Firebase is configured. A demo desk works with no keys and stores data in the browser.
- Onboarding: PDF or text resume, free-text roles, locations, pay, experience, skills, LinkedIn URL, preferences. A sample profile is included.
- Job search: Remotive (no key), Adzuna / Greenhouse / Lever when env vars are set, plus an illustrative catalog. Paste a description. Greenhouse and Lever job URLs are read from their public APIs. LinkedIn and a short deny-list are not fetched.
- Match score from skills, target roles, location, experience, pay, and resume overlap.
- Per-job resume, cover letter, and LinkedIn draft. DOCX download and print-to-PDF. LinkedIn opens in a new tab; nothing is sent there automatically.
- Cold email via the user's SMTP (password is not stored) or Gmail OAuth. Each send requires consent in Settings and a checkbox on that email. Follow-up dates show on the home desk. They are not auto-sent.
- Kanban tracker and an apply-assist panel of facts to copy.
- Analytics charts from local tracker data. Open and reply are manual marks. There is no tracking pixel.
- Export and delete. Firestore rules limit documents to the signed-in user. Deleting the Auth user needs the Firebase admin credentials.

## What is stubbed or limited

- Pricing is a placeholder. Nothing is billed.
- In-memory daily caps reset per server instance. The `usage_daily` table is in the migration but the API does not increment it yet.
- Gmail refresh tokens are stored in an httpOnly cookie and, when the service role is set, in `gmail_tokens`. There is no background worker.
- A signed-in session writes the profile, applications, outreach, and workspace documents to Firestore. The export API reads those documents with the admin SDK.
- Resume upload parses PDF and `.txt`. It does not parse DOCX. The resume text is saved on the profile. Files are not uploaded (no Firebase Storage).
- Demo catalog companies are fictional.
- Email open/reply analytics are self-reported.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000 and choose “Explore with demo data” or configure Firebase.

### Firebase (Spark plan)

Stay on the free Spark plan. Do not turn on Firebase Storage or Cloud Functions.

1. Create a Firebase project.
2. Authentication → Sign-in method: enable Email/Password and Google.
3. Build → Firestore Database: create a database in production mode.
4. Project settings → Your apps → Web app. Copy the config into `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, and `NEXT_PUBLIC_FIREBASE_APP_ID`.
5. Project settings → Service accounts → Generate new private key. Put `project_id`, `client_email`, and `private_key` in `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` (server only). Keep the newlines in the private key.
6. Deploy rules and indexes: `npx firebase-tools deploy --only firestore` after `firebase login`, with `firestore.rules` and `firestore.indexes.json` in this repo. Or paste `firestore.rules` into the Firestore rules editor.

Google sign-in uses a popup, so you do not add an Auth redirect URL. Add this site's origin to Authentication → Settings → Authorized domains. The Gmail send OAuth client is separate (`GOOGLE_CLIENT_ID`) and still uses `/api/email/gmail/callback`.

### Model

Set `LLM_BASE_URL`, `LLM_API_KEY`, and `LLM_MODEL` to a free OpenAI-compatible endpoint (Gemini, Groq, or NVIDIA NIM). Without them, drafts use local templates. `LLM_DAILY_CAP` defaults to 25 generations per key per UTC day on that instance.

### Deploy (Vercel + Firebase)

- Import the repo in Vercel. Framework preset: Next.js.
- Set the same environment variables as `.env.example`. Never put the private key in a `NEXT_PUBLIC_` variable.
- Add the Vercel domain to Firebase Authorized domains and to the Gmail OAuth client (`/api/email/gmail/callback`).
- Do not commit `.env.local`.

## Scripts

```bash
npm run lint
npm test
npm run build
```
