import { createAuthClient } from 'better-auth/react';
import { expoClient } from '@better-auth/expo/client';
import { jwtClient } from 'better-auth/client/plugins';
import * as SecureStore from 'expo-secure-store';
import { getToken, setToken, setTokenProvider } from '@/lib/api/client';
import { isDummyAuth } from '@/lib/auth/dummy';

/**
 * Managed Neon Auth (Better Auth) client.
 * Sign-up / sign-in happen directly against NEON_AUTH_URL; our backend only
 * ever sees short-lived EdDSA JWTs (via authClient.token()) and verifies
 * them against the Neon JWKS. No passwords touch our code or database.
 *
 * baseURL is public config (same value as the backend's NEON_AUTH_BASE_URL).
 */
const NEON_AUTH_URL = process.env.EXPO_PUBLIC_NEON_AUTH_URL ?? '';

/**
 * The managed server rejects Origin-less POSTs (403 MISSING_OR_NULL_ORIGIN)
 * and does not translate the expo-origin header, so every mutating auth call
 * must carry a same-origin Origin header. Native fetch sends none by itself.
 */
function authOrigin(): string {
  return NEON_AUTH_URL ? new URL(NEON_AUTH_URL).origin : '';
}

function withOrigin(): { headers: Record<string, string>; credentials: RequestCredentials } {
  return {
    // Cross-origin credentialed requests. The browser default ('same-origin')
    // would neither store nor send the auth cookies on web, breaking sessions
    // there. Ignored by native fetch, so safe on iOS/Android.
    credentials: 'include',
    headers: { origin: authOrigin() },
  };
}

export const authClient = createAuthClient({
  baseURL: NEON_AUTH_URL,
  plugins: [
    expoClient({
      scheme: 'roomie',
      storagePrefix: 'roomie',
      storage: SecureStore,
      // The managed server names its cookies neon-auth.* — without this prefix
      // the client silently drops the session cookies and every follow-up call
      // (token, session) goes out sessionless and fails as "unauthorized".
      cookiePrefix: ['better-auth', 'neon-auth'],
    }),
    jwtClient(),
  ],
});

interface AuthErrorLike {
  message?: string;
  code?: string;
}

function friendlyError(error: unknown, fallback: string): string {
  const e = error as AuthErrorLike | null;
  const code = typeof e?.code === 'string' ? e.code : '';
  if (/INVALID.*(EMAIL|PASSWORD)|INVALID_CREDENTIALS/i.test(code)) return 'Email or password is incorrect.';
  if (/USER_ALREADY_EXISTS|EMAIL.*(TAKEN|EXISTS)/i.test(code)) return 'An account with this email already exists.';
  if (typeof e?.message === 'string' && e.message.length > 0 && e.message.length < 200) return e.message;
  return fallback;
}

export async function neonSignUp(email: string, password: string) {
  // No callbackURL: with the Origin header set (see withOrigin), the server
  // returns a clean JSON session. Sending one triggers a browser redirect
  // flow that has no place in native email auth.
  const res = await authClient.signUp.email(
    {
      email: email.trim(),
      password,
      // Collected properly during onboarding; only used as the auth display name.
      name: email.split('@')[0] || 'Roomie user',
    },
    withOrigin(),
  );
  if (res.error) throw new Error(friendlyError(res.error, 'Could not create your account. Try again.'));
  return res.data;
}

export async function neonSignIn(email: string, password: string) {
  const res = await authClient.signIn.email(
    { email: email.trim(), password },
    withOrigin(),
  );
  if (res.error) throw new Error(friendlyError(res.error, 'Could not log you in. Check your details and try again.'));
  return res.data;
}

export async function neonSignOut() {
  cachedJwt = null;
  await setToken(null);
  await authClient.signOut({ fetchOptions: withOrigin() }).catch(() => {
    /* session already gone or offline — local state is cleared anyway */
  });
}

// Neon Auth JWTs live ~15 minutes. Cache the token and refresh at 13 minutes
// so every API call carries a valid Bearer without a network round-trip.
let cachedJwt: { token: string; at: number } | null = null;
const JWT_MAX_AGE_MS = 13 * 60 * 1000;

export async function getAccessToken(): Promise<string> {
  if (cachedJwt && Date.now() - cachedJwt.at < JWT_MAX_AGE_MS) return cachedJwt.token;
  const res = await authClient.token();
  const token = (res.data as { token?: string } | null)?.token;
  if (res.error || !token) throw new Error(friendlyError(res.error, 'Your session expired. Please log in again.'));
  cachedJwt = { token, at: Date.now() };
  await setToken(token);
  return token;
}

/**
 * Wire the API layer to Neon Auth. Call once at startup (app/_layout).
 * In dummy mode the provider falls back to the stored fake token.
 */
export function initNeonAuth() {
  setTokenProvider(async () => {
    if (isDummyAuth) return getToken();
    try {
      return await getAccessToken();
    } catch {
      return getToken();
    }
  });
}
