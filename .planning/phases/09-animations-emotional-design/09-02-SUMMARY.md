---
phase: 09-animations-emotional-design
plan: 02
subsystem: ui
tags: [visual-accents, before-after, emotional-design, conversion, data-driven]

# Dependency graph
requires:
  - phase: 09-animations-emotional-design
    plan: 01
    provides: ScrollReveal and AnalyzingLoader animations foundation
  - phase: 08-chart-integration-hero
    provides: chart-data.ts with radar and financial data types
provides:
  - Visual accent CSS classes (accent-quote, accent-number, accent-pain, accent-insight)
  - BeforeAfterComparison component showing personalized current vs potential transformation
  - Enhanced emotional impact on all 5 result pages with strategic accents
affects: [10-shareability-testing, future-conversion-optimizations]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Data-driven personalization: BeforeAfterComparison uses real quiz radar scores + financial data"
    - "Surgical accent application: max 2-3 per page to maintain impact"
    - "Pure CSS visual effects: subtle pulses and glows without external libraries"

key-files:
  created:
    - quiz-app/src/components/results/shared/BeforeAfterComparison.tsx
  modified:
    - quiz-app/src/app/globals.css
    - quiz-app/src/components/results/shared/index.ts
    - quiz-app/src/components/results/InvisibleResult.tsx
    - quiz-app/src/components/results/DoerResult.tsx
    - quiz-app/src/components/results/GenerousResult.tsx
    - quiz-app/src/components/results/UnstableResult.tsx
    - quiz-app/src/components/results/ScaleResult.tsx

key-decisions:
  - "BeforeAfterComparison positioned before CTA for maximum conversion impact - shows transformation right before purchase decision"
  - "Used radar data's 2 weakest dimensions + projected 60% improvement to personalize transformation vision"
  - "Visual accents applied surgically (2-3 per page) - less is more for maintaining impact"
  - "accent-number uses subtle pulse animation (3s cycle) to draw eye without overwhelming"

patterns-established:
  - "BeforeAfterComparison pattern: show user's diagnostic data transformed, not generic promises"
  - "Visual accent hierarchy: quote (philosophy) > number (proof) > insight (key takeaway)"
  - "Responsive before/after: side-by-side desktop, stacked mobile with arrow direction change"

# Metrics
duration: 8.72min
completed: 2026-02-10
---

# Phase 9 Plan 02: Visual Accents + Before/After Comparison Summary

**Data-driven BeforeAfterComparison component and 4 visual accent CSS classes integrated across all 5 result pages for enhanced emotional impact and conversion**

## Performance

- **Duration:** 8.72 min (523 seconds)
- **Started:** 2026-02-10T11:19:32Z
- **Completed:** 2026-02-10T11:28:15Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- Created BeforeAfterComparison component that shows user's personalized transformation using their quiz data (2 weakest radar dimensions + financial potential)
- Added 4 visual accent CSS classes with subtle animations: accent-quote (cyan border glow), accent-number (pulse), accent-pain (danger border), accent-insight (icon badge)
- Integrated BeforeAfterComparison into all 5 result pages positioned strategically before CTA for maximum conversion impact
- Applied 2-3 visual accents per result page to key quotes, numbers, and insights (e.g., "300+ экспертам", "топ-15%")
- Responsive layout: side-by-side on desktop, stacked on mobile with arrow direction change (→ becomes ↓)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add visual accent CSS and create BeforeAfterComparison component** - `c7ca448` (feat)
2. **Task 2: Integrate BeforeAfterComparison and visual accents into all 5 result pages** - `0624bae` (feat)

## Files Created/Modified

- `quiz-app/src/components/results/shared/BeforeAfterComparison.tsx` - NEW: Data-driven before/after showing current weak dimensions vs projected improvement
- `quiz-app/src/app/globals.css` - Added visual accent CSS (accent-quote, accent-number, accent-pain, accent-insight) + before-after-comparison responsive styles
- `quiz-app/src/components/results/shared/index.ts` - Exported BeforeAfterComparison
- `quiz-app/src/components/results/InvisibleResult.tsx` - Added BeforeAfterComparison + accents on "300+ экспертам" and key quote
- `quiz-app/src/components/results/DoerResult.tsx` - Added BeforeAfterComparison + accents on key insight and "300+ экспертам"
- `quiz-app/src/components/results/GenerousResult.tsx` - Added BeforeAfterComparison + accents on "не ту систему" quote and "300+ экспертам"
- `quiz-app/src/components/results/UnstableResult.tsx` - Added BeforeAfterComparison + accents on key insight and "300+ экспертам"
- `quiz-app/src/components/results/ScaleResult.tsx` - Added BeforeAfterComparison + accents on "топ-15%" and key quote

## Decisions Made

**1. BeforeAfterComparison uses personalized quiz data (not generic promises)**
- **Rationale:** Shows user THEIR specific weak points transforming, not a generic "before/after". Uses radar data (2 lowest scores) + financial data (current vs potential income) to create personalized vision of transformation. This is psychologically more powerful than generic promises.

**2. Position BeforeAfterComparison right before CTA section**
- **Rationale:** Conversion optimization - user sees their personalized transformation vision immediately before the purchase decision point. Creates emotional peak at moment of CTA.

**3. Surgical accent application: max 2-3 per page**
- **Rationale:** Less is more. Too many accents dilute impact. Carefully selected key moments: main stat (300+), key philosophical insight, or transformation promise. Preserves readability while enhancing emotional peaks.

**4. accent-number uses 3s pulse instead of constant glow**
- **Rationale:** Subtle movement draws eye periodically without becoming distracting wallpaper. Matches existing neonPulse aesthetic (reduced intensity for readability).

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all tasks completed without errors. Build succeeded on first attempt for both tasks.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Phase 9 Plan 03 (if exists):**
- Visual accents and before/after comparison enhance emotional resonance
- BeforeAfterComparison could be enhanced with animations in future plans

**Ready for Phase 10 (Shareability + Testing):**
- Visual accents make result pages more visually striking for screenshots/sharing
- BeforeAfterComparison creates shareable "wow" moment showing transformation potential
- Data-driven personalization increases shareability ("look at MY results")

**Technical notes:**
- BeforeAfterComparison calculates projected improvement as: `current + ((100 - current) * 0.6)` capped at 95%
- All visual accents respect `prefers-reduced-motion` media query (accent-number pulse disabled)
- Responsive breakpoint: 600px (mobile stacks, arrow rotates 90deg)
- BeforeAfterComparison is DIFFERENT from GrowthMetric (case study before/after) - they complement each other

---
*Phase: 09-animations-emotional-design*
*Completed: 2026-02-10*
