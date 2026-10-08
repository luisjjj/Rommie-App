export type UserType = 'student' | 'general';
export type Visibility = 'visible' | 'hidden' | 'paused';

export interface LifestylePreferences {
  sleep_schedule?: string;
  cleanliness?: string;
  noise_preference?: string;
  visitor_preference?: string;
  work_study_habit?: string;
  social_style?: string;
  cooking_habit?: string;
  smoking_preference?: string;
  pet_preference?: string;
}

export interface Profile {
  id: string;
  userId: string;
  displayName: string;
  age: number;
  bio: string;
  photoUrl?: string;
  userType: UserType;
  university?: string;
  campusArea?: string;
  city?: string;
  preferredArea?: string;
  budgetMin?: number;
  budgetMax?: number;
  moveInTiming?: string;
  accommodationIntent?: string;
  visibility: Visibility;
  lifestyle?: LifestylePreferences;
  createdAt: string;
  updatedAt: string;
}

export interface DiscoveryFilters {
  university?: string;
  city?: string;
  area?: string;
  budgetMin?: number;
  budgetMax?: number;
  moveInTiming?: string;
  accommodationIntent?: string;
  sleep_schedule?: string;
  cleanliness?: string;
  noise_preference?: string;
  visitor_preference?: string;
  work_study_habit?: string;
  cooking_habit?: string;
}

export interface Match {
  id: string;
  otherUser: Profile;
  createdAt: string;
  lastMessagePreview?: string;
  unreadCount?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderUserId: string;
  text: string;
  createdAt: string;
  readAt?: string;
  status: 'sending' | 'sent' | 'failed' | 'read';
  mine: boolean;
}

export interface ApiResponse<T> {
  data: T;
  meta?: { page?: number; limit?: number; total?: number; hasMore?: boolean };
  error?: never;
}

export interface ApiError {
  error: { code: string; message: string; details?: unknown };
}
