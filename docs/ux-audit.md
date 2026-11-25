# Heuristic evaluation (v4, before the plain-language rebuild)

Date: 2026-11-25. Evaluated against `docs/design-system.md`. Severity: 4 blocks the task, 3 makes it hard, 2 slows people down, 1 polish.

| # | Where | Problem | Heuristic | Sev |
| --- | --- | --- | --- | --- |
| 1 | Left nav | Five primary items plus a Workspace list (Bots, Skills, Connectors, Routines, Memory and usage, Library). A new person cannot tell which one finds a job. | Hick, minimalist design, progressive disclosure | 3 |
| 2 | Home | Pipeline counts, matches, tasks, hand-offs, and follow-ups compete. There is no single next step. | Aesthetic and minimalist, visibility | 3 |
| 3 | Onboarding | One long form. No progress, no skip, no “you are on step 2.” A child cannot see the end. | Conceptual model, error prevention | 4 |
| 4 | Names | Job Scout, Resume Tailor, Relay, Insights, assist connectors. The words are not how a person describes the task. | Match the real world, recognition | 3 |
| 5 | Type | Instrument Serif on headings. It looks like a poster, and it is harder to scan than a UI sans. | Typography research, Apple HIG clarity | 3 |
| 6 | Targets | Many controls use `py-2` (about 36px). Below the 44px aim, and some sit near the 24px WCAG floor. | Fitts, WCAG 2.5.8 | 3 |
| 7 | Landing | The orbit and the line “The application moves” do not say what to click. | Signifiers, plain language | 3 |
| 8 | Theme | Dark is the default. Body text is fine, but the first impression is a control room, not a form a child expects. | Jakob’s law | 2 |
| 9 | Feedback | Save, create room, and send do not show a toast. Success is a silent change. | Feedback, visibility of status | 2 |
| 10 | Empty states | “No bot tasks yet” and “No threads yet” do not say the next click. | Help, recognition | 2 |
| 11 | Room page | Instructions (“Stay factual…”) read like a status, and they used to leak into the resume. The hint is not a next step. | Conceptual model | 2 |
| 12 | Destructive actions | Delete and sign-out have no undo. | User control | 2 |
| 13 | Icons | Some lists are text-only, some controls are icon-first. Labels are not consistent. | Signifiers, WCAG text alternative | 2 |
| 14 | Chat | The helper list uses internal names with no one-line explanation. | Recognition rather than recall | 3 |
| 15 | Copy tone | “Desk,” “hand-offs,” and “mission” language describe our metaphor, not the user’s job. | Plain language | 2 |

Passing checks in v4: keyboard focus ring exists, reduced motion is respected, email still requires approval, and the main flows (search, save, draft, track) do work once you know the map.
