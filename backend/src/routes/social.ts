import { Router } from 'express';
import { and, desc, eq, or } from 'drizzle-orm';
import { db } from '../db/client.js';
import { likes, matches, profiles, lifestylePreferences, conversations, messages, userBlocks, userReports } from '../db/schema.js';
import { requireAppUser, type AuthRequest } from '../middleware/auth.js';
import { messageSchema, reportSchema, toPublicProfile } from '../schemas/requests.js';

export const socialRouter = Router();

async function publicProfileFor(userId: string) {
  const p = await db.select().from(profiles).where(eq(profiles.userId, userId)).then((r: any) => r[0]);
  if (!p) return null;
  const life = await db.select().from(lifestylePreferences).where(eq(lifestylePreferences.userId, userId)).then((r: any) => r[0]);
  return toPublicProfile(p as unknown as Record<string, unknown>, (life ?? {}) as Record<string, string>);
}

socialRouter.get('/likes/received', requireAppUser, async (req: AuthRequest, res, next) => {
  try {
    const rows = await db.select().from(likes).where(and(eq(likes.receiverUserId, req.userId!), eq(likes.action, 'like' as never)));
    const out = [];
    for (const l of rows) {
      const p = await publicProfileFor((l as { senderUserId: string }).senderUserId);
      if (p) out.push(p);
    }
    res.json(out);
  } catch (e) { next(e); }
});

socialRouter.get('/likes/sent', requireAppUser, async (req: AuthRequest, res, next) => {
  try {
    const rows = await db.select().from(likes).where(and(eq(likes.senderUserId, req.userId!), eq(likes.action, 'like' as never)));
    const out = [];
    for (const l of rows) {
      const p = await publicProfileFor((l as { receiverUserId: string }).receiverUserId);
      if (p) out.push(p);
    }
    res.json(out);
  } catch (e) { next(e); }
});

socialRouter.get('/matches', requireAppUser, async (req: AuthRequest, res, next) => {
  try {
    const rows = await db
      .select()
      .from(matches)
      .where(and(or(eq(matches.userOneId, req.userId!), eq(matches.userTwoId, req.userId!)), eq(matches.status, 'active' as never)))
      .orderBy(desc(matches.createdAt));
    const out = [];
    for (const m of rows) {
      const mm = m as { id: string; userOneId: string; userTwoId: string; createdAt: Date };
      const otherId = mm.userOneId === req.userId ? mm.userTwoId : mm.userOneId;
      const otherUser = await publicProfileFor(otherId);
      if (!otherUser) continue;
      out.push({ id: mm.id, otherUser, createdAt: mm.createdAt, lastMessagePreview: undefined, unreadCount: 0 });
    }
    res.json(out);
  } catch (e) { next(e); }
});

socialRouter.post('/matches/:id/unmatch', requireAppUser, async (req: AuthRequest, res, next) => {
  try {
    const m = await db.select().from(matches).where(eq(matches.id, req.params.id)).then((r: any) => r[0]);
    if (!m) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Match not found' } });
    const mm = m as { userOneId: string; userTwoId: string };
    if (mm.userOneId !== req.userId && mm.userTwoId !== req.userId) return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Not your match' } });
    await db.update(matches).set({ status: 'unmatched' }).where(eq(matches.id, req.params.id));
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// ---- Messaging (matched users only) ----
async function requireParticipant(conversationId: string, userId: string) {
  const convo = await db.select().from(conversations).where(eq(conversations.id, conversationId)).then((r: any) => r[0]);
  if (!convo) return null;
  const m = await db.select().from(matches).where(eq(matches.id, (convo as { matchId: string }).matchId)).then((r: any) => r[0]);
  if (!m) return null;
  const mm = m as { userOneId: string; userTwoId: string; status: string };
  if (mm.status !== 'active') return null;
  if (mm.userOneId !== userId && mm.userTwoId !== userId) return null;
  return convo;
}

socialRouter.get('/conversations/:id/messages', requireAppUser, async (req: AuthRequest, res, next) => {
  try {
    const convo = await requireParticipant(req.params.id, req.userId!);
    if (!convo) return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'You do not have access to this conversation' } });
    const rows = await db.select().from(messages).where(eq(messages.conversationId, req.params.id)).orderBy(desc(messages.createdAt)).limit(30);
    res.json(rows.reverse().map((m: any) => {
      const mm = m as { id: string; conversationId: string; senderUserId: string; messageText: string; createdAt: Date; readAt: Date | null; status: string };
      return { id: mm.id, conversationId: mm.conversationId, senderUserId: mm.senderUserId, text: mm.messageText, createdAt: mm.createdAt, readAt: mm.readAt, status: mm.status, mine: mm.senderUserId === req.userId };
    }));
  } catch (e) { next(e); }
});

socialRouter.post('/conversations/:id/messages', requireAppUser, async (req: AuthRequest, res, next) => {
  try {
    const parsed = messageSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: { code: 'VALIDATION', message: 'Write a message (1–2000 chars)' } });
    const convo = await requireParticipant(req.params.id, req.userId!);
    if (!convo) return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'You do not have access to this conversation' } });
    const [msg] = await db.insert(messages).values({ conversationId: req.params.id, senderUserId: req.userId!, messageText: parsed.data.text }).returning();
    const mm = msg as { id: string; conversationId: string; senderUserId: string; messageText: string; createdAt: Date };
    res.status(201).json({ id: mm.id, conversationId: mm.conversationId, senderUserId: mm.senderUserId, text: mm.messageText, createdAt: mm.createdAt, status: 'sent', mine: true });
  } catch (e) { next(e); }
});

socialRouter.post('/conversations/:id/read', requireAppUser, async (req: AuthRequest, res, next) => {
  try {
    const convo = await requireParticipant(req.params.id, req.userId!);
    if (!convo) return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'No access' } });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// ---- Safety ----
socialRouter.post('/users/:id/block', requireAppUser, async (req: AuthRequest, res, next) => {
  try {
    if (req.params.id === req.userId) return res.status(400).json({ error: { code: 'INVALID', message: 'You cannot block yourself' } });
    await db.insert(userBlocks).values({ blockerUserId: req.userId!, blockedUserId: req.params.id }).onConflictDoNothing();
    res.status(201).json({ ok: true });
  } catch (e) { next(e); }
});

socialRouter.delete('/users/:id/block', requireAppUser, async (req: AuthRequest, res, next) => {
  try {
    res.json({ ok: true });
  } catch (e) { next(e); }
});

socialRouter.post('/reports', requireAppUser, async (req: AuthRequest, res, next) => {
  try {
    const parsed = reportSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: { code: 'VALIDATION', message: 'Invalid report' } });
    await db.insert(userReports).values({ reporterUserId: req.userId!, reportedUserId: parsed.data.reportedUserId, reason: parsed.data.reason, details: parsed.data.details });
    res.status(201).json({ ok: true });
  } catch (e) { next(e); }
});

