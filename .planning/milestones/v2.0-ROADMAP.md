# Roadmap: TheSasha Quiz Funnel

## Milestones

- ✅ **v1.0 MVP** - Phases 1-3 (shipped 2026-02-06)
- ✅ **v1.1 Polish & Conversion** - Phases 4-6 (mostly complete)
- 🚧 **v2.0 Result Page WOW Effect** - Phases 8-10 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-3) - SHIPPED 2026-02-06</summary>

### Phase 1: Quiz Web App
**Goal**: Launch working quiz with cyberpunk design and result calculation
**Requirements**: QUIZ-01, QUIZ-02, QUIZ-03, QUIZ-04, QUIZ-05, DESIGN-01
**Status**: Complete

### Phase 2: Telegram Mini App
**Goal**: Deploy quiz as Telegram Mini App with user identification
**Requirements**: TG-01, TG-02, TG-03
**Status**: Complete

### Phase 3: Deploy
**Goal**: Deploy to Vercel with working domain
**Requirements**: DEPLOY-01, DEPLOY-02
**Status**: Complete

**Post-MVP work (done manually):**
- Payment integration (PAY-01)
- Event tracking via Notion (TRACK-01)
- Follow-up messaging pipeline (FOLLOW-01, FOLLOW-02)
- Subscription gating (SUB-01)

</details>

---

<details>
<summary>✅ v1.1 Polish & Conversion (Phases 4-6) - MOSTLY COMPLETE</summary>

**Milestone Goal:** Transform quiz results from text-heavy pages into visual diagnostic dashboards with analytics, charts, and gamification. Complete and verify follow-up messaging pipeline.

**Target outcome:** Higher conversion through clearer value presentation, verified follow-up nurturing for non-buyers.

---

### Phase 4: Result Layout Refactoring

**Goal:** Clean, consistent, mobile-responsive result pages with shared component system.

**Depends on:** v1.0 Phase 3 (Deploy)

**Requirements:** LAYOUT-01, LAYOUT-02, LAYOUT-03, LAYOUT-04

**Success Criteria** (what must be TRUE):
1. All 5 result pages use shared components for headers, cards, case studies, and CTAs
2. Typography is consistent across all results (same heading sizes, spacing, font weights)
3. Result pages display correctly on mobile devices without layout breaks or horizontal scrolling
4. Repeating content blocks (case studies, lists, CTA sections) have uniform styling

**Status:** Complete (2026-02-07)

Plans:
- [x] 04-01-PLAN.md — Shared component library + typography/CSS system
- [x] 04-02-PLAN.md — Refactor all 5 result pages to use shared components

---

### Phase 5: Visual Analytics

**Goal:** Users see their quiz results as interactive charts and visual metrics, making their diagnostic profile concrete and actionable.

**Depends on:** Phase 4 (Result Layout Refactoring)

**Requirements:** VIZ-01, VIZ-02, VIZ-03, VIZ-04, VIZ-05

**Success Criteria** (what must be TRUE):
1. User sees radar chart showing their scores across 5 categories (Content Quality, Client Understanding, Messaging Clarity, Sales Structure, Action Capability)
2. User sees their current level (1-5) displayed with visual rank indicator in Solo Leveling style
3. User sees financial metrics (potential losses or gaps) visualized with gauge or progress indicator
4. User sees audience composition breakdown (clients vs students vs random) in donut chart format
5. Visual blocks are integrated into result pages without disrupting reading flow or overshadowing CTA buttons

**Status:** 3/4 plans complete (chart integration superseded by v2.0)

Plans:
- [x] 05-01-PLAN.md — Install Recharts, propagate scores to result components, define chart data
- [x] 05-02-PLAN.md — Radar chart + level badge + level path components
- [x] 05-03-PLAN.md — Financial gauge + audience donut chart components
- [ ] 05-04-PLAN.md — Integration superseded by v2.0 VIS-01

---

### Phase 6: Follow-up Messaging

**Goal:** Verified end-to-end follow-up pipeline sending personalized messages to non-buyers, and proper post-payment communication.

**Depends on:** Phase 4 (independent of Phase 5 visual work)

**Requirements:** MSG-01, MSG-02, MSG-03

