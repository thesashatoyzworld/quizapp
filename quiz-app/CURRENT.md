# TheSasha — Cabinet: Current State

## What was built

### Cabinet structure (`/cabinet`)
5 sections accessible from the bottom nav and dashboard:

1. **Материалы** (`/cabinet/materials`) — Full content catalog with free/paid gating
2. **Методички** (`/cabinet/metodichki`) — Step-by-step guides and frameworks
3. **Анонсы** (`/cabinet/announcements`) — News and updates
4. **Календарь** (`/cabinet/calendar`) — Upcoming events
5. **Лента Коннектора** (`/cabinet/feed`) — Sasha's insights + personalized recs by archetype

### Free/Paid content gating
- All content is visible to everyone (titles, descriptions)
- Free items are marked with a `FREE` badge
- Locked items show a lock icon and blurred/dimmed state
- Paywall CTAs direct users to `/connectors`
- Access is determined by checking user's purchases against product slugs

### New API routes
- `GET /api/cabinet/catalog?telegramId=` — Returns full catalog with access flags
- `GET /api/cabinet/metodichki?telegramId=` — Returns all metodichki with access flags
- `GET /api/cabinet/connector-feed` — Returns Sasha's feed posts

### Data architecture
- Catalog items, metodichki, and connector feed posts are in `src/data/cabinet-content.ts` (static data)
- Access gating uses the existing Prisma `Purchase -> Product` relationship
- Free items have `isFree: true`, paid items reference a `productSlug`

## What remains TODO

### Content
- [ ] Replace placeholder URLs (`https://example.com/...`) with real content URLs
- [ ] Add real connector feed posts from Sasha
- [ ] Add real metodichki content
- [ ] Update announcements and calendar events with current data

### Features
- [ ] Admin panel for managing catalog items (currently static data in code)
- [ ] Material viewer within the app (currently opens external URLs)
- [ ] Push notifications for new announcements
- [ ] Progress tracking for metodichki (mark steps as completed)
- [ ] Search/filter within materials and metodichki

### Polish
- [ ] Test on real Telegram Mini App (current testing is web-only)
- [ ] Verify payment flow: purchase -> cabinet access update
- [ ] Add skeleton loading states instead of spinner
- [ ] Add "new" badges for recently added content
- [ ] Test responsive layout on various screen sizes
- [ ] Consider adding breadcrumb navigation for deeper pages

### Infrastructure
- [ ] Move catalog data from static files to database (when admin panel is ready)
- [ ] Add caching for catalog/metodichki API responses
- [ ] Consider edge caching for static content sections
