import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { StepProgress } from '@/components/onboarding/StepProgress';
import { LifestyleChip } from '@/components/ui/primitives';
import { useOnboarding } from '@/store/useStore';
import { profileApi } from '@/lib/api/endpoints';
import { isDummyAuth } from '@/lib/auth/dummy';
import { clearOnboardingProgress } from '@/lib/storage/local';
import { formatBudget, lifestyleEntries } from '@/utils/format';
import { colors, radii, spacing, typography } from '@/theme/tokens';

export default function ReviewStep() {
  const { data, userType, reset } = useOnboarding();
  const [saving, setSaving] = React.useState(false);
  const d = data as Record<string, string | number | Record<string, unknown> | undefined>;
  // Defensive: lifestyle must be a string map. Anything else (missing step,
  // stale state, non-string values) renders as no chips instead of crashing.
  const lifestyleChips = lifestyleEntries(d.lifestyle);
  const lifestyle = Object.fromEntries(lifestyleChips);

  const submit = async () => {
    setSaving(true);
    try {
      if (isDummyAuth) {
        // Building mode: skip the API, keep answers on-device, enter the app.
        await clearOnboardingProgress();
        reset();
        router.replace('/(tabs)/discover');
        return;
      }
      await profileApi.updateMe({
        displayName: d.displayName as string,
        age: Number(d.age),
        bio: (d.bio as string) ?? '',
        userType: (userType ?? 'student') as 'student' | 'general',
        university: d.university as string,
        city: d.city as string,
        budgetMin: d.budgetMin as number,
        budgetMax: d.budgetMax as number,
        moveInTiming: d.moveInTiming as string,
        accommodationIntent: d.accommodationIntent as string,
        lifestyle,
      } as never);
      await clearOnboardingProgress();
      reset();
      router.replace('/(tabs)/discover');
    } catch (e: unknown) {
      const res = (e as { response?: { status?: number; data?: { error?: { code?: string; message?: string } } } })?.response;
      if (!res) {
        Alert.alert('No connection', 'Could not reach the Roomie server. Check your connection and try again.');
      } else if (res.status === 401) {
        Alert.alert('Please log in', 'Your session is missing or expired. Log in to your account, then create your profile again.');
      } else if (res.data?.error?.code === 'ACCOUNT_NOT_SYNCED') {
        Alert.alert('Account not linked', 'Your login is not linked to a Roomie account yet. Log out and log in again.');
      } else {
        Alert.alert('Could not save', res.data?.error?.message ?? 'Check your connection and try again. Your answers are saved on this device.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <StepProgress step={7} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPad}>
        <Text style={styles.step}>Step 7 of 7 — preview as others see it</Text>
        <View style={styles.card}>
          <Text style={styles.name}>{String(d.displayName ?? 'You')}, {String(d.age ?? '')}</Text>
          <Text style={styles.sub}>{[d.university ?? d.city, formatBudget(d.budgetMin as number, d.budgetMax as number), d.moveInTiming].filter(Boolean).join(' • ')}</Text>
          <Text style={styles.bio}>{String(d.bio ?? '')}</Text>
          <View style={styles.tags}>
            {lifestyleChips.map(([field, value]) => (
              <LifestyleChip key={field} label={value} />
            ))}
          </View>
        </View>
        <Button title="Create My Profile" loading={saving} onPress={submit} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollPad: { paddingBottom: spacing.xxxl },
  step: { fontSize: 12, color: colors.gray },
  card: { backgroundColor: colors.white, borderRadius: radii.xl, padding: spacing.xl, marginVertical: spacing.lg },
  name: { ...typography.h1, color: colors.charcoal },
  sub: { ...typography.bodySmall, color: colors.gray },
  bio: { ...typography.bodySmall, color: colors.charcoal, marginTop: spacing.sm },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.md },
});