**Success Criteria** (what must be TRUE):
1. Non-buyer who completes quiz receives 4 personalized follow-up messages from bot at correct intervals (based on their result type)
2. Buyer who completes payment receives confirmation message with masterclass materials via Telegram bot
3. Admin receives Telegram notifications for all critical events (quiz completion, payment received, errors)

**Status:** Complete, E2E verified (2026-02-09)

Plans:
- [x] 06-01-PLAN.md — Fix cron schedule, first-message delay, blocked user detection, dry-run mode
- [x] 06-02-PLAN.md — Admin chat_id auto-capture, post-payment channel invite, mid-sequence thank-you, error notifications
- [x] 06-03-PLAN.md — Set Vercel env vars, deploy, and end-to-end verification

---

### Phase 7: End-to-End Testing

**Goal:** Full confidence in funnel quality through AI-driven user journey walkthroughs and UX audit.

**Depends on:** Phase 4, Phase 5, Phase 6 (all features complete)

**Requirements:** TEST-01, TEST-02, TEST-03, TEST-04

**Status:** Deferred to v2.0 Phase 10

</details>

---

## 🚧 v2.0 Result Page WOW Effect (In Progress)

**Milestone Goal:** Transform result pages into emotionally impactful visual experiences that drive engagement and sharing. Users see stunning, personalized diagnostics that they want to share.

**Target outcome:** Higher emotional resonance → higher conversion. Viral coefficient > 1.0 through shareability.

---

### Phase 8: Chart Integration + Hero Section

**Goal:** Users see their quiz results as striking visual diagnostics with personalized hero section on first load.

**Depends on:** Phase 4 (layout system), Phase 5 (chart components exist)

**Requirements:** VIS-01, VIS-02, EMO-01, EMO-03, CONS-01

**Note:** VIS-01 (chart integration) was already completed during Phase 5 plans 01-03 — all 5 result pages already import and render all chart components. Phase 8 focuses on the hero section (VIS-02, EMO-01, EMO-03) and mobile verification (CONS-01).

**Success Criteria** (what must be TRUE):
1. User sees personalized hero section with their Telegram name/avatar, result type badge, and level indicator immediately after loading result page
2. User sees all existing chart components (radar, gauge, donut, level) integrated into all 5 result pages with real quiz data flowing through
3. User sees financial impact displayed prominently in large numbers (rubles lost/potential) with visual emphasis
4. Charts and metrics render identically on 480px mobile and desktop viewport without layout breaks or horizontal scrolling
5. Visual hierarchy guides user from hero → diagnostics → CTA without distraction

**Plans:** 2 plans

Plans:
- [x] 08-01-PLAN.md — Create HeroSection component with Telegram personalization, LevelBadge, financial impact display, and responsive CSS (VIS-02, EMO-01, EMO-03)
- [x] 08-02-PLAN.md — Integrate HeroSection into all 5 result pages, pass user data from page.tsx, verify mobile rendering (CONS-01)

---

### Phase 9: Animations + Emotional Design

**Goal:** Users experience smooth, delightful animations that reveal insights progressively and emotionally contrast before/after states.

**Depends on:** Phase 8 (visual structure in place)

**Requirements:** VIS-03, VIS-04, VIS-05, EMO-02

**Success Criteria** (what must be TRUE):
1. User sees loading screen with "Analyzing your answers..." animation for 2-3 seconds before result reveal
2. User sees charts and sections animate smoothly into view as they scroll (stagger effect, triggered by intersection observer)
3. User sees visual accents highlighting key insights (quotes, numbers, pain points) with subtle emphasis animations
4. User sees before/after comparison visualizing their current state vs post-masterclass potential (financial, capability, audience quality)
5. Animations enhance emotional impact without slowing page load or causing jank on mobile

**Plans:** 2 plans

Plans:
- [x] 09-01-PLAN.md — AnalyzingLoader component + ScrollReveal scroll-triggered animations with CSS keyframes + Intersection Observer (VIS-03, VIS-04)
- [x] 09-02-PLAN.md — Visual accent CSS classes + BeforeAfterComparison data-driven component (VIS-05, EMO-02)

