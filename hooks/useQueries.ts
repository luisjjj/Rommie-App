import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { discoveryApi, likesApi, matchesApi, chatApi, profileApi } from '@/lib/api/endpoints';
import { DUMMY_PROFILE, isDummyAuth } from '@/lib/auth/dummy';
import type { DiscoveryFilters } from '@/types';

export const qk = {
  me: ['me'],
  discovery: (f: DiscoveryFilters) => ['discovery', f],
  likesReceived: ['likes', 'received'],
  matches: ['matches'],
  messages: (id: string) => ['messages', id],
};

export function useMe() {
  return useQuery({
    queryKey: qk.me,
    queryFn: async () => {
      if (isDummyAuth) return DUMMY_PROFILE; // building mode: fake profile, no backend
      return (await profileApi.me()).data;
    },
    retry: 1,
  });
}

export function useDiscovery(filters: DiscoveryFilters & { page?: number }) {
  return useQuery({
    queryKey: qk.discovery(filters),
    queryFn: async () => (await discoveryApi.feed({ ...filters, limit: 20 })).data,
  });
}

export function useLikeAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, action }: { userId: string; action: 'like' | 'pass' }) =>
      discoveryApi.action(userId, action).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['discovery'] });
      qc.invalidateQueries({ queryKey: ['likes'] });
      qc.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}

export function useLikesReceived() {
  return useQuery({
    queryKey: qk.likesReceived,
    queryFn: async () => (await likesApi.received()).data,
  });
}

export function useMatches() {
  return useQuery({ queryKey: qk.matches, queryFn: async () => (await matchesApi.list()).data });
}

export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: qk.messages(conversationId),
    queryFn: async () => (await chatApi.messages(conversationId)).data,
    enabled: !!conversationId,
  });
}

export function useSendMessage(conversationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => chatApi.send(conversationId, text).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.messages(conversationId) }),
  });
}
