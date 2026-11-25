# Feature parity

This list is the helper-management surface. Every name, icon, and sentence is original to Job-agent. Nothing here copies another product’s name, logo, mascot, or wording.

| Feature | Where | Original? |
| --- | --- | --- |
| Search in the sidebar | Opens the existing command list | Yes. Label is Search. |
| Inbox | `/inbox` shows helper notes | Yes. It is an activity list, not a cloned notification product. |
| Group chats | `/rooms` | Yes. Called group chats. |
| Helpers with a live status | Sidebar on every page | Yes. Status is Ready, Searching jobs…, Drafting…, or Paused. |
| Tools: Automations, Team map, Shared items | `/automations`, `/team`, `/shared` | Yes. |
| You | Settings link at the bottom | Yes. |
| Chat header | Name, role, model, helper screen, menu | Yes. |
| Empty chat | Letter mark, plain name, one sentence | Yes. Letter marks, not a borrowed character. |
| Helper profile | Drawer sections: Overview through History | Yes. Labels are the ones in `src/lib/helper-desk.ts`. |
| Side panel | Screen, Routines, Browser, Data, Works on | Yes. Start does not automate LinkedIn. |
| Connected apps | `/apps` | Yes. Cards explain access in plain words. Gmail uses the existing Google start route when keys exist. Other cards are a local adapter plus a Supabase save when a session exists. |
| Job-site cards | LinkedIn and Naukri on the apps page | Yes. User-opened only, same as the v8 links and extension. |
| Extension jobs and tokens | `extension_jobs`, `extension_tokens` | Yes. Written when the service role is set. Demo mode still uses the process inbox. |

Find jobs and My applications stay in Tools so the original three jobs are still one click away.
