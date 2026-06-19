# Product Requirements Document (PRD) — v2.0

## GKM Open Source Journey

| | |
|---|---|
| **Owner** | Gautam Kumar Maurya (GKM563) |
| **Document Status** | Draft v2.0 — Advanced/Detailed |
| **Last Updated** | 19 June 2026 |
| **Audience** | Self (builder), future contributors, recruiters, mentors |

---

## 1. Executive Summary

GKM Open Source Journey is a permanent, self-hosted, zero-cost platform that captures every open-source contribution made by Gautam Kumar Maurya across GitHub, GitLab, Gerrit, Phabricator, Wikipedia/Wikimedia, hackathons, internships, and communities — and turns that raw activity into a searchable knowledge base, a visual portfolio, and a public transparency dashboard.

This v2 revision upgrades the original PRD with:
- A full **visual design system** (color tokens, typography, spacing, motion)
- A concrete **technical architecture** (Git-as-database CMS pattern, serverless automation, API layer)
- An expanded **tech stack** with rationale for each choice
- New features that close gaps in the original spec (search, PWA, SEO, i18n, AI recap, public API, accessibility, testing, monitoring)
- Data schemas, folder structure, and a phased roadmap

---

## 2. Problem Statement (unchanged, refined)

Contributions are currently scattered across GitHub, Gerrit, GitLab, Phabricator, Wikipedia, and community programs. Over time it becomes hard to answer:

- Which task was completed, and when?
- Which PR/patch was merged, and by whom was it reviewed?
- What feedback did a reviewer give, and is it being applied consistently?
- What is the cumulative shape of this contributor's growth over a year?

**Goal:** one canonical, durable, queryable source of truth — owned entirely by GKM, with no vendor lock-in and no recurring cost.

---

## 3. Goals & Non-Goals

### Goals
1. Single pane of glass for all contribution platforms.
2. Daily/weekly/monthly/yearly drill-down with zero manual searching.
3. A reviewer-feedback knowledge base that compounds in value over time.
4. A portfolio-grade public site recruiters/mentors can browse in under 60 seconds.
5. $0 recurring cost, forever, on free-tier infrastructure only.
6. Designed to survive 5–10 years with minimal maintenance.

### Non-Goals (explicitly out of scope for v1)
- Multi-user / multi-contributor support (single-tenant by design).
- Real-time push notifications from external platforms (polling/cron is sufficient).
- Paid database or paid hosting tier.
- Mobile native app (PWA covers this need).

---

## 4. Target Users & Personas

| Persona | Need | Primary Surface |
|---|---|---|
| **GKM (Primary)** | Log, recall, and reflect on contributions; track learning | Admin Portal, Learning Journal, Timeline |
| **Recruiter** | Quickly assess credibility and consistency | Homepage, Dashboard, Achievements |
| **OSS Mentor / Reviewer** | See how their feedback was applied | Reviewer Knowledge Base |
| **Wikimedia Maintainer** | Verify task completion history | Wikimedia Section, Phabricator tracker |
| **Future Collaborator** | Understand technical range and activity cadence | Analytics, Repository Distribution |

---

## 5. Visual Design System

Design language: **"Quiet Confidence"** — inspired by Linear, Vercel, Notion, and GitHub's dark UI, but warmer and less clinical than raw Material Design. Calm neutrals, one accent color, generous whitespace, data-dense without feeling busy.

### 5.1 Color Tokens

**Dark mode (default)** — primary viewing mode, GitHub/Linear-style:

| Token | Hex | Usage |
|---|---|---|
| `--bg-base` | `#0B0E14` | App background |
| `--bg-surface` | `#161B22` | Cards, panels |
| `--bg-surface-elevated` | `#1C2128` | Modals, dropdowns |
| `--border-subtle` | `#262C36` | Dividers |
| `--border-default` | `#30363D` | Card borders |
| `--text-primary` | `#E6EDF3` | Headings, body |
| `--text-secondary` | `#8B949E` | Meta text, captions |
| `--accent-primary` | `#6366F1` | Brand / primary actions (Indigo 500) |
| `--accent-primary-hover` | `#818CF8` | Hover state |
| `--status-merged` | `#10B981` | Merged / success (Emerald 500) |
| `--status-open` | `#3B82F6` | Open / in-review (Blue 500) |
| `--status-pending` | `#F59E0B` | Under review (Amber 500) |
| `--status-rejected` | `#EF4444` | Closed / rejected (Red 500) |

