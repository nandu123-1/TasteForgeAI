# TasteForge AI

TasteForge AI is a responsive, multi-page food-intelligence website. It ranks a seeded meal catalog against an editable Taste DNA profile, removes incompatible meals before scoring, explains every match, and persists saves, feedback, settings, and demo orders.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The offline demo works without credentials.

Quality checks:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Firebase setup

1. Create a Firebase project and a Web app.
2. Enable **Authentication → Google**.
3. Create a Firestore database.
4. Copy `.env.example` to `.env.local` and enter the Web app values.
5. Add `localhost` and each deployed hostname under **Authentication → Settings → Authorized domains**.
6. Deploy `firestore.rules` with the Firebase CLI or paste them into the Firestore Rules editor.

The browser loads the official modular Firebase Web SDK from Google's CDN. This keeps the current constrained build dependency-free while retaining `initializeApp`, `getApps`, Google popup authentication, auth-state observation, Firestore reads/writes, merge semantics, and server timestamps.

## Routes

- `/` — public landing page
- `/login` — Google sign-in and offline demo entry
- `/onboarding` — first-run Taste DNA setup
- `/dashboard` — personalized overview
- `/discover` — search, filter, sort, save, dismiss, like, and order
- `/recommendations` — context-driven Food Lab generator
- `/meal/[id]` — meal details and explanation
- `/taste-dna` — editable profile and hard safety rules
- `/saved`, `/history`, `/profile`, `/settings`, `/seasonal`, `/surprise-me`

Unknown URLs render a branded 404 screen. Protected URLs redirect signed-out visitors to `/login` and preserve the return path.

## Recommendation architecture

Allergy conflicts, ingredient exclusions, and strict vegetarian/vegan conflicts are hard filters. Compatible meals receive a deterministic weighted score:

- taste affinity: 40%
- dietary fit: 20%
- interaction/order history: 15%
- seasonal relevance: 10%
- health fit: 10%
- current context: 5%

Scores and human-readable reasons are calculated in `lib/model.ts`. Likes, saves, dismissals, ratings, and orders alter persisted state and subsequent ranking.

## Persistence

- Offline demo: browser `localStorage`
- Signed-in mode: merged document at `users/{uid}` in Firestore
- Security: `firestore.rules` limits each user document and its subcollections to that authenticated owner

This prototype does not process payments or submit real restaurant orders.
