import { setToken } from '@/lib/api/client';
import type { Profile } from '@/types';

/**
 * Dummy auth for local building. No backend required: any credentials work
 * and the session is a local fake token.
 *
 * Flip to the real API with EXPO_PUBLIC_AUTH_MODE=api once the backend is up.
 * Nothing else in the app needs to change — call sites branch on isDummyAuth.
 */
export const AUTH_MODE = process.env.EXPO_PUBLIC_AUTH_MODE ?? 'dummy';
export const isDummyAuth = AUTH_MODE !== 'api';

const DUMMY_TOKEN = 'dummy-dev-token';
const DUMMY_USER_ID = 'dev-user-1';

export async function dummySignIn(email: string) {
  await setToken(DUMMY_TOKEN);
  return {
    token: DUMMY_TOKEN,
    user: { id: DUMMY_USER_ID, email: email?.trim() || 'dev@roomie.test' },
  };
}

/** Clearly-fake profile so the Profile tab renders while offline. */
export const DUMMY_PROFILE: Profile = {
  id: 'dev-profile-1',
  userId: DUMMY_USER_ID,
  displayName: 'Ada',
  age: 21,
  bio: 'Preview profile while building — connect the backend to see real data.',
  userType: 'student',
  university: 'University of Lagos (UNILAG)',
  preferredArea: 'Akoka',
  budgetMin: 300000,
  budgetMax: 500000,
  moveInTiming: 'In 1–3 months',
  accommodationIntent: 'looking_for_roommate',
  visibility: 'visible',
  lifestyle: {
    sleep_schedule: 'Early sleeper',
    cleanliness: 'Generally tidy',
    noise_preference: 'Prefer quiet',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