**Light mode:**

| Token | Hex | Usage |
|---|---|---|
| `--bg-base` | `#FFFFFF` | App background |
| `--bg-surface` | `#F8FAFC` | Cards |
| `--border-default` | `#E2E8F0` | Borders |
| `--text-primary` | `#0F172A` | Headings, body |
| `--text-secondary` | `#64748B` | Meta text |
| Accent + status colors | same hex values as dark mode | consistent brand identity across themes |

Theme toggling persists via a single `data-theme` attribute on `<html>`; never via JS class soup. All colors are CSS variables — never hardcoded — so future re-themes are a one-file change.

### 5.2 Typography

| Role | Font | Notes |
|---|---|---|
| UI / Body | **Inter** (variable font) | Loaded via `@fontsource/inter`, self-hosted (no Google Fonts CDN dependency, better privacy + perf) |
| Code / IDs / Change-IDs | **JetBrains Mono** | PR numbers, Task IDs, Change-IDs always in mono for scannability |
| Display (Hero name) | Inter, 600–700 weight | No separate display font — keeps bundle small |

Type scale (rem, 1.25 ratio): `12 / 14 / 16 / 20 / 25 / 31 / 39 / 49`

### 5.3 Spacing & Grid
- 4px base unit; spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96
- 12-column responsive grid, max content width 1280px, with a 1536px wide-mode for the analytics dashboard
- Card radius: 12px · Button radius: 8px · Avatar radius: full

### 5.4 Motion
- **Framer Motion**, durations 150–250ms, ease `cubic-bezier(0.4, 0, 0.2, 1)`
- Used only for: page transitions, card hover lift (2px translateY), heatmap cell tooltips, achievement unlock confetti (one-time, respects `prefers-reduced-motion`)

### 5.5 Iconography
- **Lucide React** (open source, tree-shakeable, consistent 1.5px stroke) for all UI icons
- Platform badges (GitHub, GitLab, Wikimedia, Phabricator, Gerrit) as small inline SVGs, monochrome by default, colored only on hover/active filter

### 5.6 Component Principles
- Built on **shadcn/ui** (Radix UI primitives + Tailwind), not Material UI — Radix gives accessible, unstyled primitives that match the Linear/Vercel aesthetic far better than MUI's default look, with no runtime theming cost.
- Every status (Merged/Open/Pending/Rejected) is rendered as a small color-coded pill — consistent component used everywhere (cards, tables, timeline, filters).

---

## 6. Information Architecture

```
/                          Homepage (hero, live counters, heatmap, recent activity)
/dashboard                 Open Source Dashboard (totals, filters)
/timeline                  Daily / Weekly / Monthly / Yearly views
/timeline/:date            Deep link to a specific day
/contributions             Searchable contribution database
/contributions/:id         Single contribution detail
/platforms/github
/platforms/gitlab
/platforms/gerrit
/platforms/phabricator
/platforms/wikipedia
/journal                   Learning Journal (daily notes)
/reviewers                 Reviewer Knowledge Base
/reviewers/:name           Single reviewer's feedback history
/analytics                 Charts & trends
/achievements              Milestones & badges
/resume                    Auto-generated, exportable CV/portfolio snapshot
/about
/admin                     Git-authenticated CMS (private)
/api/*                     Public read-only JSON API (see §11)
```

A global **Command Palette** (⌘K / Ctrl+K, built with `cmdk`) lets GKM jump to any contribution, reviewer, or date instantly — critical now that the dataset will contain thousands of entries over the years.

---

## 7. Feature Specification

### 7.1 Homepage
- Hero: name, rotating role tagline, live counters (animated count-up via `react-countup`)
- GitHub-style contribution heatmap (custom SVG, not an iframe) — clicking a cell deep-links to `/timeline/:date`
- "Recent Achievements" rail — last 5 merged PRs/tasks across **all** platforms, normalized into one feed

### 7.2 Open Source Dashboard
- Totals by status (Merged / Open / Rejected / Under Review)
- Compound filters: Platform × Time range × Status × Repository (URL-state driven via search params, so every filtered view is shareable/bookmarkable)
- Saved filter presets (e.g. "This month, Wikimedia only")

### 7.3 Timeline System
- Day / Week / Month / Year tabs, with a shared underlying data-aggregation hook (`useContributionsByRange`)
- Each granularity auto-generates a one-line natural-language summary ("3 PRs merged, 1 Gerrit change submitted, 2 reviewer notes added") generated client-side from the aggregated data — no LLM needed for this baseline summary

