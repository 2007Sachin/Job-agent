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

- Family: **Source Sans 3** (open SIL license). One family for UI and headings. Weight 400 for body, 600 for labels and headings.
- Body: 16px, line-height 1.5.
- Small: 14px, line-height 1.45, only for meta that is still 4.5:1. Do not go below 14px.
- Title: 28px. Page title: 36px. Line-height about 1.2.
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

## Navigation

Default:

- Find jobs
- My applications
- Chat with helper

Home is the start page with those three as big choices. Settings and advanced tools (helpers setup, skills, job-site links, routines, memory, library, how you are doing) sit under **More tools**.

## Motion

Hover and focus only. No looping decoration. `prefers-reduced-motion` turns off transitions.
