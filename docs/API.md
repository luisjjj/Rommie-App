# API (`/api/v1`)

Consistent shape: success returns data directly (array or object); errors return `{ error: { code, message, details? } }`. All routes except register/login require `Authorization: Bearer <JWT>`. Server never trusts a client-supplied user ID for access checks.

## Auth (Managed Neon Auth)

Sign-up / sign-in happen directly between the app and Neon Auth
(`EXPO_PUBLIC_NEON_AUTH_URL`, Better Auth expo client). The app sends the
short-lived EdDSA JWT as `Authorization: Bearer`, and the backend verifies it
against the Neon JWKS (`<NEON_AUTH_BASE_URL>/.well-known/jwks.json`, issuer =
URL origin). No passwords touch our code or database.

- `POST /auth/sync` `{ email }` → `{ id, email }` — provision/link the local user for the verified identity (201 on first sync)
- `GET /auth/me` → `{ id, email }` — 404 `ACCOUNT_NOT_SYNCED` if sync never ran
- `POST /auth/logout` → `{ ok: true }` (client clears SecureStore + Neon session)

## Profile
- `GET /profile/me` → public-profile shape (no email/phone/hash/address)
- `PATCH /profile/me` → upsert profile + lifestyle
- `GET /profiles/:id` → visible profiles only
- `POST /profile/photo` → (presigned upload; returns `photoUrl`)

## Discovery
- `GET /discovery?university=&city=&budgetMin=&budgetMax=&moveInTiming=&accommodationIntent=&sleep_schedule=&...&page=&limit=` → `Profile[]` (excludes acted-on, matched, blocked/blocked-by; budget-overlap + lifestyle ranking)
- `POST /discovery/:userId/action` `{ action: 'like' | 'pass' }` → `{ matched, matchId? }` (201 on new match)
- `POST /discovery/undo` → `{ ok: true }`

## Likes & matches
- `GET /likes/received` / `GET /likes/sent` → `Profile[]`
- `GET /matches` → `{ id, otherUser, createdAt, lastMessagePreview?, unreadCount? }[]` sorted by recent
- `POST /matches/:id/unmatch` → `{ ok: true }`

## Messaging (matched participants only)
- `GET /conversations/:id/messages?page=&limit=` → newest-30, chronological
- `POST /conversations/:id/messages` `{ text }` → message (validate 1–2000 chars)
- `POST /conversations/:id/read` → `{ ok: true }`

## Safety
- `POST /users/:id/block` / `DELETE /users/:id/block`
- `POST /reports` `{ reportedUserId, reason, details? }`

Pagination: `page`/`limit` on discovery, likes, messages. Validate server-side with Zod; 400 `VALIDATION`, 401 `UNAUTHORIZED`, 403 `FORBIDDEN`, 404 `NOT_FOUND`, 409 `CONFLICT`.
