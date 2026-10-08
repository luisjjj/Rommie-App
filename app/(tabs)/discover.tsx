import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SlidersHorizontal } from 'phosphor-react-native';
import { AppLogo } from '@/components/ui/AppLogo';
import { Screen } from '@/components/ui/Screen';
import { SwipeDeck } from '@/components/discovery/SwipeDeck';
import { FilterSheet } from '@/components/discovery/FilterSheet';
import { MatchCelebration } from '@/components/discovery/MatchCelebration';
import { LoadingSkeleton, ErrorState } from '@/components/ui/primitives';
import { useDiscovery, useLikeAction } from '@/hooks/useQueries';
import { useDiscoveryUI } from '@/store/useStore';
import { saveFilters, loadFilters } from '@/lib/storage/local';
import { colors, spacing, typography } from '@/theme/tokens';
import type { DiscoveryFilters } from '@/types';

export default function DiscoverScreen() {
  const { filters, setFilters } = useDiscoveryUI();
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [celebration, setCelebration] = React.useState<string | null>(null);
  const { data, isLoading, isError, refetch } = useDiscovery(filters);
  const likeMutation = useLikeAction();

  React.useEffect(() => {
    loadFilters<DiscoveryFilters>().then((f) => f && setFilters(f));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const act = async (userId: string, name: string, action: 'like' | 'pass') => {
    Haptics.selectionAsync().catch(() => {});
    try {
      const res = await likeMutation.mutateAsync({ userId, action });
      if (action === 'like' && res.matched) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        setCelebration(name);
      }
    } catch {
      /* error toast via ErrorState on next fetch; optimistic guard keeps single-flight */
    }
  };

  const activeCount = Object.values(filters).filter((v) => v !== undefined && v !== '').length;
  const filtersKey = JSON.stringify(filters);

  return (
    <Screen>
      <View style={styles.top}>
        <View style={styles.brand}>
          <AppLogo size={38} variant="mark" />
          <Text style={styles.logo}>Roomie</Text>
        </View>
        <Pressable onPress={() => setSheetOpen(true)} style={styles.filterBtn}>
          <SlidersHorizontal size={18} color={colors.forest} weight="bold" />
          <Text style={styles.filterText}>Filters{activeCount ? ` (${activeCount})` : ''}</Text>
        </Pressable>
      </View>
      <Text style={styles.heading}>People around your campus</Text>

      {isLoading ? (
        <LoadingSkeleton />
      ) : isError ? (
        <ErrorState message="We couldn't load new profiles. Your filters are saved." onRetry={() => refetch()} />
      ) : (
        <SwipeDeck
          profiles={data ?? []}
          resetKey={filtersKey}
          onLike={(p) => act(p.userId, p.displayName, 'like')}
          onPass={(p) => act(p.userId, p.displayName, 'pass')}
          onViewProfile={(p) => router.push(`/profile/${p.id}`)}
          onEmptyAction={() => setSheetOpen(true)}
        />
      )}

      <FilterSheet
        visible={sheetOpen}
        initial={filters}
        onClose={() => setSheetOpen(false)}
        onApply={(f) => {
          setFilters(f);
          saveFilters(f);
        }}
        onReset={() => {
          setFilters({});
          saveFilters({});
        }}
      />
      <MatchCelebration
        visible={!!celebration}
        name={celebration ?? ''}
        onMessage={() => {
          setCelebration(null);
          router.push('/(tabs)/matches');
        }}
        onKeepDiscovering={() => setCelebration(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.lg },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { fontSize: 22, fontWeight: '800', color: colors.forest },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.white, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: colors.grayLight },
  filterText: { fontWeight: '700', color: colors.forest },
  heading: { ...typography.h2, color: colors.charcoal, marginBottom: spacing.md },
});
