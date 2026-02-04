# FundWatch — Review: Usefulness & Engineering

A concise review of what would make the app more useful for partners and better built from an engineering perspective.

---

## Is this good enough to send to a real VC as project work?

**Short answer: yes, with a clear framing.**

- **What’s strong:** The product is clearly scoped (external signals only, no internal data), the flow is right (attention list → company → brief, tasks, hiring, alerts), and the UI is calm and investor-grade. A VC can see the value in a few minutes: “where to look,” “why it matters,” and “what I can do” are all there. That’s enough to show you understand the problem and can ship a focused prototype.

- **What to say when you send it:** Call it a **UI prototype** or **product prototype**, not a production app. Say: “Mock data only, no backend—built to show the workflow and get feedback.” Then add 1–2 high-impact polish items (e.g. time context like ‘Week of Jan 27’, one-line portfolio summary, and company tags / fund assignment) so it feels intentional, not half-done.

- **What would make it clearly “portfolio ready”:** (1) One or two sentences in the UI that make the value proposition obvious (e.g. “See where to pay attention and how you can help—from external signals only”). (2) Time context so they know the data is “this week.” (3) Ability to tag companies and assign them to funds so it feels like their workflow. (4) A short README or demo script (“Try: switch funds, open a red company, read the brief, check a task”).

Bottom line: it’s good enough to send as project work if you frame it as a prototype and add light polish (time context, summary, tagging/fund assignment). It already demonstrates product sense and execution; those tweaks make it feel deliberate and VC-ready.

---

## Part 1: Usefulness (Product)

### High impact

| Change | Why |
|--------|-----|
| **Time context** | Add a single "Week of Jan 27" or "Signals as of …" in the shell or dashboard header. Partners need to know if they're looking at this week or last week. |
| **One-line portfolio summary** | Above the attention list: e.g. "3 need attention · 8 open roles · 2 new alerts". Instant orientation. |
| **Task persistence** | Task status is in React state only; refresh or fund switch wipes it. Use `localStorage` (or similar) so Tasks feel real week-over-week. |
| **Task ↔ Brief sync** | Completing a task on the Tasks page doesn't reflect on the company Brief (and vice versa). Shared task state (or task IDs tied to brief items) would make Tasks the single source of truth. |

### Medium impact

| Change | Why |
|--------|-----|
| **Brief → signal linking** | "Source" / "See signal" on brief bullets that switch to Signals tab and scroll to the item. Makes the brief feel evidence-based. |
| **"Mark reviewed" / snooze on attention list** | Turn the attention list into a queue: "I've looked" or "Snooze 1 week" so partners know what's left to look at. |
| **Digest preview** | "Generate weekly digest" is mock. A preview (modal or page) of "Here's what would be in your Monday email" would make the outbound value tangible. |
| **Alerts prioritization** | Severity (e.g. exec departure vs. quiet 3 weeks) or "New this week" would help triage when there are many alerts. |

### Nice to have

- **"I'll intro" on Hiring Radar** — Flag roles the partner will help with; could drive a "My intros" list.
- **Quick-jump (e.g. Cmd+K)** — Search / command palette to jump to a company by name.
- **Company health trend** — Simple "was green last week" or "↓ from yellow" without a full chart.

---

## Part 2: Engineering

### Data layer

| Improvement | Current | Recommendation |
|-------------|---------|----------------|
| **API boundary** | Pages import and call `getCompany`, `getTasks`, etc. directly from `lib/mock-data.ts`. | Add a thin `lib/api.ts` (or `lib/data.ts`) that re-exports the same functions. When you add a real backend, swap implementations in one place; pages keep calling `getCompany(id)`, etc. |
| **Non-null assertions** | `getCompany(r.companyId)!` in `getOpenRolesForFund` and `getTasks` can hide missing data. | Return type already allows `undefined`; filter out missing companies explicitly and type the result so callers don't rely on `!`. |
| **Task ID stability** | Tasks are generated in `generateTasks()` with `t1`, `t2`, …; IDs change if briefs or order change. | Derive task IDs from `companyId + section + index` (e.g. `c1-whereYouCanHelp-0`) so they're stable for persistence and Brief ↔ Tasks sync. |
| **Fund ID in URL** | Fund is only in React context; refresh loses selection. | Optional: persist fund in URL query (`?fund=f1`) or `localStorage` so refresh and deep links keep the same fund. |

### State

