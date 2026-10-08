import {
  pgTable, text, uuid, integer, timestamp, pgEnum, uniqueIndex, index,
} from 'drizzle-orm/pg-core';

export const accountStatusEnum = pgEnum('account_status', ['active', 'suspended', 'deleted']);
export const visibilityEnum = pgEnum('visibility', ['visible', 'hidden', 'paused']);
export const likeActionEnum = pgEnum('like_action', ['like', 'pass']);
export const matchStatusEnum = pgEnum('match_status', ['active', 'unmatched']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  // Neon Auth user id (JWT `sub`). Unique per identity; credentials live in Neon Auth.
  authProviderId: text('auth_provider_id').unique(),
  email: text('email').notNull().unique(),
  // Legacy local password hash. Unused since the Neon Auth cutover; null for all new users.
  passwordHash: text('password_hash'),
  phone: text('phone'),
  accountStatus: accountStatusEnum('account_status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const profiles = pgTable('profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  displayName: text('display_name').notNull(),
  age: integer('age').notNull(),
  bio: text('bio').default(''),
  photoUrl: text('profile_photo_url'),
  userType: text('user_type').default('student').notNull(), // student | general
  university: text('university'),
  campusArea: text('campus_area'),
  city: text('city'),
  preferredArea: text('preferred_area'),
  budgetMin: integer('budget_min'),
  budgetMax: integer('budget_max'),
  budgetPeriod: text('budget_period').default('annual').notNull(),
  moveInTiming: text('move_in_timing'),
  accommodationIntent: text('accommodation_intent'),
  isProfileComplete: text('is_profile_complete').default('false'),
  visibility: visibilityEnum('visibility').default('visible').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  profilesUniversityIdx: index('profiles_university_idx').on(t.university),
  profilesCityIdx: index('profiles_city_idx').on(t.city),
  profilesBudgetIdx: index('profiles_budget_idx').on(t.budgetMin, t.budgetMax),
}));

export const lifestylePreferences = pgTable('lifestyle_preferences', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  sleepSchedule: text('sleep_schedule'),
  cleanliness: text('cleanliness'),
  noisePreference: text('noise_preference'),
  visitorPreference: text('visitor_preference'),
  workStudyHabit: text('work_study_habit'),
  socialStyle: text('social_style'),
  cookingHabit: text('cooking_habit'),
  smokingPreference: text('smoking_preference'),
  petPreference: text('pet_preference'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const likes = pgTable('likes', {
  id: uuid('id').defaultRandom().primaryKey(),
  senderUserId: uuid('sender_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  receiverUserId: uuid('receiver_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  action: likeActionEnum('action').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  likesPairUnique: uniqueIndex('likes_pair_unique').on(t.senderUserId, t.receiverUserId),
  likesReceiverIdx: index('likes_receiver_idx').on(t.receiverUserId),
}));

export const matches = pgTable('matches', {
  id: uuid('id').defaultRandom().primaryKey(),
  userOneId: uuid('user_one_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  userTwoId: uuid('user_two_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: matchStatusEnum('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  matchesPairUnique: uniqueIndex('matches_pair_unique').on(t.userOneId, t.userTwoId),
}));

export const conversations = pgTable('conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  matchId: uuid('match_id').notNull().references(() => matches.id, { onDelete: 'cascade' }).unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  senderUserId: uuid('sender_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  messageText: text('message_text').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  readAt: timestamp('read_at'),
  status: text('status').default('sent').notNull(),
}, (t) => ({
  messagesConversationIdx: index('messages_conversation_idx').on(t.conversationId, t.createdAt),
}));

export const userBlocks = pgTable('user_blocks', {
  id: uuid('id').defaultRandom().primaryKey(),
  blockerUserId: uuid('blocker_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  blockedUserId: uuid('blocked_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  blocksPairUnique: uniqueIndex('blocks_pair_unique').on(t.blockerUserId, t.blockedUserId),
}));

export const userReports = pgTable('user_reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  reporterUserId: uuid('reporter_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  reportedUserId: uuid('reported_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  reason: text('reason').notNull(),
  details: text('details'),
  status: text('status').default('open').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