### 7.4 Contribution Database
Schema as originally specified, extended with: `tags[]`, `time_spent_minutes`, `related_contribution_ids[]`, `learning_note_id` (links a contribution to the journal entry it generated).

### 7.5 Platform Sections (GitHub / GitLab / Gerrit / Phabricator / Wikipedia)
Unchanged in scope from v1, each gets: a status board (Kanban-style: Open / In Review / Merged / Closed), and a "raw link out" to the source platform for full audit trail.

### 7.6 Learning Journal
- Daily markdown notes (rendered via `react-markdown` + `remark-gfm`)
- Each entry can be tagged with the contribution(s) it relates to
- Full-text searchable (see §7.9)

### 7.7 Reviewer Knowledge Base
- One profile per reviewer: avatar (pulled from platform), total interactions, feedback timeline, feedback **categorized** (Code Style / Process / Domain Knowledge / Tooling)
- "Lessons applied" checklist — mark a piece of feedback as internalized, with the contribution where it was applied

### 7.8 Analytics
Charts (via **Recharts**): Merged-per-month trend, Platform distribution (donut), Repository distribution (treemap), Contribution growth (cumulative area chart), Most active month/day-of-week (heat strip), **Streak tracker** (current streak / longest streak — Duolingo-style, new in v2).

### 7.9 NEW: Global Search
- **Fuse.js** (fuzzy, client-side, zero backend cost) indexing contributions, journal entries, and reviewer notes simultaneously
- Triggered from the command palette or a persistent search icon in the nav

### 7.10 NEW: Achievement System (expanded)
- Tiered badges (Bronze/Silver/Gold) per platform plus cross-platform milestones (First PR, 10/50/100 Merged, First Gerrit Merge, First Wikipedia Article, 30-day streak, 365-day streak)
- Each badge is an SVG, unlocked with a one-time confetti micro-animation, stored permanently in `achievements.json` with `unlocked_at` timestamp

### 7.11 NEW: Resume / Portfolio Export
- `/resume` route renders a clean, printable, one-page summary (auto-pulled from the live data: top metrics, top 5 contributions, badges)
- "Export as PDF" button (client-side via `react-to-print` or `@react-pdf/renderer` — no server round-trip, no cost)

### 7.12 NEW: AI Monthly Recap (optional, stretch)
- A scheduled GitHub Action calls the Anthropic API once a month with that month's aggregated JSON data and asks for a short narrative recap ("In May, GKM merged 7 PRs across 3 repositories, focused heavily on language-data tooling, and received recurring feedback on commit message structure from ToluAyodele...")
- Output is committed as a journal entry — fully reviewable before publishing, never auto-published without review

