import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { StepProgress } from '@/components/onboarding/StepProgress';
import { Chip } from '@/components/ui/primitives';
import { ACCOMMODATION_INTENTS, MOVE_IN_OPTIONS } from '@/constants/options';
import { useOnboarding } from '@/store/useStore';
import { colors, spacing, typography } from '@/theme/tokens';

export default function IntentStep() {
  const { patch } = useOnboarding();
  const [intent, setIntent] = React.useState('');
  const [timing, setTiming] = React.useState('');

  return (
    <Screen>
      <StepProgress step={6} />
      <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.step}>Step 6 of 7</Text>
      <Text style={styles.h1}>What brings you to Roomie?</Text>
      <View style={styles.chips}>
        {ACCOMMODATION_INTENTS.map((o) => (
          <Chip key={o.value} label={o.label} selected={intent === o.value} onPress={() => setIntent(o.value)} />
        ))}
      </View>
      <Text style={styles.h1}>Move-in timeframe</Text>
      <View style={styles.chips}>
        {MOVE_IN_OPTIONS.map((m) => (
          <Chip key={m} label={m} selected={timing === m} onPress={() => setTiming(m)} />
        ))}
      </View>
      <Button
        title="Review My Profile"
        disabled={!intent || !timing}
        onPress={() => {
          patch({ accommodationIntent: intent, moveInTiming: timing });
          router.push('/(onboarding)/review');
        }}
      />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  step: { fontSize: 12, color: colors.gray },
  h1: { ...typography.h2, color: colors.charcoal, marginVertical: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.lg },
});
