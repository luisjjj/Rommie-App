# Roomie — Find someone you'll actually enjoy living with.

A roommate discovery and matching platform for Nigeria. Built with Expo + React Native (TypeScript) and a Node.js + Express + Neon Postgres backend.

> **Central loop:** Create your profile → Discover people → Match → Talk → Decide whether you could live together.

## Monorepo layout

```
roomie-mobile/            # Expo app (root)
  app/                    # Expo Router screens
    (auth)/               # login, register
    (onboarding)/         # welcome + 7-step onboarding flow
    (tabs)/               # discover, likes, matches, profile
    profile/[id].tsx      # full profile
    chat/[id].tsx         # conversation
    settings/             # settings + safety
  components/  hooks/  lib/  store/
  constants/  theme/  types/  utils/  assets/
  backend/                # REST API (independent deployable)
    src/  drizzle/  tests/
  docs/
```

Mobile app **never** talks to Neon directly — only via `EXPO_PUBLIC_API_URL` → Backend → Drizzle → Neon.

## Quick start

### 1. Mobile app

```bash
npm install
cp .env.example .env
# set EXPO_PUBLIC_API_URL=http://localhost:4000/api/v1
npx expo start
```

Run on device with Expo Go, or:

```bash
npx expo run:android
npx expo run:ios
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# set DATABASE_URL=postgresql://... (Neon) and NEON_AUTH_BASE_URL=... (Neon Console → Auth)
npm run db:generate
npm run db:migrate
npm run dev          # http://localhost:4000/health
npm run seed         # dev-only test users, never in production
npm test
```

### 3. EAS builds

```bash
npm install -g eas-cli
eas build:configure
eas build --platform android --profile preview
eas build --platform ios --profile preview
```

## Env vars

See `.env.example` (mobile) and `backend/.env.example`. No secrets committed.

## Docs

- `docs/SETUP.md` — full local setup, Neon, storage, EAS
- `docs/API.md` — REST contract
- `docs/DATABASE.md` — schema + migrations
- `docs/RELEASE.md` — release checklist

## Product principles

1. People first, accommodation is context.
2. No fake scientific compatibility scores.
3. Privacy by default — no exact addresses, no auto-exposed contacts.
4. Built for Nigerian realities: universities, ₦ annual budgets, variable networks, common Android devices.
5. Never present seed/fake profiles as real people in production.

## License

MIT — see [LICENSE](./LICENSE).
