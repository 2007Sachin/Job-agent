# Product-market fit gaps

Written before the fixes in this round. Job-agent stays original and does not automate LinkedIn.

## Target users and jobs to be done

Primary: people looking for work in any field. India first, including freshers and career switchers. Also people aiming at remote roles abroad.

| Person | Job to be done |
| --- | --- |
| Fresher in India | Turn a thin resume into something a company will read, and know which roles to open. |
| Career switcher | Show old experience in the words of a new field, without inventing jobs. |
| Working seeker | Keep applications, follow-ups, and interview notes in one place after work hours. |
| Remote seeker | Search boards they already use, save a role, and draft a resume for that role only. |

The promise: find a role, make a resume for that role, and remember the next step. A helper drafts. The person sends email and submits the application.

## Competitor landscape (public information)

Prices and complaints change. This is a snapshot of what these products are known for, not a live price check.

| Product | What it does | Pricing shape | What people complain about |
| --- | --- | --- | --- |
| Teal | Job tracker, resume builder, contacts | Free tracker; paid resume and AI | Paywall on the resume people came for; tracker feels separate from writing |
| Huntr | Kanban tracker, notes, resume | Free board; paid extras | Light on writing quality; another board to maintain |
| Simplify | Autofill on company sites, tracker | Free core; paid autofill | Autofill breaks; people worry it applies too fast |
| Jobscan | ATS keyword match against a posting | Paid scans, limited free | Score chasing; keywords over a readable resume |
| Careerflow | LinkedIn review, tracker, AI drafts | Subscription | Tied to LinkedIn habits; generic drafts |
| Kickresume | Resume templates and AI writing | Free template limits; paid export | Pretty templates, weak job tracking |
| LinkedIn Premium | InMail, applicant insights, learning | Monthly subscription | Price; insights that do not change the application |
| Naukri tools | Profile, recruiter reach, paid visibility in India | Free profile; paid boosts | Calls and spam; visibility that is not a better resume |

Pattern: trackers are common and often free. Writing, ATS match, and autofill are paid. Complaints cluster on paywalls, generic text, and tools that act on a job site without a clear yes.

## Feature gaps

| Need | Today | Gap |
| --- | --- | --- |
| Onboarding under 2 minutes to a first tailored resume | Four steps end on Save, then the person must open the job and press Make my resume | The first resume is one step too late |
| Resume import | PDF, DOCX, and text parse | Works. Keep it. |
| ATS-style score | Match score against the profile, not a keyword scanner | Partial. Explain it as a fit note, not an ATS grade |
| Tailored resume and cover letter | On the job page, templates or a free model | Wired. Easy to miss |
| Kanban tracker | My applications | Wired |
| Follow-up reminders | Due list on My applications | Wired, easy to miss |
| Interview prep | Coach helper | Wired in chat, not in the tracker |
| Salary insights | Not built | Open. Needs a real source, not invented pay |
| Referral and outreach drafts | Note helper, approval before email | Wired. No contact graph |
| Funnel analytics | Charts by stage | Stages are raw, not saved → applied → interview → offer |
| Mobile | Stacks, but the rail is long and chat is cramped | Needs a collapsible rail |
| Privacy | Local demo, export, delete, no LinkedIn automation | Say it on a plan page |
| Free tier and paid plan | No plan page | Open. No billing yet |
| Share loop | No invite | Open |

## UI gaps (Nielsen and Apple HIG)

Reviewed on the light desktop shell.

| Heuristic | What is wrong |
| --- | --- |
| Match the real world | The model pill shows `env:LLM_MODEL`. |
| Recognition | Helper rows cut the role to two words. |
| Aesthetic integrity | Inbox, section marks, screen, and composer use text stand-ins, not a consistent icon set. |
| Consistency | Dark and Out sit in the rail like primary actions. |
| Visibility of status | Empty Inbox, empty chat tools, and failed loads are easy to miss. |
| Error recovery | Some failures are a blank area. |
| Flexibility | No short path from first launch to a resume. |
| Aesthetic and minimal | The rail lists every tool at once. Fine if icons and spacing stay quiet. |
| Contrast and keyboard | Focus rings exist. Icon-only controls need names. Grey on grey must stay at least 4.5:1. |
| Mobile | The rail and the 400px panel compete with the chat. |

## Ranked work

Impact is how much it helps someone finish an application. Effort is how much of this app must change.

| Rank | Gap | Impact | Effort | Status |
| --- | --- | --- | --- | --- |
| 1 | First tailored resume in the first session | High | Low | fixed — Save this job writes a draft and opens the job |
| 2 | Shell polish: labels, icons, descriptions, Dark/Out | High | Low | fixed — Lucide icons, full role line, model reads Free model, theme is an icon |
| 3 | Funnel: saved, applied, interview, offer | High | Low | fixed — four counts on How you are doing |
| 4 | Follow-up reminders stay visible | Medium | Low | fixed — due list, plus a line when none are due |
| 5 | Plan page with free limits, no charge | Medium | Low | fixed — Free is 5 resumes a month; Plus is coming soon with a waitlist |
| 6 | Mobile rail and panel | Medium | Medium | fixed — drawer under 768px, side panel full screen, composer stays at the bottom |
| 7 | Empty, loading, and error states | Medium | Low | fixed — shared empty, skeleton, and retry states on the main screens |
| 8 | Salary insights | Medium | High | open |
| 9 | Real billing | Medium | High | open |
| 10 | Invite loop | Low | Medium | open |
| 11 | Contact and referral graph | Medium | High | open |

## Metrics

| Metric | Meaning | First signal |
| --- | --- | --- |
| Activation | Share of new people who save a job and have a tailored resume the same day | Count that pair in the tracker |
| Weekly applications | Roles moved to Applied in seven days | Tracker stage changes |
| Retention | People who open the app again the next week and touch a role | Needs accounts; demo cannot measure this yet |
| NPS | “Would you tell a friend?” after the first resume | Ask later. Not built |

Do not treat match score or email opens as success. Success is a resume the person is willing to send, and a next step they remember.
