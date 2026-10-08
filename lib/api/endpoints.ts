import { api, toQuery } from './client';
import type { DiscoveryFilters, Match, Message, Profile } from '@/types';

export const authApi = {
  /** Provision/link the local app user for the verified Neon Auth identity. */
  sync: (email: string) => api.post<{ id: string; email: string }>('/auth/sync', { email }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get<{ id: string; email: string }>('/auth/me'),
};

export const profileApi = {
  me: () => api.get<Profile>('/profile/me'),
  updateMe: (body: Partial<Profile> & { lifestyle?: Record<string, string> }) =>
    api.patch<Profile>('/profile/me', body),
  getById: (id: string) => api.get<Profile>(`/profiles/${id}`),
};

export const discoveryApi = {
  feed: (filters: DiscoveryFilters & { page?: number; limit?: number }) =>
    api.get<Profile[]>(`/discovery${toQuery(filters as Record<string, unknown>)}`),
  action: (userId: string, action: 'like' | 'pass') =>
    api.post<{ matched: boolean; matchId?: string }>(`/discovery/${userId}/action`, { action }),
  undo: () => api.post<{ ok: boolean }>('/discovery/undo'),
};

export const likesApi = {
  received: (page = 1, limit = 20) => api.get<Profile[]>(`/likes/received${toQuery({ page, limit })}`),
  sent: (page = 1, limit = 20) => api.get<Profile[]>(`/likes/sent${toQuery({ page, limit })}`),
};

export const matchesApi = {
  list: () => api.get<Match[]>('/matches'),
  get: (id: string) => api.get<Match>(`/matches/${id}`),
  unmatch: (id: string) => api.post(`/matches/${id}/unmatch`),
};

export const chatApi = {
  conversations: () => api.get('/conversations'),
  messages: (id: string, page = 1, limit = 30) =>
    api.get<Message[]>(`/conversations/${id}/messages${toQuery({ page, limit })}`),
  send: (id: string, text: string) => api.post<Message>(`/conversations/${id}/messages`, { text }),
  markRead: (id: string) => api.post(`/conversations/${id}/read`),
};

export const safetyApi = {
  block: (userId: string) => api.post(`/users/${userId}/block`),
  unblock: (userId: string) => api.delete(`/users/${userId}/block`),
  report: (userId: string, reason: string, details?: string) =>
    api.post('/reports', { reportedUserId: userId, reason, details }),
};
