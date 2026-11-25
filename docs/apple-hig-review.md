# Apple HIG review of v5 (before the visual polish)

Reviewed as a desktop web app (Next.js). Apple’s platform conventions for tab bars and system controls are translated, not copied. Principles, accessibility, color, type, layout, materials, buttons, and lists apply. Loaded from `.cursor/skills/apple-design`: `accessibility.md`, `layout.md`, `typography.md`, `color.md`, `designing-for-macos.md`, `cross-platform.md`, `materials.md`, `buttons.md`, `lists-and-tables.md`, `sidebars.md`, `dark-mode.md`, `feedback.md`, `onboarding.md`. No Apple Pay surfaces. Contrast below is computed from the v5 tokens, not from a screenshot.

Thesis of each screen is already clear (find a job, make a resume, keep track). The failure is Craft: the screens read as a wireframe.

| Sev | Where | Finding | Guideline |
| --- | --- | --- | --- |
| High | Whole app | Every region is a flat fill and a 1px line. No layered material, so navigation and content sit on the same plane. | `materials.md › Liquid Glass`: the functional layer (sidebar, bars) should float above content. Content uses standard materials, not glass. |
| High | Buttons | Primary and secondary buttons share a rectangle and have no press state. Style does not separate the preferred action from the rest except by fill. | `buttons.md › Best practices` and `› Style`: include a press state; use a prominent style for the most likely action; keep that to one or two per view. |
| High | Jobs, applications | Rows are hairline dividers with no leading mark, no grouping, and no depth. A match number is plain text. | `lists-and-tables.md › Style`: choose a row style with a leading image and a short label. Grouped lists separate sections. |
| Medium | Type | Source Sans 3 is the only face, including where a system text style would do. Hierarchy is mostly size, not the body / headline pairing. | `typography.md › Using system fonts`: prefer the system face. `› Conveying hierarchy`: weight, size, and color, few typefaces. |
| Medium | Landing, wizard, empty applications | Large empty fields and a single sentence. No illustrated empty state. The mascot is unused on the empty tracker. | `feedback.md` (status should be visible) and Craft in `design-principles.md`: the screen should look finished. Judgment: an empty state needs a picture and the next action. |
| Medium | Sidebar | Solid paper, same as the page. The current item is a black pill. | `sidebars.md`: a sidebar is a distinct column. `materials.md`: regular material on bars that hold text, so type stays readable. |
| Medium | Dark | Tokens exist, but surfaces do not step up (base, raised card, bar). | `dark-mode.md`: elevated content is lighter than the base, not a second copy of the light theme with inverted ink. |
| Low | Motion | Reduced motion is honored. There is no spring on press or on the wizard step, so changes feel instant and unfinished. | `motion.md` was not fully loaded; this is judgment against Craft. Motion must stay optional. |
| Pass | Contrast | Ink `#1a1c16` on `#f7f6f3` is about 15:1. Muted `#3d4236` on that paper is about 8:1. Primary label `#f7f6f3` on `#1f4d2e` is about 8:1. | `color.md` / WCAG AA 4.5:1 for body text. |
| Pass | Targets and names | Buttons are 44px and labeled with verbs. Icons in the nav have text. | `buttons.md` hit region; `accessibility.md` text alternatives. |
| Pass | Structure | Three destinations, a wizard with progress, skip, and plain words. Do not restyle this into a different information architecture. | `onboarding.md`: show progress and a way to skip. |

This review does not ask for Apple logos, SF Symbols files, or San Francisco embedded in the repo. The system font stack is the web stand-in for `typography.md › Using system fonts`.
