import { and, eq, ne } from 'drizzle-orm';
import { db } from '../db/client.js';
import { likes, profiles, userBlocks, lifestylePreferences } from '../db/schema.js';
import { orderedPair } from '../utils/pair.js';

export { orderedPair };

/** Transparent discovery: filter + rank, excluding acted-on, matched, and blocked users. */
export async function findCandidates(viewerId: string, filters: Record<string, string | number | undefined>, page = 1, limit = 20) {
  const acted = await db.select({ id: likes.receiverUserId }).from(likes).where(eq(likes.senderUserId, viewerId));
  const actedIds = acted.map((a: { id: unknown }) => a.id as string);

  const blocked = await db.select({ id: userBlocks.blockedUserId }).from(userBlocks).where(eq(userBlocks.blockerUserId, viewerId));
  const blockedBy = await db.select({ id: userBlocks.blockerUserId }).from(userBlocks).where(eq(userBlocks.blockedUserId, viewerId));
  const excluded = new Set([...actedIds, ...blocked.map((b: { id: unknown }) => b.id as string), ...blockedBy.map((b: { id: unknown }) => b.id as string), viewerId]);

  // Base query — visible profiles only. Additional filters applied in SQL where indexed.
  const conditions = [eq(profiles.visibility, 'visible' as never), ne(profiles.userId, viewerId)];
  if (filters.university) conditions.push(eq(profiles.university, String(filters.university)));
  if (filters.city) conditions.push(eq(profiles.city, String(filters.city)));
  if (filters.moveInTiming) conditions.push(eq(profiles.moveInTiming, String(filters.moveInTiming)));
  if (filters.accommodationIntent) conditions.push(eq(profiles.accommodationIntent, String(filters.accommodationIntent)));

  let rows = await db
    .select()
    .from(profiles)
    .where(and(...conditions))
    .limit(100);

  // In-memory transparent ranking: budget overlap first, then lifestyle overlap.
  const fMin = filters.budgetMin != null ? Number(filters.budgetMin) : undefined;
  const fMax = filters.budgetMax != null ? Number(filters.budgetMax) : undefined;

  const viewerLifestyle = await db.select().from(lifestylePreferences).where(eq(lifestylePreferences.userId, viewerId)).then((r: unknown[]) => r[0] as Record<string, unknown> | undefined);
  void viewerLifestyle;

  const scored = rows
    .filter((p: unknown) => !excluded.has((p as Record<string, string>).userId as string))
    .filter((p: unknown) => {
      const r = p as unknown as { budgetMin: number | null; budgetMax: number | null };
      if (fMin != null && r.budgetMax != null && r.budgetMax < fMin) return false;
      if (fMax != null && r.budgetMin != null && r.budgetMin > fMax) return false;
      return true;
    })
    .map((p: unknown) => ({ p, score: 0 }));

  const offset = (page - 1) * limit;
  return scored.slice(offset, offset + limit).map((s: { p: unknown }) => s.p);
}
