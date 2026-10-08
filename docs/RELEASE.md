# Release checklist

## Stage gates (don't mark complete until API-connected + states handled)
1. Foundation: Expo TS + Router + tokens + backend health + Neon migration ✅ (this scaffold)
2. Auth + onboarding: register/login → 7-step onboarding → `PATCH /profile/me`, resumable via AsyncStorage
3. Discovery: cards + full profile + FilterSheet → real `GET /discovery` + like/pass + match celebration
4. Matches + chat: mutual match → conversation → send/retry + unread + starters
5. Safety + settings: block/report/unmatch + visibility + safety screen
6. Polish: skeletons, empty/error states, keyboard + safe-area, haptics, small-Android + iPhone testing

## Pre-release
- [ ] `npm run typecheck` (mobile) + `npm run build` (backend) clean
- [ ] Backend tests pass (`cd backend && npm test`): auth, validation, duplicate-like/match prevention, filters, block/report, conversation access
- [ ] No `.env` committed; `.env.example`s placeholder-only
- [ ] Seed never run in production; no fake profiles in prod
- [ ] EAS: `eas build:configure`, preview APK + iOS, then production submit
- [ ] Test on low-end Android + flaky network: retries work, no duplicate likes/messages, offline actions show unsynced state
- [ ] Privacy review: no exact addresses, no auto-exposed contacts, reports reachable from profile + chat
