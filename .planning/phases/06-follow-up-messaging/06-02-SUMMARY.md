---
phase: 06-follow-up-messaging
plan: 02
subsystem: messaging
tags: [telegram, notion, admin-notifications, post-payment, follow-up]
requires: [notion-integration, telegram-bot, follow-up-pipeline]
provides: [admin-chat-id-storage, proper-post-payment-messaging, mid-sequence-thank-you, error-notifications]
affects: [06-03, 06-04]
tech-stack:
  added: []
  patterns: [admin-config-in-notion, env-var-fallback, mid-sequence-thank-you]
key-files:
  created: []
  modified:
    - quiz-app/src/lib/notion.ts
    - quiz-app/src/app/api/telegram-webhook/route.ts
    - quiz-app/src/app/api/prodamus-webhook/route.ts
    - quiz-app/src/app/api/track-event/route.ts
    - quiz-app/src/app/api/cron/send-followups/route.ts
decisions:
  - id: admin-chat-id-storage
    choice: Store in Notion Events DB with event_type=admin_config
    rationale: Reuses existing DB, avoids new env var requirement
  - id: admin-selection
    choice: Last user to /start bot becomes admin
    rationale: Single-admin bot design, simple for small teams
  - id: env-var-fallback
    choice: ADMIN_CHAT_ID env var takes priority over Notion
    rationale: Allows override without Notion update if needed
  - id: channel-link-fallback
    choice: Fallback message if MASTERCLASS_CHANNEL_LINK not set
    rationale: Prevents broken UX, logs warning for admin
metrics:
  duration: 5m
  completed: 2026-02-08
---

# Phase 06 Plan 02: Admin Notifications & Post-Payment Messaging Summary

**Admin chat_id capture via /start, proper channel invite post-payment, mid-sequence thank-you, and error notifications to admin.**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-08T12:19:34Z
- **Completed:** 2026-02-08T12:23:21Z
- **Tasks:** 2/2
- **Files modified:** 5

## Accomplishments

- Admin can now register their chat_id by sending /start to the bot (stored in Notion)
- Post-payment message includes actual MASTERCLASS_CHANNEL_LINK instead of placeholders
- Users who pay mid-follow-up-sequence receive a thank-you message
- Admin receives error notifications for webhook failures and cron failures
- All notification routes use getAdminChatId() (Notion-first, env var fallback)

## Task Commits

Each task was committed atomically:

1. **Task 1: Admin chat_id storage and /start handler** - `7079756` (feat)
2. **Task 2: Fix post-payment messaging and admin notifications** - `c5302f3` (feat)

## Files Created/Modified

- `quiz-app/src/lib/notion.ts` - Added saveAdminChatId and getAdminChatId functions
- `quiz-app/src/app/api/telegram-webhook/route.ts` - Call saveAdminChatId on /start
- `quiz-app/src/app/api/prodamus-webhook/route.ts` - Use MASTERCLASS_CHANNEL_LINK, send mid-sequence thank-you, notify admin on errors
- `quiz-app/src/app/api/track-event/route.ts` - Use getAdminChatId instead of env var
- `quiz-app/src/app/api/cron/send-followups/route.ts` - Use getAdminChatId, notify admin on cron errors

## Decisions Made

### 1. Admin Chat ID Storage - Notion Events DB
**Context:** ADMIN_CHAT_ID env var not set, need dynamic admin registration.

**Decision:** Store admin chat_id in Notion Events DB using event_type="admin_config".

**Rationale:** Reuses existing infrastructure, no new database or schema changes needed. Every user who sends /start saves their chat_id, last one becomes admin (single-admin bot pattern).

**Alternatives considered:**
- New Notion property - requires schema change
- Separate database - overkill for single value
- Only env var - requires deploy to change admin

**Impact:** Admin can register dynamically without code changes or redeploys.

---

### 2. Admin Selection Pattern - Last /start Wins
**Context:** Multiple users may send /start to bot.

**Decision:** Last person to /start becomes the admin (stored in Notion, updated on each /start).

**Rationale:** Single-admin bot design is sufficient for this use case. Simpler than role management.

**Alternatives considered:**
- First user only - harder to reset if needed
- Whitelist of admin IDs - requires hardcoding
- Role-based system - overkill for single admin

**Impact:** Easy to change admin by having new admin /start the bot. Noted in code comment.

---

### 3. Env Var Fallback Priority
**Context:** Need backward compatibility with existing ADMIN_CHAT_ID env var.

**Decision:** getAdminChatId() checks env var first, then Notion. Env var takes priority.

**Rationale:** Allows override without Notion update if needed (e.g., emergency admin change).

**Alternatives considered:**
- Notion only - breaks existing env var setups
- Env var only - defeats purpose of dynamic registration
- Separate functions - duplicates logic

**Impact:** Backward compatible, supports both patterns.

---

### 4. Channel Link Fallback Message
**Context:** MASTERCLASS_CHANNEL_LINK may not be set in all environments.

**Decision:** If env var missing, send fallback message "Ссылка на канал будет отправлена отдельным сообщением" and log warning.

**Rationale:** Prevents broken UX (empty link), alerts admin via logs, maintains user trust.

**Alternatives considered:**
- Fail payment webhook - breaks payment flow
- Silent failure - user gets no info
- Use placeholder - confusing for user

**Impact:** Graceful degradation, clear communication to user and admin.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

Admin must perform one-time setup:

1. **Register admin chat_id:**
   - Admin sends `/start` to @sashatoyz_bot
   - Bot saves chat_id to Notion automatically
   - Admin will now receive all notifications

2. **Set channel invite link (production):**
   - Add to Vercel env vars: `MASTERCLASS_CHANNEL_LINK=https://t.me/+...`
   - This link is sent to buyers after payment

**Verification:**
- Test payment webhook: admin should receive notification
- Test cron errors: admin should receive error notification
- Test post-payment: buyer should receive channel invite link

## Next Phase Readiness

**Phase 6 Plan 03 dependencies:**
- ✅ Admin notification system working (this plan)
- ✅ Post-payment messaging complete (this plan)
- ✅ Error notification infrastructure in place (this plan)

**Blockers:** None

**Concerns:**
- MASTERCLASS_CHANNEL_LINK env var must be set in production for proper post-payment flow
- Admin must /start bot to register for notifications

## Key Learnings

1. **Reusing existing infrastructure**: Storing admin config in Events DB via event_type="admin_config" avoided schema changes
2. **Env var fallback pattern**: Priority order (env var > Notion) provides flexibility and backward compatibility
3. **Graceful degradation**: Fallback messages for missing env vars maintain UX quality
4. **Single-admin simplicity**: Last /start wins pattern is sufficient for small teams, avoids role complexity

## Metrics

- **Duration:** 5 minutes
- **Tasks completed:** 2/2
- **Files modified:** 5
- **Commits:** 2 (7079756, c5302f3)
- **TypeScript errors:** 0

---

**Plan completed:** 2026-02-08
**Phase:** 06-follow-up-messaging
**Plan:** 02/04
