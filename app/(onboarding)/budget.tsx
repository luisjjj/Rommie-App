import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { StepProgress } from '@/components/onboarding/StepProgress';
import { Chip } from '@/components/ui/primitives';
import { BUDGET_RANGES, BUDGET_PERIOD_LABEL } from '@/constants/options';
import { useOnboarding } from '@/store/useStore';
import { colors, spacing, typography } from '@/theme/tokens';

export default function BudgetStep() {
  const { patch, data } = useOnboarding();
  const [idx, setIdx] = React.useState<number>(-1);

  return (
    <Screen>
      <StepProgress step={4} />
      <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.step}>Step 4 of 7</Text>
      <Text style={styles.h1}>What’s your accommodation budget?</Text>
      <Text style={styles.sub}>{BUDGET_PERIOD_LABEL} — in naira.</Text>
      <View style={styles.chips}>
        {BUDGET_RANGES.map((r, i) => (
          <Chip key={r.label} label={r.label} selected={idx === i} onPress={() => setIdx(i)} />
        ))}
      </View>
      <Button
        title="Continue"
        disabled={idx < 0}
        onPress={() => {
          const r = BUDGET_RANGES[idx];
          patch({ budgetMin: r.min, budgetMax: r.max });
          router.push('/(onboarding)/lifestyle');
        }}
      />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  step: { fontSize: 12, color: colors.gray },
  h1: { ...typography.h1, color: colors.charcoal },
  sub: { ...typography.bodySmall, color: colors.gray, marginBottom: spacing.lg },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.xl },
});
