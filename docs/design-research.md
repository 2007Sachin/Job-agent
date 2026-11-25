# Design research for Job-agent

Read this before changing the interface. The notes below are the rules the app is built against. Sources are linked. This is a summary for builders, not a substitute for the originals.

## Nielsen’s 10 usability heuristics

Source: Jakob Nielsen, “10 Usability Heuristics for User Interface Design,” Nielsen Norman Group, updated 2024. https://www.nngroup.com/articles/ten-usability-heuristics/

1. **Visibility of system status.** People should always know what is happening, through timely feedback.
2. **Match between system and the real world.** Use the words people already use. Follow real-world order.
3. **User control and freedom.** Offer a clear way out, and undo for mistakes.
4. **Consistency and standards.** The same word and the same control mean the same thing everywhere.
5. **Error prevention.** Stop problems before they happen. Confirm destructive steps.
6. **Recognition rather than recall.** Show options. Do not make people remember codes, bot names, or where a feature was buried.
7. **Flexibility and efficiency.** Shortcuts for people who already know the product. The first path stays simple.
8. **Aesthetic and minimalist design.** Every extra word or control competes with the one that matters.
9. **Help users recognize, diagnose, and recover from errors.** Say what went wrong and how to fix it, in plain language.
10. **Help and documentation.** The best help is a one-line hint next to the control.

## Don Norman’s principles

Source: Don Norman, *The Design of Everyday Things*, revised edition, Basic Books, 2013. Short public restatement: https://jnd.org/the-design-of-everyday-things-revised-and-expanded-edition/

- **Conceptual model.** The person should be able to explain the product in one sentence: “I find a job, I make a resume for it, I keep track of it. The app never sends anything unless I say so.”
- **Affordances.** A button looks pressable. A card looks openable. A field looks typeable.
- **Signifiers.** The label, the icon, and the placement tell you what the control does. Color alone is not a signifier.
- **Mapping.** The control sits next to the thing it changes. “Save this job” is on the job, not on a distant menu.
- **Feedback.** Every click answers: loading, saved, failed, or nothing-to-do.
- **Constraints.** The first screen does not offer every setting. Advanced tools stay behind “More tools.”

## Four laws we actually use

- **Hick’s law.** William Hick, “On the rate of gain of information,” *Quarterly Journal of Experimental Psychology*, 1952. Time to choose grows with the number of choices. The first screen offers three actions, not ten.
- **Fitts’s law.** Paul Fitts, “The information capacity of the human motor system,” *Journal of Experimental Psychology*, 1954. Big, nearby targets are faster and miss less. Primary buttons are at least 44px tall and sit in the main column.
- **Jakob’s law.** Jakob Nielsen; restated at https://lawsofux.com/jakobs-law/. People spend most of their time in other products. Use a left nav, a page title, a primary button, and familiar words (Jobs, Applications, Settings).
- **Miller’s law.** George Miller, “The Magical Number Seven, Plus or Minus Two,” *Psychological Review*, 1956. Short-term memory is small. Nielsen Norman Group also warns not to treat “seven” as a menu-item quota (https://www.nngroup.com/articles/chunking/). We use it as a reason to chunk: show a few groups, and let people recognize the rest.

## Progressive disclosure and Gestalt

- **Progressive disclosure.** Nielsen Norman Group, https://www.nngroup.com/articles/progressive-disclosure/. Show the next step. Hide bot setup, skills, connectors, routines, and memory until someone opens More tools.
- **Gestalt.** Nielsen Norman Group, “Gestalt Principles,” https://www.nngroup.com/articles/gestalt-principles/. Proximity groups a label with its field. Similarity makes every primary button the same. Continuity makes the wizard read left to right. Common region (a bordered step) shows what belongs together.

## Accessibility: WCAG 2.2 AA

Source: W3C, Web Content Accessibility Guidelines 2.2, https://www.w3.org/TR/WCAG22/

- **Contrast.** Text 4.5:1 against its background (1.4.3). Large text 3:1. Focus indicator at least 3:1 (2.4.11 Focus Appearance, AA).
- **Target size.** Success criterion 2.5.8 (AA) asks for at least 24 by 24 CSS pixels. We aim for 44 by 44, which matches 2.5.5 (AAA) and Apple’s and Google’s touch guidance.
- **Focus.** Every control has a visible focus ring. The product works from the keyboard.
- **Name, role, value.** Buttons and links have text, not only an icon (1.1.1, 4.1.2).

## Platform guidance on clarity

- **Apple Human Interface Guidelines.** Clarity, deference, and depth, now written as hierarchy and legibility. https://developer.apple.com/design/human-interface-guidelines/. “Use a type size that most people can read easily.” One primary action per view.
- **Material Design 3.** https://m3.material.io/ and the type scale at https://m3.material.io/styles/typography/overview. Hierarchy comes from size and weight, not from decoration. Touch targets default to 48dp.

## Plain language

Source: U.S. Plain Language guidelines, https://www.plainlanguage.gov/guidelines/, and the checklist at https://www.plainlanguage.gov/guidelines/words/.

- Write for about a Grade 5 reading level. Short sentences. Common words.
- The button says what will happen: “Find jobs,” “Make my resume,” “Save this job.”
- If a special word is required, explain it in the same sentence. “Relay” is not required. “The lead helper picks who answers” is.

## Typography

- Body text at least 16px. Material and common web practice treat 16px as the body default so mobile browsers do not zoom form fields. https://m3.material.io/styles/typography/type-scale-tokens
- Line length about 45–75 characters. Robert Bringhurst, *The Elements of Typographic Style*, and WCAG 1.4.8 (AAA) which also asks for line height of at least 1.5.
- A modular scale with obvious steps (16, 18, 22, 28, 36). Do not use a novelty or display face for interface text. A humanist or grotesque sans is easier to read at small sizes (Bringhurst; also Butterick, *Practical Typography*, https://practicaltypography.com/).
- Sentence case. No all-caps labels. No gradient text. Muted text still meets 4.5:1.

## What this means for this product

A 10-year-old test: can they say what the screen is for, find the one big button, and finish without learning our internal names? If not, the screen fails, even if it looks polished.
