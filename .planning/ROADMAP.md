# Roadmap: TheSasha Quiz Funnel

## Milestones

- ✅ **v1.0 MVP** - Phases 1-3 (shipped 2026-02-06)
- 🚧 **v1.1 Polish & Conversion** - Phases 4-7 (in progress)

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

## 🚧 v1.1 Polish & Conversion (In Progress)

**Milestone Goal:** Transform quiz results from text-heavy pages into visual diagnostic dashboards with analytics, charts, and gamification. Complete and verify follow-up messaging pipeline. Test entire funnel end-to-end with AI walkthroughs.

**Target outcome:** Higher conversion through clearer value presentation, verified follow-up nurturing for non-buyers, confidence in funnel quality.

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

**Plans:** 2 plans

Plans:
- [x] 04-01-PLAN.md — Shared component library + typography/CSS system (complete 2026-02-07)
- [x] 04-02-PLAN.md — Refactor all 5 result pages to use shared components (complete 2026-02-07)

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

**Plans:** 4 plans

Plans:
- [ ] 05-01-PLAN.md — Install Recharts, propagate scores to result components, define chart data
- [ ] 05-02-PLAN.md — Radar chart + level badge + level path components (VIZ-01, VIZ-02)
- [ ] 05-03-PLAN.md — Financial gauge + audience donut chart components (VIZ-03, VIZ-04)
- [ ] 05-04-PLAN.md — Integrate all charts into 5 result pages with visual verification (VIZ-05)

---

### Phase 6: Follow-up Messaging

**Goal:** Verified end-to-end follow-up pipeline sending personalized messages to non-buyers, and proper post-payment communication.

**Depends on:** Phase 4 (independent of Phase 5 visual work)

**Requirements:** MSG-01, MSG-02, MSG-03

**Success Criteria** (what must be TRUE):
1. Non-buyer who completes quiz receives 4 personalized follow-up messages from bot at correct intervals (based on their result type)
2. Buyer who completes payment receives confirmation message with masterclass materials via Telegram bot
3. Admin receives Telegram notifications for all critical events (quiz completion, payment received, errors)

**Plans:** TBD

Plans:
- [ ] 06-01: TBD (verify cron pipeline + message delivery)
- [ ] 06-02: TBD (post-payment message + admin notifications)

---

### Phase 7: End-to-End Testing

**Goal:** Full confidence in funnel quality through AI-driven user journey walkthroughs and UX audit.

**Depends on:** Phase 4, Phase 5, Phase 6 (all features complete)

**Requirements:** TEST-01, TEST-02, TEST-03, TEST-04

**Success Criteria** (what must be TRUE):
1. AI successfully completes buyer journey (quiz -> subscription check -> result -> payment -> materials received)
2. AI successfully completes non-buyer journey (quiz -> result -> follow-up messages received on schedule)
3. AI identifies and documents UX friction points (unclear navigation, confusing elements, conversion blockers)
4. Identified issues are fixed and verified with follow-up test

**Plans:** TBD

Plans:
- [ ] 07-01: TBD (buyer journey walkthrough)
- [ ] 07-02: TBD (non-buyer journey walkthrough)
- [ ] 07-03: TBD (UX audit + iteration round)

---

## Progress

**Execution Order:**
v1.0 phases complete -> Phase 4 -> Phase 5 -> Phase 6 -> Phase 7

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Quiz Web App | v1.0 | 3/3 | Complete | 2026-01-31 |
| 2. Telegram Mini App | v1.0 | 2/2 | Complete | 2026-02-01 |
| 3. Deploy | v1.0 | 1/1 | Complete | 2026-02-01 |
| 4. Result Layout Refactoring | v1.1 | 2/2 | Complete | 2026-02-07 |
| 5. Visual Analytics | v1.1 | 0/4 | Planned | - |
| 6. Follow-up Messaging | v1.1 | 0/TBD | Not started | - |
| 7. End-to-End Testing | v1.1 | 0/TBD | Not started | - |

---

## Coverage

**v1.1 requirements mapped:** 16/16 ✓

| Category | Count | Phase |
|----------|-------|-------|
| LAYOUT-01..04 | 4 | Phase 4 |
| VIZ-01..05 | 5 | Phase 5 |
| MSG-01..03 | 3 | Phase 6 |
| TEST-01..04 | 4 | Phase 7 |

**No orphaned requirements.**

---

*Roadmap created: 2026-01-31*
*Last updated: 2026-02-07 (Phase 5 planned)*
