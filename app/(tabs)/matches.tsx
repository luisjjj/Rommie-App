import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Avatar, EmptyState, LoadingSkeleton, ErrorState } from '@/components/ui/primitives';
import { useMatches } from '@/hooks/useQueries';
import { useHideTabBarOnScroll } from '@/lib/navigation/tabBar';
import { timeAgo } from '@/utils/format';
import { colors, spacing, typography } from '@/theme/tokens';

export default function MatchesScreen() {
  const { data, isLoading, isError, refetch } = useMatches();
  const scrollHide = useHideTabBarOnScroll();

  return (
    <Screen>
      <Text style={styles.h1}>Matches</Text>
      <Text style={styles.sub}>A match means you both want to get to know each other — not a confirmed roommate.</Text>
      {isLoading ? (
        <LoadingSkeleton />
      ) : isError ? (
        <ErrorState message="Could not load matches." onRetry={() => refetch()} />
      ) : !data || data.length === 0 ? (
        <EmptyState title="No matches yet" body="Like people in Discover. When they like you back, you'll match." actionLabel="Discover people" onAction={() => router.push('/(tabs)/discover')} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(m) => m.id}
          {...scrollHide}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: spacing.lg, paddingBottom: 120 }}
          renderItem={({ item }) => (
            <Pressable onPress={() => router.push(`/chat/${item.id}`)} style={styles.row}>
              <Avatar name={item.otherUser.displayName} size={54} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.otherUser.displayName}</Text>
                <Text style={styles.preview} numberOfLines={1}>
                  {item.lastMessagePreview ?? 'Say hello'}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
                {(item.unreadCount ?? 0) > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.unreadCount}</Text>
                  </View>
                )}
              </View>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  h1: { ...typography.h1, color: colors.charcoal, paddingTop: spacing.lg },
  sub: { ...typography.bodySmall, color: colors.gray, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: 16, padding: 14, marginBottom: 12 },
  name: { fontWeight: '800', color: colors.charcoal },
  preview: { fontSize: 13, color: colors.gray },
  time: { fontSize: 11, color: colors.gray },
  badge: { backgroundColor: colors.yellow, borderRadius: 999, minWidth: 22, height: 22, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  badgeText: { fontWeight: '800', fontSize: 12 },
});