---

### Phase 10: Shareability + Testing

**Goal:** Users can capture and share their results effortlessly, and all platforms render results correctly.

**Depends on:** Phase 9 (visual experience complete)

**Requirements:** SHARE-01, SHARE-02, SHARE-03, CONS-02, TEST-01, TEST-02, TEST-03, TEST-04

**Success Criteria** (what must be TRUE):
1. User sees share button that generates screenshot of hero section in 9:16 format optimized for Instagram Stories/Telegram
2. User can tap Telegram native share button to forward their result link to friends
3. Shared screenshot renders correctly across all platforms (iOS/Android/Desktop Telegram clients)
4. AI successfully completes buyer journey (quiz → subscription → result → payment → materials) without errors
5. AI successfully completes non-buyer journey (quiz → result → follow-up messages on schedule) without errors
6. AI identifies UX friction points and all critical issues are fixed with follow-up verification

**Plans:** 3 plans

Plans:
- [ ] 10-01-PLAN.md — Screenshot generation with html-to-image + Telegram native share (SHARE-01, SHARE-02, SHARE-03)
- [ ] 10-02-PLAN.md — Cross-platform testing on iOS/Android/Desktop (CONS-02)
- [ ] 10-03-PLAN.md — AI-driven end-to-end testing (buyer + non-buyer + UX audit) (TEST-01, TEST-02, TEST-03, TEST-04)

---

## Progress

**Execution Order:**
v1.0 phases complete → Phase 4 → Phase 5 (partial) → Phase 6 → Phase 8 → Phase 9 → Phase 10

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Quiz Web App | v1.0 | 3/3 | Complete | 2026-01-31 |
| 2. Telegram Mini App | v1.0 | 2/2 | Complete | 2026-02-01 |
| 3. Deploy | v1.0 | 1/1 | Complete | 2026-02-01 |
| 4. Result Layout Refactoring | v1.1 | 2/2 | Complete | 2026-02-07 |
| 5. Visual Analytics | v1.1 | 3/4 | Superseded | 2026-02-08 |
| 6. Follow-up Messaging | v1.1 | 3/3 | Complete | 2026-02-09 |
| 7. End-to-End Testing | v1.1 | - | Deferred to Phase 10 | - |
| 8. Chart Integration + Hero | v2.0 | 2/2 | Complete | 2026-02-10 |
| 9. Animations + Emotional Design | v2.0 | 2/2 | Complete | 2026-02-10 |
| 10. Shareability + Testing | v2.0 | 0/3 | Planned | - |

---

## Coverage

### v1.1 requirements (16 total)

| Category | Count | Phase | Status |
|----------|-------|-------|--------|
| LAYOUT-01..04 | 4 | Phase 4 | ✅ Complete |
| VIZ-01..05 | 5 | Phase 5 | ⚠️ Partial (superseded) |
| MSG-01..03 | 3 | Phase 6 | ✅ Complete |
| TEST-01..04 | 4 | Phase 7 → Phase 10 | ➡️ Moved to v2.0 |

### v2.0 requirements (13 total) — 100% coverage ✓

| Requirement | Phase | Status |
|-------------|-------|--------|
| VIS-01 | Phase 8 | Planned |
| VIS-02 | Phase 8 | Planned |
| VIS-03 | Phase 9 | Planned |
| VIS-04 | Phase 9 | Planned |
| VIS-05 | Phase 9 | Planned |
| EMO-01 | Phase 8 | Planned |
| EMO-02 | Phase 9 | Planned |
| EMO-03 | Phase 8 | Planned |
| SHARE-01 | Phase 10 | Planned |
| SHARE-02 | Phase 10 | Planned |
| SHARE-03 | Phase 10 | Planned |
| CONS-01 | Phase 8 | Planned |
| CONS-02 | Phase 10 | Planned |
| TEST-01 | Phase 10 | Planned |
| TEST-02 | Phase 10 | Planned |
| TEST-03 | Phase 10 | Planned |
| TEST-04 | Phase 10 | Planned |

**No orphaned requirements.**

---

*Roadmap created: 2026-01-31*
*Last updated: 2026-02-10 (Phase 9 complete)*