### 7.13 Admin Portal
- GitHub OAuth login (only GKM's account is ever authorized — enforced via a hardcoded GitHub user ID allow-list, not just "any GitHub login")
- Functions: Add/Edit/Delete contribution, upload screenshots, write journal entries, manage tags, manage achievements
- **Architecture note:** the admin portal does not write to a database — it writes directly to the GitHub repository via the GitHub REST API (see §8.3), making Git itself the database and audit log.

---

## 8. Technical Architecture

### 8.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         BROWSER (Client)                          │
│   React SPA (Vite build) ── reads static JSON via fetch()         │
│   ├─ Public pages (Home, Dashboard, Timeline, Analytics, etc.)    │
│   └─ Admin Portal (OAuth-gated, writes via Netlify Functions)      │
└───────────────┬───────────────────────────────┬───────────────────┘
                │ fetch (read)                   │ HTTPS (write)
                ▼                                 ▼
┌───────────────────────────┐      ┌──────────────────────────────┐
│   Netlify CDN (static)     │      │   Netlify Functions (serverless) │
│   /data/*.json             │      │   - GitHub OAuth handshake    │
│   built from repo at       │      │   - Commit-to-repo writer     │
│   deploy time               │      │   - Rate-limit guard          │
└────────────┬────────────────┘      └───────────────┬───────────────┘
             │                                         │
             ▼                                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                     GitHub Repository (source of truth)            │
│   /data/*.json   ← committed by Admin Portal OR by automation      │
│   Full git history = full audit trail, free forever                │
└───────────────┬──────────────────────────────────────────────────┘
                │ on push → triggers
                ▼
┌──────────────────────────────────────────────────────────────────┐
│   Netlify Build → redeploys static site with fresh JSON            │
└──────────────────────────────────────────────────────────────────┘
                ▲
                │ scheduled (cron)
┌───────────────┴──────────────────────────────────────────────────┐
│   GitHub Actions — "Sync Bot" (Phase 2 automation)                 │
│   Calls: GitHub GraphQL API · Gerrit REST API · GitLab API ·       │
│          MediaWiki/Wikimedia REST API · Phabricator Conduit API     │
│   Diffs against existing JSON → opens a commit/PR with new items   │
└──────────────────────────────────────────────────────────────────┘
```

**Key architectural decision: Git-as-Database.** Instead of a hosted database, all data lives as versioned JSON in the same repo as the code. This gives free, infinite history, free backups (every clone is a backup), and human-readable diffs for every change — at the cost of needing a small serverless shim for write operations, which Netlify's free tier function quota comfortably covers.

### 8.2 Frontend Architecture
- **Vite + React 18 + TypeScript**, strict mode on
- **TanStack Query** for all data fetching/caching (treats the static JSON endpoints like an API; gives free caching, retries, and stale-while-revalidate behavior even though the "API" is just static files)
- **Zustand** for small bits of client UI state (theme, command palette open/closed) — avoided Redux as overkill for a single-tenant app
- **React Router v6** for routing, with route-based code-splitting (`React.lazy`) so the Admin Portal bundle never ships to public visitors
- **react-hook-form + zod** for all admin forms, with shared zod schemas reused for runtime-validating the JSON data files themselves (one schema, two jobs: form validation + data integrity check in CI)

### 8.3 Admin Write Path (Git-as-CMS pattern)
1. GKM logs in via GitHub OAuth (Netlify Function exchanges code → token, stores a short-lived signed session cookie — token itself never touches the browser).
2. Admin Portal submits a form → POSTs to a Netlify Function.
3. Function validates payload against the zod schema, then uses the **GitHub REST API (Contents API)** to commit the updated JSON file directly to `main` (or opens a PR for review-before-publish, configurable).
4. The commit triggers a Netlify deploy webhook → site rebuilds with the new data within ~30–60 seconds.

This is the same pattern used by Git-based CMSs (e.g. Decap CMS) but built bespoke and small enough to fully own and audit.

### 8.4 Automation / Sync Pipeline (Phase 2)
A single GitHub Actions workflow, scheduled (e.g. daily at 03:00 UTC), running a small Node.js script per platform adapter:

```yaml
# .github/workflows/sync.yml
name: Sync Contributions
on:
  schedule:
    - cron: "0 3 * * *"
  workflow_dispatch: {}
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: node scripts/sync/github.mjs
      - run: node scripts/sync/gerrit.mjs
      - run: node scripts/sync/gitlab.mjs
      - run: node scripts/sync/wikimedia.mjs
      - run: node scripts/sync/phabricator.mjs
      - name: Commit changes
        run: |
          git config user.name "gkm-sync-bot"
          git config user.email "bot@gkm.dev"
          git add data/
          git diff --quiet && git diff --staged --quiet || \
            git commit -m "chore(sync): auto-update contributions [skip ci]"
          git push
```

Each adapter script (`scripts/sync/*.mjs`) is independent, idempotent, and writes only **new or changed** records (diffed by stable external ID) — never overwrites manually-curated fields like `learning_note_id` or `tags`.

### 8.5 Public API (Phase 2/3)
Rather than standing up a real backend, the "API" is just well-organized static JSON, pre-sliced at build time:

```
/api/contributions/all.json
/api/contributions/2026/06.json
/api/contributions/platform/github.json
/api/reviewers/tolu-ayodele.json
/api/achievements.json
```

This is a zero-cost JAMstack API pattern — cacheable on the CDN edge, no rate limits to manage, no server to keep alive. A short OpenAPI-style markdown doc at `/api/README.md` documents the shape for any future consumer (e.g. a recruiter's script, or GKM's own resume generator).

---

## 9. Tech Stack (Detailed)

| Layer | Choice | Why |
|---|---|---|
| Framework | React 18 + TypeScript | Original spec; strict typing prevents data-shape drift across years of JSON growth |
| Build tool | **Vite** (not CRA) | Faster builds, smaller config, actively maintained |
| Styling | **TailwindCSS** + **shadcn/ui** (Radix) | Replaces plain MUI — better matches the Linear/Vercel visual target, fully tree-shaken |
| Charts | **Recharts** | Declarative, lightweight, good defaults for the analytics suite |
| Data fetching/cache | **TanStack Query** | Caching layer over static JSON "API" |
| Client state | **Zustand** | Minimal boilerplate vs Redux |
| Forms/validation | **react-hook-form + zod** | Shared schemas for forms and data integrity |
| Search | **Fuse.js** | Zero-backend fuzzy search |
| Animation | **Framer Motion** | Page transitions, micro-interactions |
| Icons | **Lucide React** | Open source, consistent stroke icons |
| Markdown rendering | **react-markdown + remark-gfm** | Learning Journal entries |
| PDF export | **@react-pdf/renderer** | Client-side resume export, no server |
| Command palette | **cmdk** | ⌘K navigation |
| Routing | **React Router v6** | Standard, well-supported |
| Testing (unit) | **Vitest + React Testing Library** | Vite-native, fast |
| Testing (e2e) | **Playwright** | Cross-browser, reliable |
| Linting/format | **ESLint + Prettier + Husky/lint-staged** | Pre-commit gates |
| CI | **GitHub Actions** | Lint, test, build, schema-validate on every PR; sync bot (§8.4) |
| Hosting | **Netlify** (Cloudflare Pages as fallback) | Free tier, functions, deploy previews |
| Serverless functions | **Netlify Functions** | OAuth handshake, commit writer |
| Data storage | **JSON in Git** (Git-as-DB) | Free, versioned, auditable — see §8.1 |
| Auth | **GitHub OAuth App** | Single allow-listed admin user |
| Search engine (client) | Fuse.js | as above |
| PWA | **vite-plugin-pwa** | Installable, offline-readable cache of last-synced data |
| Privacy-friendly analytics | **Plausible or Umami (self-hosted free tier) / Netlify Analytics** | Avoids Google Analytics; aligned with OSS values |
| Error tracking | **Sentry (free tier)** | Frontend error visibility |
| SEO/prerender | **vite-plugin-sitemap** + prerendering for public routes | Crawlable contribution pages |
| AI recap (optional) | **Anthropic API** | Monthly narrative recap, human-reviewed before publish |

---

## 10. Data Model

All entities live under `/data/*.json`, validated in CI against zod/JSON-schema before merge.

```ts
// Contribution
{
  "id": "c_0512",
  "title": "Add Tsishingini (tsw) language metadata",
  "description": "Added ISO metadata and generator script entries for tsw.",
  "platform": "gerrit" | "github" | "gitlab" | "wikipedia" | "phabricator",
  "status": "merged" | "open" | "rejected" | "under_review",
  "repository": "language-data",
  "task_id": "T428848",
  "pr_or_change_id": "#503",
  "reviewers": ["ToluAyodele", "Srish"],
  "review_notes": ["Always run generator script before adding language data."],
  "tags": ["i18n", "language-data"],
  "screenshots": ["/uploads/c_0512_diff.png"],
  "links": ["https://gerrit.wikimedia.org/r/c/.../1302995"],
  "date_started": "2026-06-15",
  "date_completed": "2026-06-18",
  "time_spent_minutes": 90,
  "learning_note_id": "j_2026-06-18",
  "related_contribution_ids": []
}
```

```ts
// Reviewer
{
  "id": "r_tolu_ayodele",
  "name": "ToluAyodele",
  "platforms": ["gerrit"],
  "feedback": [
    {
      "date": "2026-06-18",
      "category": "process" | "code_style" | "domain_knowledge" | "tooling",
      "text": "Always run generator script before adding language data.",
      "applied_in": ["c_0512"],
      "internalized": true
    }
  ]
}
```

```ts
// Achievement
{
  "id": "a_first_pr",
  "title": "First Merged PR",
  "tier": "bronze" | "silver" | "gold",
  "unlocked_at": "2025-09-01T10:00:00Z",
  "icon": "first-pr.svg"
}
```

Folder layout:

```
data/
  contributions.json
  reviewers.json
  achievements.json
  journal/
    2026-06-18.md
  github.json
  gitlab.json
  gerrit.json
  wikimedia.json
  phabricator.json
schemas/
  contribution.schema.ts
  reviewer.schema.ts
scripts/
  sync/
    github.mjs
    gerrit.mjs
    gitlab.mjs
    wikimedia.mjs
    phabricator.mjs
  validate-data.mjs
src/
  components/
  pages/
  hooks/
  lib/
  store/
netlify/
  functions/
    oauth-callback.ts
    commit-writer.ts
```

---

## 11. Security & Privacy

- Admin write access gated by GitHub OAuth + hardcoded user-ID allow-list (defense in depth: even a leaked OAuth app secret can't authorize a different GitHub account).
- GitHub tokens never reach the browser; session is a short-lived signed cookie issued by the Netlify Function.
- All markdown (journal entries) sanitized with **DOMPurify** before rendering to prevent stored-XSS via self-authored content (defensive even for a single-author site).
- Secrets (`GITHUB_OAUTH_SECRET`, `ANTHROPIC_API_KEY` if AI recap is enabled) stored only in Netlify environment variables — never committed.
- CSP headers set via Netlify `_headers` file; no third-party scripts beyond self-hosted fonts and the chosen privacy-friendly analytics.

---

## 12. Performance Strategy

- Route-based code splitting; Admin bundle (~30% of total JS) never shipped to anonymous visitors.
- Static JSON served from CDN edge with long cache + `stale-while-revalidate`.
- Images (screenshots) compressed at upload time (client-side, via `browser-image-compression`) before commit, capped at 200KB.
- Target Lighthouse scores: Performance ≥ 95, Accessibility ≥ 95, SEO ≥ 95, Best Practices = 100.

---

## 13. Accessibility

- WCAG 2.1 AA as the explicit bar.
- All interactive elements keyboard-reachable; command palette is fully keyboard-driven by design.
- Color contrast verified for both themes (all status pill colors checked against their backgrounds at ≥ 4.5:1).
- `prefers-reduced-motion` respected for all Framer Motion animations.
- Automated a11y checks (`axe-core`) run in CI against key routes.

---

## 14. Testing Strategy

| Type | Tool | Coverage target |
|---|---|---|
| Unit | Vitest | Hooks, data-aggregation utils, zod schemas |
| Component | React Testing Library | Cards, filters, status pills, command palette |
| E2E | Playwright | Critical paths: filter dashboard, view timeline day, search, admin login + add contribution |
| Data integrity | Custom script (`validate-data.mjs`) in CI | Every JSON file validated against its schema on every PR and after every sync run |
| Accessibility | axe-core (CI) | Homepage, Dashboard, Contribution detail, Admin |

---

## 15. Monitoring & Analytics

- **Plausible/Umami** (privacy-respecting, no cookies) for visitor analytics on the public site.
- **Sentry** free tier for client-side error capture.
- GitHub Actions workflow status (sync bot success/failure) surfaces as a small "last synced" badge in the footer, sourced from a `last_sync.json` timestamp file.

---

## 16. Roadmap

**Phase 1 — MVP (manual curation)**
Homepage, Dashboard, Timeline, Contribution DB, Learning Journal, Reviewer KB, Analytics, Achievements, Git-as-CMS Admin Portal, dark/light themes, command palette, search.

**Phase 2 — Automation**
GitHub Actions sync bot for GitHub/Gerrit/GitLab/Wikimedia/Phabricator, public JSON API, PWA offline support, resume export.

**Phase 3 — Advanced**
AI monthly recap, sitemap/SEO prerendering, streak/achievement expansion, i18n (Hindi/English toggle for the public site), Sentry + full monitoring, visual regression testing.

---

## 17. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| External API rate limits (GitHub/Gerrit/etc.) during sync | Incremental sync (only fetch since last successful run), exponential backoff |
| Netlify free-tier function/bandwidth limits | Static-first architecture keeps function usage minimal (writes only, not reads) |
| JSON file growth over years hurting load time | Yearly sharding of `contributions.json` (e.g. `contributions-2026.json`) once file exceeds ~500KB |
| Schema drift between manual and automated entries | Single shared zod schema enforced in CI for both write paths |
| Single point of failure (GKM's GitHub account) | Repo is the backup; full git history; could add a secondary OAuth admin later if needed |

---

## 18. Success Criteria (refined)

The platform must answer, for **any** day, week, month, or year, without leaving the site:

- What did GKM contribute, and where?
- Who reviewed it, and what did they say?
- What was learned, and was that lesson applied later?
- What's merged vs. still open?
- How does this period compare to the contributor's own history (streaks, growth trend)?

All of the above must load in under 2 seconds on a median mobile connection, in both light and dark mode, with zero recurring cost.
