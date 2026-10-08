import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { StackHeader } from '@/components/ui/StackHeader';
import { Avatar, LifestyleChip, LoadingSkeleton, ErrorState } from '@/components/ui/primitives';
import { profileApi, discoveryApi, safetyApi } from '@/lib/api/endpoints';
import { useMe as useMyProfile } from '@/hooks/useQueries';
import { compareLifestyle, formatBudget, lifestyleEntries } from '@/utils/format';
import { colors, radii, spacing, typography } from '@/theme/tokens';

export default function FullProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: me } = useMyProfile();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['profile', id],
    queryFn: async () => (await profileApi.getById(String(id))).data,
  });

  const like = async () => {
    try {
      const res = await discoveryApi.action(String(data?.userId ?? id), 'like');
      if (res.data.matched) router.push('/(tabs)/matches');
      else router.back();
    } catch {
      Alert.alert('Not saved', 'Check your connection and try again.');
    }
  };

  const pass = async () => {
    try {
      await discoveryApi.action(String(data?.userId ?? id), 'pass');
      router.back();
    } catch {
      Alert.alert('Not saved', 'Check your connection and try again.');
    }
  };

  const report = () =>
    Alert.alert('Report user', 'Why are you reporting this profile?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Inappropriate content', onPress: () => safetyApi.report(String(id), 'inappropriate') },
      { text: 'Suspicious / scam', onPress: () => safetyApi.report(String(id), 'scam') },
      { text: 'Other', onPress: () => safetyApi.report(String(id), 'other') },
    ]);

  if (isLoading) return <Screen><LoadingSkeleton /></Screen>;
  if (isError || !data)
    return <Screen><ErrorState message="Could not load this profile." onRetry={() => refetch()} /></Screen>;

  const lifestyleChips = lifestyleEntries(data.lifestyle);
  const { agree, discuss } = compareLifestyle(
    me?.lifestyle as Record<string, string> | undefined,
    data.lifestyle as Record<string, string> | undefined,
  );

  return (
    <Screen>
      <StackHeader title={data.displayName} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: spacing.lg, paddingBottom: 40 }}>
        <View style={styles.card}>
          <Avatar name={data.displayName} size={84} />
          <Text style={styles.name}>{data.displayName}, {data.age}</Text>
          <Text style={styles.sub}>{[data.university ?? data.city, data.preferredArea].filter(Boolean).join(' • ')}</Text>
          <Text style={styles.sub}>{[formatBudget(data.budgetMin, data.budgetMax), data.moveInTiming, data.accommodationIntent].filter(Boolean).join(' • ')}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>About</Text>
          <Text style={styles.body}>{data.bio || 'No intro yet.'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>Lifestyle</Text>
          <View style={styles.tags}>
            {lifestyleChips.length > 0 ? lifestyleChips.map(([field, value]) => (
              <LifestyleChip key={field} label={value} />
            )) : <Text style={styles.body}>Not shared yet.</Text>}
          </View>
        </View>

        {me && (agree.length > 0 || discuss.length > 0) && (
          <View style={styles.card}>
            <Text style={styles.section}>How you compare</Text>
            {agree.length > 0 && (
              <>
                <Text style={styles.compareH}>You both agree on</Text>
                {agree.map((a) => <Text key={a} style={styles.body}>• {a}</Text>)}
              </>
            )}
            {discuss.length > 0 && (
              <>
                <Text style={styles.compareH}>Worth discussing</Text>
                {discuss.map((d) => <Text key={d} style={styles.body}>• {d}</Text>)}
                <Text style={styles.note}>This is just a conversation starter — not a compatibility score.</Text>
              </>
            )}
          </View>
        )}

        <View style={{ flexDirection: 'row', gap: 12, marginTop: spacing.xl }}>
          <View style={{ flex: 1 }}><Button title="Pass" variant="secondary" onPress={pass} /></View>
          <View style={{ flex: 1 }}><Button title="Like" onPress={like} /></View>
        </View>
        <Button title="Report" variant="ghost" onPress={report} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: radii.xl, padding: spacing.xl, marginBottom: spacing.lg, alignItems: 'center' },
  name: { ...typography.h1, color: colors.charcoal, marginTop: spacing.sm },
  sub: { ...typography.bodySmall, color: colors.gray, textAlign: 'center' },
  section: { ...typography.h3, color: colors.charcoal, alignSelf: 'flex-start', marginBottom: spacing.sm },
  body: { ...typography.bodySmall, color: colors.charcoal, alignSelf: 'flex-start' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', alignSelf: 'flex-start' },
  compareH: { fontWeight: '800', color: colors.forest, marginTop: spacing.md, alignSelf: 'flex-start' },
  note: { fontSize: 12, color: colors.gray, marginTop: spacing.sm, alignSelf: 'flex-start' },
});
