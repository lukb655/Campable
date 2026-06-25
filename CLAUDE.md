# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Campable** is a shared camping planning PWA. The entire frontend lives in a single `index.html` file — no build step, no bundler, no `node_modules`. React 18, Babel standalone, and Leaflet are loaded from CDN. The only server-side code is `api/config.js`, a Vercel serverless function that exposes Firebase credentials from environment variables.

## Running locally

Open `index.html` directly in a browser for the local/demo mode (uses `localStorage`). For live Firebase mode, use Vercel's dev server:

```
vercel dev
```

This serves `index.html` and makes `/api/config` available so Firebase initialises. Without it, the app falls back to single-device localStorage mode automatically.

## Architecture

### Data layer (dual-mode)

The app has two data backends, selected at runtime based on whether `/api/config` returns a valid `projectId`:

- **Live mode** — Firebase Auth (email/password) + Firestore. Collections: `trips` (all trip data including members, meals, trails, photos as embedded arrays), `profiles` (photo per user).
- **Local mode** — `localStorage` with keys `campable:users`, `campable:session`, `campable:trips`. Uses a weak hash for passwords (intentionally, documented in code). Join-by-code only works in Firebase mode.

`HAS_FB` is the runtime boolean that every `Auth.*` and `Data.*` method branches on.

### Routing

Simple string-based router: `route.name` is `"trips"` | `"trip"` | `"me"`. No library. State lives in the `App` component.

### Component structure

- `App` — auth gate, trip subscription, route switching
- `Home` — trip list grouped by year + `AllTripsMap` (Leaflet, collapses on mobile)
- `TripShell` — fixed-layout shell with sticky hero image and bottom tab bar (`OverviewTab`, `CrewTab`, `MealsTab`, `MapTab`, `TripSettingsTab`)
- `Profile` — account management, privacy policy, delete account

### Styles

All styles are inline JS objects in the `St` constant near the bottom of `index.html`. CSS variables for the colour palette are in `:root` in the `<style>` block at the top.

### Icons

All SVGs are inline React components in the `Ic` object. Use `ic(n)` to get `{width:n, height:n, flexShrink:0}` props.

## Firebase environment variables

Set these in Vercel (or a local `.env` for `vercel dev`):

```
FIREBASE_API_KEY
FIREBASE_AUTH_DOMAIN
FIREBASE_PROJECT_ID
FIREBASE_STORAGE_BUCKET
FIREBASE_MESSAGING_SENDER_ID
FIREBASE_APP_ID
FIREBASE_MEASUREMENT_ID   # optional
```

`api/config.js` serves them at `/api/config` with `Cache-Control: no-store`.

## Key constraints

- **No build step** — JSX is transpiled in-browser by Babel standalone. Keep all code in `index.html` (inside the `<script type="text/babel">` block) unless adding a new Vercel API route under `api/`.
- **Photos stored as data URLs** — compressed to JPEG via canvas (`fileToCompressedDataURL`) and stored inside Firestore trip documents. There is no Firebase Storage.
- **Trip documents are denormalised** — members, meals, trails, and photos are all embedded arrays on the trip document. `Data.updateTrip` always patches the whole array.
- **Firestore security rules** — the `joinByCode` query does `where("code","==",code)`, so rules must allow authenticated users to query trips by code even if they are not yet a member.
