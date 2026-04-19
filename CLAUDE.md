# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint via Next.js
```

No test runner is configured beyond Playwright (`npm run test` is not defined); run Playwright tests directly with `npx playwright test`.

## Architecture

**kelp-your-neighbor** is a Next.js 15 (App Router) community event discovery platform for Monterey County. Users can browse events on an interactive map and create new events with geolocation.

### Data flow

- **Phase 1 (current):** `lib/get-events.ts` returns mock data from `lib/mock-events.ts`. The map and modals are wired up but read static fixtures.
- **Phase 2 (planned):** `get-events.ts` will query the Supabase `events` table (PostGIS `POINT(lng lat)` geometry). Carpool matching and CO₂ calculations are stubbed throughout with `// Phase 2` comments.

### Key layers

| Layer | Location | Role |
|---|---|---|
| Pages | `app/page.tsx`, `app/events/create/page.tsx`, `app/map/page.tsx` | Route entry points |
| Components | `components/` | FilterBar, EventMap (Leaflet), EventModal, HeroSection |
| Event creation | `app/events/create/event-create-form.tsx` | Form with Photon Komoot autocomplete + Nominatim reverse geocode, validates Monterey County, inserts to Supabase |
| Location picker | `app/events/create/flare-map-client.tsx` | Client-only Leaflet map for picking coordinates |
| Supabase clients | `utils/supabase/client.ts` (browser), `utils/supabase/server.ts` (server/RSC) | Never import the server client from a client component |
| Event sync | `app/api/sync-ticketmaster/route.ts` | POST — daily Vercel cron (00:00 UTC) that fetches Ticketmaster events and upserts by `external_id` |

### Map rendering

Leaflet (`react-leaflet`) is imported only in client components. `reactStrictMode` is disabled in `next.config.ts` to avoid the "Map container already initialized" double-mount error. Any new map component must be dynamically imported (`next/dynamic` with `ssr: false`).

### Event types & colors

`lib/event-colors.ts` maps event type strings (e.g. `"Music"`, `"Sports"`) to hex colors used for circle markers on the map. Add new types here first before referencing them elsewhere.

### Auth

Supabase Auth with OAuth callback at `app/auth/callback/route.ts`. Event creation (`event-create-form.tsx`) requires an authenticated session; the server-side Supabase client reads the session via cookies.

### Environment variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `TICKETMASTER_API_KEY` (for the sync cron)