| Improvement | Current | Recommendation |
|-------------|---------|----------------|
| **Task status** | Local `useState` on Tasks page only; no persistence, no sync with company Brief. | Centralize in a small TaskContext (or store) with `localStorage` persistence; Brief page reads/writes the same state so checkboxes stay in sync. |
| **Loading / error** | All data is sync mock; no loading or error states. | When you add async data, add a simple loading skeleton and error boundary (e.g. `error.tsx` / `loading.tsx` in app router) so the app degrades gracefully. |

### Components & hooks

| Improvement | Current | Recommendation |
|-------------|---------|----------------|
| **Data hooks** | Pages call `getCompany(id)`, `getTasks(fundId)`, etc. directly and wrap in `useMemo`. | Add `useCompany(id)`, `useTasks(fundId)`, `useAlerts(fundId)` in `hooks/`. When you switch to async, move loading/error into the hook; pages stay simple. |
| **Company detail size** | `app/company/[id]/page.tsx` is large (~335 lines) with Brief, Signals, Hiring, People all inline. | Split into smaller components: e.g. `CompanyBriefSection`, `CompanySignalsSection`, `CompanyHiringSection`, `CompanyPeopleSection` in `components/company/`. Easier to maintain and test. |
| **Shared constants** | `formatDate`, `healthVariant`, `roleTypeLabels`, `alertTypeLabels`, `statusLabels` are duplicated or defined in multiple files. | Move to `lib/format.ts` (e.g. `formatDate`) and `lib/constants.ts` (e.g. `HEALTH_BADGE_VARIANT`, `ALERT_TYPE_LABELS`, `TASK_STATUS_LABELS`, `ROLE_TYPE_LABELS`). Single source of truth. |

### Routing & 404

| Improvement | Current | Recommendation |
|-------------|---------|----------------|
| **Not found** | Invalid company id shows an in-page "Company not found" message. | Use Next.js `notFound()` in the company page when `getCompany(id)` is undefined so the app returns a proper 404 and you can style it with `not-found.tsx`. |
| **Loading UI** | No `loading.tsx` in route segments. | Add `app/company/[id]/loading.tsx` (and optionally `app/loading.tsx`) with a simple skeleton so navigations feel responsive when data becomes async. |

### Types

| Improvement | Current | Recommendation |
|-------------|---------|----------------|
| **IDs as strings** | Company, fund, task IDs are plain strings; easy to mix up. | Optional: use branded types (e.g. `CompanyId`, `FundId`) so TypeScript catches mistakes like passing a company id where a fund id is expected. |
| **Shared types** | Types are in `lib/types.ts`; good. | Keep exporting shared types from a single place; use them in both `lib/mock-data.ts` and any future API layer. |

### Testing

| Improvement | Current | Recommendation |
|-------------|---------|----------------|
| **No tests** | No test files. | Add Vitest + React Testing Library. Start with: (1) data layer — e.g. `getCompanies(fundId)` returns the right companies, `getTasks(fundId)` filters by fund; (2) one key flow — e.g. Portfolio page renders attention list and company cards for selected fund. Extend from there. |

### Accessibility & polish

| Improvement | Current | Recommendation |
|-------------|---------|----------------|
| **Focus & semantics** | Links and buttons are present. | When you add modals or more complex UI, ensure focus is trapped and restored; use `aria-label` where the visible label isn’t enough (e.g. icon-only buttons). |
| **Shadcn Select** | Fund switcher, Hiring filters, and Tasks status use native `<select>`. | Use shadcn `Select` for consistency, keyboard support, and styling with your design system. |

### Summary: suggested order of work

**Usefulness (quick wins)**  
1. Time context ("Week of …") in shell or dashboard  
2. One-line portfolio summary on dashboard  
3. Task persistence (e.g. localStorage) and shared state with Brief  

**Engineering (foundation)**  
1. `lib/format.ts` + `lib/constants.ts` for shared `formatDate` and label/variant maps  
2. `lib/api.ts` (or `lib/data.ts`) as single entry point for data; keep mock behind it  
3. Stable task IDs (`companyId-section-index`) and optional TaskContext + persistence  
4. `useCompany(id)`, `useTasks(fundId)` (and similar) in `hooks/`  
5. Split company detail page into smaller components  
6. `notFound()` for invalid company id; optional `loading.tsx`  
7. Vitest + a few tests for data layer and one main flow  
8. Shadcn Select for fund switcher and all dropdowns  

This order improves both how the app feels to use and how easy it is to extend (e.g. real API, more pages, tests).
