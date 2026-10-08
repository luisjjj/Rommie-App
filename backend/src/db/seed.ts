/**
 * Dev-only seed. Guarded by ALLOW_SEED=true. NEVER run against production.
 * Creates clearly-marked test users (test+*@roomie.test) for local development.
 * Credentials live in Neon Auth; these rows only back discovery/profile data
 * and can never log in (auth_provider_id values are fake).
 */
import 'dotenv/config';
import { db } from './client.js';
import { users, profiles, lifestylePreferences } from './schema.js';

async function main() {
  if (process.env.ALLOW_SEED !== 'true') {
    console.error('Refusing to seed: set ALLOW_SEED=true for local dev only.');
    process.exit(1);
  }
  const seedProfiles = [
    { email: 'test+ada@roomie.test', providerId: 'seed-ada', name: 'Ada', age: 21, uni: 'University of Lagos (UNILAG)', city: null, bio: 'Final-year, early sleeper, keeps the kitchen clean.' },
    { email: 'test+tunde@roomie.test', providerId: 'seed-tunde', name: 'Tunde', age: 23, uni: null, city: 'Lagos', bio: 'NYSC member, balanced and easy-going.' },
    { email: 'test+ngozi@roomie.test', providerId: 'seed-ngozi', name: 'Ngozi', age: 20, uni: 'University of Nigeria, Nsukka (UNN)', city: null, bio: 'Night owl, loves cooking on weekends.' },
  ];
  for (const s of seedProfiles) {
    const [u] = await db.insert(users).values({ email: s.email, authProviderId: s.providerId }).onConflictDoNothing().returning();
    if (!u) continue;
    await db.insert(profiles).values({
      userId: u.id, displayName: s.name, age: s.age, bio: s.bio,
      userType: s.uni ? 'student' : 'general', university: s.uni, city: s.city,
      budgetMin: 300000, budgetMax: 500000, moveInTiming: 'In 1–3 months',
      accommodationIntent: 'looking_for_roommate', visibility: 'visible' as never,
    } as never);
    await db.insert(lifestylePreferences).values({ userId: u.id, sleepSchedule: 'Early sleeper', cleanliness: 'Generally tidy' } as never);
  }
  console.log('Seeded dev test users (clearly marked .test emails).');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
