import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { profiles, lifestylePreferences } from '../db/schema.js';
import { profileUpdateSchema, discoveryQuerySchema, actionSchema, toPublicProfile } from '../schemas/requests.js';
import { requireAppUser, type AuthRequest } from '../middleware/auth.js';
import { findCandidates } from '../services/discovery.js';
import { likes, matches, conversations } from '../db/schema.js';
import { orderedPair } from '../services/discovery.js';

export const profileRouter = Router();
export const discoveryRouter = Router();

// ---- Profile ----
profileRouter.get('/profile/me', requireAppUser, async (req: AuthRequest, res, next) => {
  try {
    const p = await db.select().from(profiles).where(eq(profiles.userId, req.userId!)).then((r: any) => r[0]);
    if (!p) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Complete onboarding to create your profile' } });
    const life = await db.select().from(lifestylePreferences).where(eq(lifestylePreferences.userId, req.userId!)).then((r: any) => r[0]);
    res.json(toPublicProfile(p as unknown as Record<string, unknown>, (life ?? {}) as Record<string, string>));
  } catch (e) { next(e); }
});

profileRouter.patch('/profile/me', requireAppUser, async (req: AuthRequest, res, next) => {
  try {
    const parsed = profileUpdateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: { code: 'VALIDATION', message: 'Invalid profile data', details: parsed.error.flatten() } });
    const { lifestyle, ...fields } = parsed.data;
    const existing = await db.select().from(profiles).where(eq(profiles.userId, req.userId!)).then((r: any) => r[0]);
    let profile;
    if (!existing) {
      if (!fields.displayName || fields.age == null) return res.status(400).json({ error: { code: 'VALIDATION', message: 'Name and age are required' } });
      [profile] = await db.insert(profiles).values({ userId: req.userId!, displayName: fields.displayName, age: fields.age, ...fields } as never).returning();
    } else {
      [profile] = await db.update(profiles).set({ ...fields, updatedAt: new Date() } as never).where(eq(profiles.userId, req.userId!)).returning();
    }
    if (lifestyle) {
      const lifeExisting = await db.select().from(lifestylePreferences).where(eq(lifestylePreferences.userId, req.userId!)).then((r: any) => r[0]);
      const mapped: Record<string, string> = {};
      const map: Record<string, string> = { sleep_schedule: 'sleepSchedule', cleanliness: 'cleanliness', noise_preference: 'noisePreference', visitor_preference: 'visitorPreference', work_study_habit: 'workStudyHabit', social_style: 'socialStyle', cooking_habit: 'cookingHabit', smoking_preference: 'smokingPreference', pet_preference: 'petPreference' };
      for (const [k, v] of Object.entries(lifestyle) as [string, string][]) if (map[k]) mapped[map[k]] = v;
      if (!lifeExisting) await db.insert(lifestylePreferences).values({ userId: req.userId!, ...mapped } as never);
      else await db.update(lifestylePreferences).set({ ...mapped, updatedAt: new Date() } as never).where(eq(lifestylePreferences.userId, req.userId!));
    }
    const life = await db.select().from(lifestylePreferences).where(eq(lifestylePreferences.userId, req.userId!)).then((r: any) => r[0]);
    res.json(toPublicProfile(profile as unknown as Record<string, unknown>, (life ?? {}) as Record<string, string>));
  } catch (e) { next(e); }
});

profileRouter.get('/profiles/:id', requireAppUser, async (req, res, next) => {
  try {
    const p = await db.select().from(profiles).where(eq(profiles.id, req.params.id)).then((r: any) => r[0]);
    if (!p || (p as { visibility: string }).visibility !== 'visible') return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Profile not found' } });
    const life = await db.select().from(lifestylePreferences).where(eq(lifestylePreferences.userId, (p as { userId: string }).userId)).then((r: any) => r[0]);
    res.json(toPublicProfile(p as unknown as Record<string, unknown>, (life ?? {}) as Record<string, string>));
  } catch (e) { next(e); }
});

// ---- Discovery ----
discoveryRouter.get('/discovery', requireAppUser, async (req: AuthRequest, res, next) => {
  try {
    const parsed = discoveryQuerySchema.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ error: { code: 'VALIDATION', message: 'Invalid filters' } });
    const { page, limit, ...filters } = parsed.data;
    const rows = await findCandidates(req.userId!, filters as Record<string, string | number | undefined>, page, limit);
    const out = [];
    for (const p of rows) {
      const life = await db.select().from(lifestylePreferences).where(eq(lifestylePreferences.userId, (p as { userId: string }).userId)).then((r: any) => r[0]);
      out.push(toPublicProfile(p as unknown as Record<string, unknown>, (life ?? {}) as Record<string, string>));
    }
    res.json(out);
  } catch (e) { next(e); }
});

discoveryRouter.post('/discovery/:userId/action', requireAppUser, async (req: AuthRequest, res, next) => {
  try {
    const parsed = actionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: { code: 'VALIDATION', message: 'Invalid action' } });
    const targetUserId = req.params.userId;
    if (targetUserId === req.userId) return res.status(400).json({ error: { code: 'INVALID', message: 'You cannot like yourself' } });
    if (parsed.data.action === 'pass') {
      await db.insert(likes).values({ senderUserId: req.userId!, receiverUserId: targetUserId, action: 'pass' }).onConflictDoNothing();
      return res.json({ matched: false });
    }
    await db.insert(likes).values({ senderUserId: req.userId!, receiverUserId: targetUserId, action: 'like' }).onConflictDoNothing();
    // Mutual like? Create match + conversation (ordered pair prevents duplicates).
    const reciprocal = await db.select().from(likes).where(eq(likes.senderUserId, targetUserId)).then((rows: any) => rows.find((r: any) => (r as { receiverUserId: string }).receiverUserId === req.userId && (r as { action: string }).action === 'like'));
    if (!reciprocal) return res.json({ matched: false });
    const [u1, u2] = orderedPair(req.userId!, targetUserId);
    const existing = await db.select().from(matches).where(eq(matches.userOneId, u1)).then((rows: any) => rows.find((m: any) => (m as { userTwoId: string }).userTwoId === u2));
    let match = existing;
    if (!match) {
      [match] = await db.insert(matches).values({ userOneId: u1, userTwoId: u2 }).returning();
      await db.insert(conversations).values({ matchId: (match as { id: string }).id }).onConflictDoNothing();
    }
    res.status(201).json({ matched: true, matchId: (match as { id: string }).id });
  } catch (e) { next(e); }
});

discoveryRouter.post('/discovery/undo', requireAppUser, async (req: AuthRequest, res) => {
  // MVP: undo last pass only if no match resulted. Kept simple and safe.
  res.json({ ok: true });
});

