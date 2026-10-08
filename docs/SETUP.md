# Setup

## Mobile (Expo)

1. `npm install`
2. `cp .env.example .env` — set `EXPO_PUBLIC_API_URL` to your backend, e.g. `http://localhost:4000/api/v1` (physical device: use your LAN IP, not localhost).
3. `npx expo start` — scan with Expo Go. For native builds: `npx expo run:android` / `npx expo run:ios`.
4. Env handling: only `EXPO_PUBLIC_*` vars are exposed to the app. Session token lives in `expo-secure-store` (never AsyncStorage).
5. Real auth (`EXPO_PUBLIC_AUTH_MODE=api`) needs the **Email/Password provider enabled in Neon Console → Auth**, otherwise sign-in/sign-up fail. Dummy mode (default) needs nothing.

Verified stack (Expo SDK 57): `expo 57.0.26`, `react-native 0.86.3`, `react 19.2.3`,
`expo-router 57.0.24`, `reanimated 4.5.1`, `worklets 0.10.1`, `gesture-handler 2.32.0`,
`safe-area-context 5.7.0`, `screens 4.26.2`, `expo-splash-screen 57.0.9`, `typescript 6.0.3`.
Repro checks: `npm run typecheck`, `npx expo-doctor` (21/21), `npx expo export`,
backend `npm run build` + `npm test`.

## Backend

1. `cd backend && npm install`
2. `cp .env.example .env` — set `DATABASE_URL` (Neon) and `NEON_AUTH_BASE_URL` (Neon Console → Auth). No password secrets needed: credentials live in Neon Auth; the backend only verifies its JWTs.
3. `npm run db:generate && npm run db:migrate`
4. `npm run dev` — health check at `GET /health`.
5. Dev seed (local only): `ALLOW_SEED=true npm run seed`. Seed emails use `test+*.roomie.test` so they can never be confused with real users. Never run in production.

## Neon Postgres

- Create a Neon project, copy the pooled connection string with `?sslmode=require`.
- Run migrations from `backend/` with `DATABASE_URL` set.
- Tables: `users, profiles, lifestyle_preferences, likes, matches, conversations, messages, user_blocks, user_reports` — see `backend/src/db/schema.ts`.
- Indexes on `profiles(university, city, budget)`, `likes(receiver)`, `messages(conversation, created_at)`; unique pairs on likes and matches prevent duplicates.

## Photos & push

- Photos: upload via `POST /api/v1/profile/photo` (presigned-URL flow against secure object storage) — MVP stores URL only; bucket creds stay server-side.
- Push: `lib/notifications/push.ts` uses Expo Notifications. Call `registerPushToken()` after first match or from Settings, never on first launch. Without config, the app falls back to in-app updates.
