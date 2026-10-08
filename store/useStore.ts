import { create } from 'zustand';
import type { DiscoveryFilters } from '@/types';

interface SessionState {
  token: string | null;
  userId: string | null;
  setSession: (token: string | null, userId: string | null) => void;
}

export const useSession = create<SessionState>((set) => ({
  token: null,
  userId: null,
  setSession: (token, userId) => set({ token, userId }),
}));

interface OnboardingState {
  userType: 'student' | 'general' | null;
  data: Record<string, unknown>;
  step: number;
  setUserType: (t: 'student' | 'general') => void;
  patch: (d: Record<string, unknown>) => void;
  setStep: (n: number) => void;
  reset: () => void;
}

export const useOnboarding = create<OnboardingState>((set) => ({
  userType: null,
  data: {},
  step: 0,
  setUserType: (userType) => set({ userType }),
  patch: (d) => set((s) => ({ data: { ...s.data, ...d } })),
  setStep: (step) => set({ step }),
  reset: () => set({ userType: null, data: {}, step: 0 }),
}));

interface DiscoveryUIState {
  filters: DiscoveryFilters;
  lastPassedId: string | null;
  setFilters: (f: DiscoveryFilters) => void;
  setLastPassed: (id: string | null) => void;
}

export const useDiscoveryUI = create<DiscoveryUIState>((set) => ({
  filters: {},
  lastPassedId: null,
  setFilters: (filters) => set({ filters }),
  setLastPassed: (id) => set({ lastPassedId: id }),
}));
