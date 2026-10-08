import { z } from 'zod';

export const syncSchema = z.object({
  email: z.string().email(),
});

export const profileUpdateSchema = z.object({
  displayName: z.string().min(2).max(30).optional(),
  age: z.number().int().min(16).max(100).optional(),
  bio: z.string().max(280).optional(),
  userType: z.enum(['student', 'general']).optional(),
  university: z.string().optional(),
  campusArea: z.string().optional(),
  city: z.string().optional(),
  preferredArea: z.string().optional(),
  budgetMin: z.number().nonnegative().optional(),
  budgetMax: z.number().positive().optional(),
  moveInTiming: z.string().optional(),
  accommodationIntent: z.string().optional(),
  visibility: z.enum(['visible', 'hidden', 'paused']).optional(),
  lifestyle: z.record(z.string(), z.string()).optional(),
});

export const discoveryQuerySchema = z.object({
  university: z.string().optional(),
  city: z.string().optional(),
  area: z.string().optional(),
  budgetMin: z.coerce.number().optional(),
  budgetMax: z.coerce.number().optional(),
  moveInTiming: z.string().optional(),
  accommodationIntent: z.string().optional(),
  sleep_schedule: z.string().optional(),
  cleanliness: z.string().optional(),
  noise_preference: z.string().optional(),
  visitor_preference: z.string().optional(),
  work_study_habit: z.string().optional(),
  cooking_habit: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export const actionSchema = z.object({ action: z.enum(['like', 'pass']) });

export const messageSchema = z.object({ text: z.string().trim().min(1).max(2000) });

export const reportSchema = z.object({
  reportedUserId: z.string().uuid(),
  reason: z.string().min(2).max(100),
  details: z.string().max(1000).optional(),
});

/** DB column → client key. Only these preference fields leave the server. */
const LIFESTYLE_MAP: Record<string, string> = {
  sleepSchedule: 'sleep_schedule',
  cleanliness: 'cleanliness',
  noisePreference: 'noise_preference',
  visitorPreference: 'visitor_preference',
  workStudyHabit: 'work_study_habit',
  socialStyle: 'social_style',
  cookingHabit: 'cooking_habit',
  smokingPreference: 'smoking_preference',
  petPreference: 'pet_preference',
};

/** Build the public lifestyle map, dropping row metadata (id, userId) and nulls. */
export function toLifestyleMap(row?: unknown): Record<string, string> | undefined {
  if (!row || typeof row !== 'object') return undefined;
  const record = row as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const [dbKey, clientKey] of Object.entries(LIFESTYLE_MAP)) {
    const v = record[dbKey];
    if (typeof v === 'string' && v) out[clientKey] = v;
  }
  return out;
}

export function toPublicProfile(p: Record<string, unknown>, lifestyle?: Record<string, unknown> | null) {
  // Never expose email, phone, exact address, or password hash.
  return {
    id: p.id,
    userId: p.userId ?? p.user_id,
    displayName: p.displayName ?? p.display_name,
    age: p.age,
    bio: p.bio,
    photoUrl: p.photoUrl ?? p.profile_photo_url ?? p.photoUrl,
    userType: p.userType ?? p.user_type,
    university: p.university,
    campusArea: p.campusArea ?? p.campus_area,
    city: p.city,
    preferredArea: p.preferredArea ?? p.preferred_area,
    budgetMin: p.budgetMin ?? p.budget_min,
    budgetMax: p.budgetMax ?? p.budget_max,
    moveInTiming: p.moveInTiming ?? p.move_in_timing,
    accommodationIntent: p.accommodationIntent ?? p.accommodation_intent,
    visibility: p.visibility,
    lifestyle: toLifestyleMap(lifestyle) ?? undefined,
    createdAt: p.createdAt ?? p.created_at,
    updatedAt: p.updatedAt ?? p.updated_at,
  };
}
