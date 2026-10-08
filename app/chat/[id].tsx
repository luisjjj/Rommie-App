import React from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { DotsThree } from 'phosphor-react-native';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { StackHeader } from '@/components/ui/StackHeader';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { LoadingSkeleton, ErrorState } from '@/components/ui/primitives';
import { useMessages, useSendMessage } from '@/hooks/useQueries';
import { chatApi, safetyApi, matchesApi } from '@/lib/api/endpoints';
import { useSession } from '@/store/useStore';
import { CONVERSATION_STARTERS, LIVING_DISCUSSION_PROMPTS } from '@/constants/options';
import { colors, radii, spacing, typography } from '@/theme/tokens';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversationId = String(id);
  const userId = useSession((s) => s.userId);
  const { data, isLoading, isError, refetch } = useMessages(conversationId);
  const send = useSendMessage(conversationId);
  const [draft, setDraft] = React.useState('');

  const submit = async () => {
    const text = draft.trim();
    if (!text || text.length > 2000) return;
    setDraft('');
    try {
      await send.mutateAsync(text);
      chatApi.markRead(conversationId).catch(() => {});
    } catch {
      Alert.alert('Not sent', 'Your message was not saved. Check your connection and try again.');
      setDraft(text);
    }
  };

  const safety = () =>
    Alert.alert('Conversation options', 'Manage this match', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Report user', onPress: () => safetyApi.report(conversationId, 'other') },
      { text: 'Unmatch', style: 'destructive', onPress: () => matchesApi.unmatch(conversationId) },
    ]);

  return (
    <Screen>
      <StackHeader title="Messages" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Pressable onPress={safety} style={styles.safety}>
          <DotsThree size={22} color={colors.gray} weight="bold" />
          <Text style={styles.safetyText}>Safety & options</Text>
        </Pressable>

        {isLoading ? (
          <LoadingSkeleton />
        ) : isError ? (
          <ErrorState message="Could not load messages." onRetry={() => refetch()} />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: spacing.md }}>
            {!data || data.length === 0 ? (
              <View style={{ paddingVertical: spacing.xl }}>
                <Text style={styles.h2}>Break the ice</Text>
                {CONVERSATION_STARTERS.map((s) => (
                  <Pressable key={s} onPress={() => setDraft(s)} style={styles.starter}>
                    <Text style={styles.starterText}>{s}</Text>
                  </Pressable>
                ))}
                <Text style={[styles.h2, { marginTop: spacing.lg }]}>Good things to discuss</Text>
                {LIVING_DISCUSSION_PROMPTS.map((s) => (
                  <Text key={s} style={styles.prompt}>• {s}</Text>
                ))}
              </View>
            ) : (
              data.map((m) => (
                <ChatBubble key={m.id} message={{ ...m, mine: m.senderUserId === userId }} />
              ))
            )}
          </ScrollView>
        )}

        <View style={styles.composer}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Write a message…"
            placeholderTextColor={colors.gray}
            style={styles.input}
            multiline
            maxLength={2000}
          />
          <Button title="Send" onPress={submit} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safety: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end', padding: spacing.sm },
  safetyText: { color: colors.gray, fontWeight: '700' },
  h2: { ...typography.h3, color: colors.charcoal, marginBottom: spacing.sm },
  starter: { backgroundColor: colors.white, borderRadius: radii.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.grayLight },
  starterText: { color: colors.forest, fontWeight: '600' },
  prompt: { fontSize: 13, color: colors.gray, marginBottom: 4 },
  composer: { flexDirection: 'row', gap: 8, paddingVertical: spacing.md, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.grayLight, alignItems: 'flex-end' },
  input: { flex: 1, minHeight: 44, maxHeight: 120, backgroundColor: colors.grayMuted, borderRadius: radii.lg, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: colors.charcoal },
});
