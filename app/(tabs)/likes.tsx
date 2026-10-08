import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Heart } from 'phosphor-react-native';
import { Screen } from '@/components/ui/Screen';
import { Avatar, EmptyState, LoadingSkeleton, ErrorState } from '@/components/ui/primitives';
import { useLikesReceived, useLikeAction } from '@/hooks/useQueries';
import { useHideTabBarOnScroll } from '@/lib/navigation/tabBar';
import { colors, spacing, typography } from '@/theme/tokens';

export default function LikesScreen() {
  const { data, isLoading, isError, refetch } = useLikesReceived();
  const like = useLikeAction();
  const scrollHide = useHideTabBarOnScroll();

  return (
    <Screen>
      <Text style={styles.h1}>Likes</Text>
      {isLoading ? (
        <LoadingSkeleton />
      ) : isError ? (
        <ErrorState message="Could not load likes." onRetry={() => refetch()} />
      ) : !data || data.length === 0 ? (
        <EmptyState title="No likes yet" body="When someone likes you, they'll show up here." />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(p) => p.id}
          {...scrollHide}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: spacing.lg, paddingBottom: 120 }}
          renderItem={({ item }) => (
            <Pressable onPress={() => router.push(`/profile/${item.id}`)} style={styles.row}>
              <Avatar name={item.displayName} size={52} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.displayName}, {item.age}</Text>
                <Text style={styles.sub} numberOfLines={1}>{item.bio || item.university || item.city}</Text>
              </View>
              <Pressable
                onPress={() => like.mutate({ userId: item.userId, action: 'like' })}
                style={styles.likeBtn}
              >
                <Heart size={14} color={colors.white} weight="fill" />
                <Text style={styles.likeText}>Like back</Text>
              </Pressable>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  h1: { ...typography.h1, color: colors.charcoal, paddingVertical: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: 16, padding: 14, marginBottom: 12 },
  name: { fontWeight: '800', color: colors.charcoal },
  sub: { fontSize: 13, color: colors.gray },
  likeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.forest, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 },
  likeText: { color: colors.white, fontWeight: '700' },
});
