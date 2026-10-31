# UI/UX Rescue Challenge: Course Review Board

**Scenario:** a student is choosing a course, wants to understand previous student feedback, and then submits a review for another course.

**Modified React files:** `src/App.jsx`, `src/styles.css`

## Demonstrations

| What | Before | After |
|---|---|---|
| Main action: submit a review | `before/09-no-confirmation-on-course-page.png` | `after/09-main-action-posted.png`, `after/10-posted-from-course-page.png` |
| Unsuccessful action: second review for a course | `before/08-duplicate-late.png` | `after/06-unsuccessful-duplicate.png` |
| Improvement 1: choosing a course | `before/01-landing-fold.png`, `before/03-search-by-name-empty.png` | `after/01-landing-fold.png` |
| Improvement 2: trustworthy reviews | `before/04-your-reviews-shows-others.png`, `before/05-course-page.png` | `after/03-your-reviews-filter.png`, `after/05-course-page.png` |
| Improvement 3: submitting correctly | `before/07-modal-from-course-page.png`, `before/10-bogus-courses-in-metrics.png` | `after/07-did-you-mean.png`, `after/08-modal-resolved.png` |

## Three justifications

### 1. Choosing a course
**User goal:** compare the available courses and pick one.

**Why it hurt:** the courses were never listed. The first screen showed site-wide statistics, which don't help with choosing, and the first review started at 877px of a 900px window. Searching "Linear Algebra" returned nothing, so you had to already know the code `MATH204`.

**Alternatives compared:**
- **Name suggestions in the lookup box:** the smallest change, but still no way to compare courses.
- **A separate course list page:** the cleanest structure, but it adds a click and a route.
- **Course cards at the top of Overview:** comparison happens on arrival, but the statistics move down the page.

**Chosen:** course cards showing code, name, average, review count and a "You reviewed" marker. Search and the lookup now also accept course names. The statistics and lookup are still there, below the reviews. The first review row moved up to 639px.

### 2. Trustworthy reviews
**User goal:** judge how current the feedback is, and find your own reviews.

**Why it hurt:**
- Every review said "Recently", even though real dates were stored.
- "Your reviews" only searched for the text "You", so 2 of its 4 rows belonged to other students (Farida and Youssef), and the filter stayed on afterwards.
- "Apply" did nothing, because filtering was already live, yet it reported success.
- "Back to reviews" landed at the top of the page, 721px above the list.

**Alternatives compared:**
- **Make Apply really control filtering:** keeps the button, but adds a click and slows browsing.
- **A separate "Your reviews" page:** very clear, but duplicates the table.
- **Fix it in place:** smallest change, but the Apply button goes away.

**Chosen:** fix it in place, with real dates, a true owner filter shown as a removable chip, and "Clear filters". Back now lands on the list and keeps your filters, and course pages gain a rating breakdown. Search and rating filtering still work, and update as you type.

### 3. Submitting a review for another course
**User goal:** review the right course once, and know it worked.

**Why it hurt:**
- `CSEN 701` with a space got past the one-review-per-course rule.
- Typing `Critical Thinking` created a fake course with no profile and inflated Courses Rated.
- Duplicates were only reported on submit.
- Submitting from a course page showed no confirmation.
- Clicking outside the form silently discarded the draft.
- The `CSEN701` placeholder looked like a value that was already filled in.

**Alternatives compared:**
- **Strict dropdown of courses:** no typos possible, but rejected (see below).
- **Custom searchable dropdown:** the most polished, but too much code and accessibility work for this session.
- **Text input with suggestions and a live status line:** native suggestion lists look different across browsers, but it is quick to build and keeps the field as text.

**Chosen:** the text input with a status line that says one of four things: the course matched, you already reviewed it (with a link to edit), "did you mean…", or it isn't listed and how it will be saved. Codes are compared without spaces, and confirmations now appear on every page. Leaving a draft asks first, and Esc and keyboard focus work inside the form.

**Trade-off accepted:** an unlisted code is still accepted, because the brief defines the field as required text. A typo can therefore still create a new course, but the form now warns you first and shows exactly what will be saved.

## AI suggestions rejected and refined

**Rejected: replace the course field with a strict dropdown.** It would eliminate typos and fake courses, but the brief defines `courseCode` as required text and the app already supports courses outside the catalog. A dropdown would have removed that ability, so I kept the text field and added guidance instead.

**Refined: pre-fill the course whenever a review is started from a course page.** On its own, that works against this scenario, because the student reads one course and reviews a different one, so a pre-filled code would be easy to submit by mistake. I made the two entry points explicit: the course page button now names its target ("Review MATH204") and pre-fills it, while the sidebar's "Write a review" stays blank.

## Testing

`tests/verify.mjs` drives the running app in headless Chrome. **88 checks pass, 0 fail** (`tests/results.txt`), and the production build succeeds. The checks cover:

- **Validation:** course code required, whole-number ratings 1–5, optional comment, and one review per course, including when editing.
- **Ownership:** you can only edit your own reviews, in both the table and the course page.
- **Course pages:** shareable links, reloads, unknown courses and teaching history.
- **Data:** `localStorage` persistence, previously saved data, and Reset demo.
- **Everything else:** the statistics and lookup, plus layout at 390px and 900px wide.

The tests found one real bug during the work: clicking "Edit your review" removed the focused button, which stopped Esc from working. It is fixed and now covered.

The script needs `playwright-core`, an installed Chrome and the app running on port 5174. Those settings are hardcoded at the top of the script.

## Other behaviour changes
- "Apply" is removed, because filtering was already live.
- Reset demo now asks for confirmation, and still restores the example data.

## Known limitations
- The donut chart's segments are still hardcoded in CSS and don't reflect the data.
- At phone width the review table still scrolls sideways, and below 1070px the sidebar shows icons only.
- Native suggestion popups don't appear in automated screenshots, so the suggestion list itself wasn't visually checked. Typed names, "did you mean" and the status line were tested.
