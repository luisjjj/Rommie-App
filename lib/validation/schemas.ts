import { z } from 'zod';
import { MIN_AGE } from '@/constants/options';

export const registerSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  terms: z.literal(true, { error: 'Please accept the Terms & Privacy Policy' }),
});

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
});

export const basicProfileSchema = z.object({
  displayName: z.string().min(2, 'Enter your name or nickname').max(30),
  age: z.coerce.number().int().min(MIN_AGE, `You must be at least ${MIN_AGE}`).max(100),
  bio: z.string().max(280, 'Keep your intro under 280 characters').optional().default(''),
});

export const locationSchema = z.object({
  userType: z.enum(['student', 'general']),
  university: z.string().optional(),
  campusArea: z.string().optional(),
  city: z.string().optional(),
  preferredArea: z.string().optional(),
  relocating: z.boolean().optional(),
});

export const budgetSchema = z.object({
  budgetMin: z.number().nonnegative(),
  budgetMax: z.number().positive(),
});

export const onboardingProfileSchema = basicProfileSchema
  .merge(locationSchema)
  .merge(budgetSchema)
  .extend({
    moveInTiming: z.string().min(1, 'Select a move-in timeframe'),
    accommodationIntent: z.string().min(1, 'Select what brings you to Roomie'),
    lifestyle: z.record(z.string(), z.string()).optional(),
  });

export const messageSchema = z.object({
  text: z.string().trim().min(1, 'Write a message').max(2000),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
