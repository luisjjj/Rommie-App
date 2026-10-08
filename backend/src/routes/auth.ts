import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { users } from '../db/schema.js';
import { syncSchema } from '../schemas/requests.js';
import { requireAppUser, requireAuth, type AuthRequest } from '../middleware/auth.js';

export const authRouter = Router();

/**
 * Provision (or refresh) the local app user for a verified Neon Auth identity.
 * Sign-up / sign-in themselves happen client ↔ Neon Auth; this links that
 * identity to our users table via auth_provider_id (the JWT `sub`).
 */
authRouter.post('/sync', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const parsed = syncSchema.safeParse(req.body);
    const email = parsed.success ? parsed.data.email.toLowerCase() : req.authEmail?.toLowerCase();
    if (!email) {
      return res.status(400).json({ error: { code: 'VALIDATION', message: 'An email address is required' } });
    }
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.authProviderId, req.authProviderId!))
      .then((r: unknown[]) => r[0] as { id: string; email: string } | undefined);
    if (existing) {
      if (existing.email !== email) {
        await db.update(users).set({ email, updatedAt: new Date() }).where(eq(users.id, existing.id));
      }
      return res.json({ id: existing.id, email });
    }
    const taken = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).then((r: { id: string }[]) => r[0]);
    if (taken) {
      return res.status(409).json({ error: { code: 'CONFLICT', message: 'An account with this email already exists' } });
    }
    const [user] = await db
      .insert(users)
      .values({ authProviderId: req.authProviderId!, email })
      .returning({ id: users.id, email: users.email });
    res.status(201).json(user);
  } catch (e) {
    next(e);
  }
});

authRouter.get('/me', requireAppUser, async (req: AuthRequest, res, next) => {
  try {
    const user = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.id, req.userId!))
      .then((r: { id: string; email: string }[]) => r[0]);
    if (!user) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Account not found' } });
    res.json(user);
  } catch (e) {
    next(e);
  }
});

authRouter.post('/logout', (_req, res) => {
  // Sessions live in Neon Auth; the client clears its stored session + token.
  res.json({ ok: true });
});
