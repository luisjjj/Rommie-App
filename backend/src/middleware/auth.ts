import type { NextFunction, Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import { db } from '../db/client.js';
import { users } from '../db/schema.js';

export interface AuthRequest extends Request {
  /** Local users.id, resolved from the verified Neon Auth identity. */
  userId?: string;
  /** Neon Auth user id (JWT `sub`). */
  authProviderId?: string;
  /** Email from the verified token, when the issuer includes it. */
  authEmail?: string;
}

export interface NeonAuthConfig {
  baseUrl: string;
  jwksUrl: string;
  /** Expected `iss`: the origin of the Neon Auth URL (per Neon docs). */
  issuer: string;
}

/** Pure helper — safe to unit test without network. */
export function getAuthConfig(): NeonAuthConfig {
  const base = (process.env.NEON_AUTH_BASE_URL ?? '').replace(/\/$/, '');
  if (!base) throw new Error('NEON_AUTH_BASE_URL is not set');
  return { baseUrl: base, jwksUrl: `${base}/.well-known/jwks.json`, issuer: new URL(base).origin };
}

/** Pure helper — safe to unit test without network. */
export function extractBearer(header: string | undefined): string | null {
  if (!header || !header.startsWith('Bearer ')) return null;
  const token = header.slice(7).trim();
  return token ? token : null;
}

// Remote key set is cached and handles key rotation. Created lazily so a
// missing/misconfigured URL fails closed at request time, not at import time.
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
let jwksUrlSeen: string | null = null;

export async function verifyNeonToken(token: string): Promise<JWTPayload & { sub: string }> {
  const { jwksUrl, issuer } = getAuthConfig();
  if (!jwks || jwksUrlSeen !== jwksUrl) {
    jwks = createRemoteJWKSet(new URL(jwksUrl));
    jwksUrlSeen = jwksUrl;
  }
  // Neon Auth signs with EdDSA/Ed25519, 15-min expiry. Issuer must be the
  // auth URL origin; jose enforces signature + exp/nbf automatically.
  const { payload } = await jwtVerify(token, jwks, { issuer });
  if (!payload.sub) throw new Error('Token has no subject');
  return payload as JWTPayload & { sub: string };
}

async function authenticate(req: Request): Promise<{ authProviderId: string; authEmail?: string } | null> {
  const token = extractBearer(req.headers.authorization);
  if (!token) return null;
  try {
    const payload = await verifyNeonToken(token);
    return {
      authProviderId: payload.sub,
      authEmail: typeof payload.email === 'string' ? payload.email : undefined,
    };
  } catch {
    return null;
  }
}

function unauthorized(res: Response) {
  return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Missing or invalid token' } });
}

/** Verifies the Neon Auth JWT only. Use for provisioning (POST /auth/sync). */
export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const a = await authenticate(req);
  if (!a) return unauthorized(res);
  req.authProviderId = a.authProviderId;
  req.authEmail = a.authEmail;
  next();
}

/**
 * Verifies the Neon Auth JWT and resolves the local app user.
 * Drop-in replacement for the old local-JWT guard: existing routes keep
 * using req.userId. Returns 404 ACCOUNT_NOT_SYNCED when the identity has
 * never called POST /auth/sync.
 */
export async function requireAppUser(req: AuthRequest, res: Response, next: NextFunction) {
  const a = await authenticate(req);
  if (!a) return unauthorized(res);
  const user = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.authProviderId, a.authProviderId))
    .then((r: { id: string }[]) => r[0]);
  if (!user) {
    return res.status(404).json({
      error: { code: 'ACCOUNT_NOT_SYNCED', message: 'Call POST /auth/sync to provision your account' },
    });
  }
  req.authProviderId = a.authProviderId;
  req.authEmail = a.authEmail;
  req.userId = user.id;
  next();
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);
  res.status(500).json({ error: { code: 'INTERNAL', message: 'Something went wrong. Please try again.' } });
}
