# Database

Neon Postgres + Drizzle ORM. Schema: `backend/src/db/schema.ts`. Migrations in `backend/drizzle/`.

## Tables
- `users(id, auth_provider_id unique → Neon Auth sub, email unique, password_hash legacy nullable, phone, account_status, created_at, updated_at)`
- `profiles(id, user_id unique → users cascade, display_name, age, bio, profile_photo_url, user_type, university, campus_area, city, preferred_area, budget_min/max, budget_period='annual', move_in_timing, accommodation_intent, is_profile_complete, visibility, timestamps)` + indexes on university/city/budget
- `lifestyle_preferences(id, user_id unique → users cascade, sleep_schedule, cleanliness, noise_preference, visitor_preference, work_study_habit, social_style, cooking_habit, smoking_preference, pet_preference, updated_at)` — flexible columns (not one JSON blob) so discovery can filter
- `likes(id, sender, receiver, action, created_at)` + unique(sender, receiver)
- `matches(id, user_one_id, user_two_id ordered, status, created_at)` + unique pair
- `conversations(id, match_id unique → matches cascade, timestamps)`
- `messages(id, conversation_id → cascade, sender → cascade, message_text, created_at, read_at, status)` + index(conversation, created_at)
- `user_blocks(blocker, blocked, created_at)` + unique pair
- `user_reports(reporter, reported, reason, details, status='open', created_at)`

All FKs cascade where the child has no meaning without the parent. Pair ordering (`orderedPair`) in `services/discovery.ts` prevents duplicate matches regardless of who liked first.

## Commands
```bash
cd backend
npm run db:generate   # drizzle-kit → drizzle/
npm run db:migrate    # apply to DATABASE_URL
```
