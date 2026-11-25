# Job-agent design system

Built from `docs/design-research.md`. Light is the default. Dark is an option. The product should feel calm and obvious.

## Conceptual model

Three jobs:

1. Find jobs.
2. Make a resume and notes for one job.
3. Track that job.

A helper can draft words. The person sends email and submits the application.

## Color roles

| Role | Light | Dark | Use |
| --- | --- | --- | --- |
| Canvas | `#f7f6f3` | `#121410` | Page background |
| Surface | `#ffffff` | `#1c1f18` | Cards, inputs |
| Ink | `#1a1c16` | `#f3f4ee` | Body text, 4.5:1 on canvas and surface |
| Secondary text | `#3d4236` | `#c9d0be` | Hints. Still 4.5:1. Never pale gray. |
| Line | `#d9d6cc` | `#3a3f32` | 1px borders |
| Primary | `#1f4d2e` | `#b6f27c` | One filled button per screen. Label is near-white on green in light mode, near-black on lime in dark mode. |
| Danger | `#8f1d35` | `#ffb3c0` | Delete and failed sends |

No gradient text. No decorative blobs. No glow.

## Type

- Family: system stack (`-apple-system`, `Segoe UI`, Inter). Weight 400 for body, 600 for names.
- Body: 13–14px. Secondary text `#6b7280`.
- Page titles stay short. The chat canvas is mostly whitespace.
- Measure: 65ch on paragraphs.
- Sentence case. Headings are short.

## Spacing

8px grid. Stack: 8, 16, 24, 32, 48. More space above a heading than below it. Page padding 24px, 16px on a narrow screen.

## Components

- **Page header.** One sentence title. One sentence of help. One primary button.
- **Primary button.** Filled, min-height 44px, horizontal padding 16px, verb label. Only one per view.
- **Secondary button.** Border, same 44px height.
- **Text button.** Underline, still 44px hit area.
- **Nav item.** Icon plus words. Min-height 44px. Current page is filled with ink.
- **Input.** 44px height, 16px text, visible border, error text under the field.
- **Empty state.** What is missing, and the button that fixes it.
- **Toast.** Short confirmation (“Saved”). It does not block the page.
- **Wizard.** 4 steps, a “Step 2 of 4” line, Next, Back, and Skip.

## Copy

| Avoid | Say |
| --- | --- |
| Desk, mission, orbit | Home, jobs, applications |
| Scout, Tailor, Relay | Job finder, Resume helper, Lead helper. The stored names stay so @mentions keep working. Show the plain name first and the old name in the hint. |
| Assist connector | A link we can open. We do not sign in for you. |
| Insights | How you are doing |
| Supercharge, seamless, unlock | Find, save, make, send |

Buttons are verbs: Find jobs, Make my resume, Save this job, Send this email.

Errors name the problem and the next step: “Add your name, then press Next.”

## Shell

Light grey rail (`#f5f5f5`), about 240px, no heavy border. Search is a pill. Sections are Group chats, Helpers, and Tools. You sits at the bottom.

The chat canvas is white. The helper name is a centered pill. The model, screen, and menu sit on the right. An empty chat centers a diamond face, the name, and one grey line.

The profile drawer is about 410px: a round search field and a flat list (Overview through History). The side panel is about 400px with Screen, Routines, Browser, and Data, plus a Works on grid (Auto, Cloud, Private sandbox, This computer).

Find jobs, applications, resumes, and connected apps stay reachable from Tools. Display names are Scout, Tailor, Note, Tracker, Coach, and Guide. Stored names stay so @mentions keep working.

## Motion

Hover and focus only. No looping decoration. `prefers-reduced-motion` turns off transitions.
