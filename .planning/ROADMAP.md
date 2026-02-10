# Roadmap: TheSasha Quiz Funnel

## Milestones

- ✅ **v1.0 MVP** - Phases 1-3 (shipped 2026-02-06)
- ✅ **v1.1 Polish & Conversion** - Phases 4-7 (shipped 2026-02-09)
- ✅ **v2.0 Result Page WOW Effect** - Phases 8-10 (shipped 2026-02-10)
- 🚧 **v3.0 Коннекторы Upsell Funnel** - Phases 11-15 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-3) - SHIPPED 2026-02-06</summary>

- [x] Phase 1: Quiz Web App (3/3 plans) — 2026-01-31
- [x] Phase 2: Telegram Mini App (2/2 plans) — 2026-02-01
- [x] Phase 3: Deploy (1/1 plan) — 2026-02-01
- Post-MVP: PAY-01, TRACK-01, FOLLOW-01/02, SUB-01

</details>

<details>
<summary>✅ v1.1 Polish & Conversion (Phases 4-7) - SHIPPED 2026-02-09</summary>

- [x] Phase 4: Result Layout Refactoring (2/2 plans) — 2026-02-07
- [x] Phase 5: Visual Analytics (3/4 plans, 1 superseded by v2.0) — 2026-02-08
- [x] Phase 6: Follow-up Messaging (3/3 plans, E2E verified) — 2026-02-09
- [x] Phase 7: End-to-End Testing — Deferred to Phase 10

Full details: `.planning/milestones/v1.1-ROADMAP.md` (if exists)

</details>

<details>
<summary>✅ v2.0 Result Page WOW Effect (Phases 8-10) - SHIPPED 2026-02-10</summary>

- [x] Phase 8: Chart Integration + Hero Section (2/2 plans) — 2026-02-10
- [x] Phase 9: Animations + Emotional Design (2/2 plans) — 2026-02-10
- [x] Phase 10: Shareability + Testing (3/3 plans) — 2026-02-10
  - Note: ShareButton feature built then reverted (deferred to future)

Full details: `.planning/milestones/v2.0-ROADMAP.md`

</details>

---

### 🚧 v3.0 Коннекторы Upsell Funnel (In Progress)

**Milestone Goal:** Персонализированная апселл-воронка на программу "Коннекторы" (12-недельная программа, 2 тарифа, Telegram-группа)

#### Phase 11: Landing Page Foundation
**Goal**: Users can view Connectors offer landing page on mobile
**Depends on**: Phase 10 (quiz results complete)
**Requirements**: LAND-01, LAND-02, LAND-04
**Success Criteria** (what must be TRUE):
  1. User can open /connectors?type=invisible (and all 5 types) in Telegram Mini App WebView
  2. Landing displays all PDF sections (hero 500K, 3 elements, 14 days, whales, weeks 4-8, system, week 12, phases 1-3, tiers, ВАЖНО, CTA)
  3. Layout adapts to mobile screen without horizontal scroll
  4. CTA buttons are visible and positioned correctly
**Plans**: TBD

Plans:
- [ ] 11-01: [TBD during planning]

#### Phase 12: Landing Personalization
**Goal**: Landing content adapts to quiz archetype (5 text versions)
**Depends on**: Phase 11
**Requirements**: LAND-03
**Success Criteria** (what must be TRUE):
  1. Hero headline changes based on type param (invisible: "Вас никто не знает", doer: "Вы застряли в делах", etc.)
  2. Pain points section reflects archetype-specific struggles (5 versions)
  3. CTA button text personalized per archetype
  4. All 5 archetypes have complete text variations tested
**Plans**: TBD

Plans:
- [ ] 12-01: [TBD during planning]

#### Phase 13: Payment Integration
**Goal**: Users can purchase Connectors tiers and payment is recorded
**Depends on**: Phase 12
**Requirements**: PAY-02, PAY-03, ACCESS-02, TRACK-03
**Success Criteria** (what must be TRUE):
  1. User can click "Базовый 10K/нед" or "Премиум 20K/нед" and reach Prodamus payment page
  2. Webhook receives payment confirmation and identifies tier (Basic vs Premium)
  3. Payment recorded in Notion with user_id, tier, amount, timestamp
  4. Admin receives Telegram notification with user info and tier purchased
**Plans**: TBD

Plans:
- [ ] 13-01: [TBD during planning]

#### Phase 14: Upsell Chain
**Goal**: Workshop buyers receive personalized upsell messages over a week
**Depends on**: Phase 13 (payment integration complete)
**Requirements**: UPSELL-01, UPSELL-02, UPSELL-03, UPSELL-04, TRACK-02
**Success Criteria** (what must be TRUE):
  1. After workshop payment, user enters upsell queue in Notion
  2. Bot sends first message (day 1) with personalized text and link to /connectors?type=invisible
  3. Bot sends follow-up messages (day 3, day 7) if user hasn't paid for Connectors
  4. Messages stop after Connectors payment (queue checks payment status)
  5. All upsell events tracked in Notion (upsell_sent, upsell_opened via link tracking)
**Plans**: TBD

Plans:
- [ ] 14-01: [TBD during planning]

#### Phase 15: Group Access
**Goal**: Connectors buyers receive Telegram group invite
**Depends on**: Phase 14 (upsell chain working)
**Requirements**: ACCESS-01
**Success Criteria** (what must be TRUE):
  1. After Connectors payment, bot sends message with Telegram group invite link
  2. Invite link is valid and user can join group immediately
  3. Message includes tier info (Basic or Premium) and welcome instructions
**Plans**: TBD

Plans:
- [ ] 15-01: [TBD during planning]

---

## Progress

**Execution Order:**
Phases execute in numeric order: 11 → 12 → 13 → 14 → 15

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-3 | v1.0 | 6/6 | Complete | 2026-02-06 |
| 4-7 | v1.1 | 8/9 | Complete | 2026-02-09 |
| 8-10 | v2.0 | 7/7 | Complete | 2026-02-10 |
| 11. Landing Page Foundation | v3.0 | 0/1 | Not started | - |
| 12. Landing Personalization | v3.0 | 0/1 | Not started | - |
| 13. Payment Integration | v3.0 | 0/1 | Not started | - |
| 14. Upsell Chain | v3.0 | 0/1 | Not started | - |
| 15. Group Access | v3.0 | 0/1 | Not started | - |

**Total: 10 phases shipped, 5 phases planned for v3.0**

---

*Roadmap created: 2026-01-31*
*Last updated: 2026-02-10 (v3.0 roadmap created)*
