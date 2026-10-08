import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { StepProgress } from '@/components/onboarding/StepProgress';
import { Chip } from '@/components/ui/primitives';
import { LIFESTYLE_OPTIONS } from '@/constants/options';
import { useOnboarding } from '@/store/useStore';
import { colors, spacing, typography } from '@/theme/tokens';

export default function LifestyleStep() {
  const { patch } = useOnboarding();
  const [answers, setAnswers] = React.useState<Record<string, string>>({});

  return (
    <Screen>
      <StepProgress step={5} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPad}>
        <Text style={styles.step}>Step 5 of 7 — no judgement, just fit</Text>
        <Text style={styles.h1}>How do you live?</Text>
        {(Object.keys(LIFESTYLE_OPTIONS) as Array<keyof typeof LIFESTYLE_OPTIONS>).map((key) => (
          <View key={key} style={{ marginTop: spacing.lg }}>
            <Text style={styles.section}>{key.replace(/_/g, ' ')}</Text>
            <View style={styles.chips}>
              {LIFESTYLE_OPTIONS[key].map((opt: string) => (
                <Chip
                  key={opt}
                  label={opt}
                  selected={answers[key] === opt}
                  onPress={() => setAnswers((a) => ({ ...a, [key]: opt }))}
                />
              ))}
            </View>
          </View>
        ))}
        <Button
          title="Continue"
          onPress={() => {
            patch({ lifestyle: answers });
            router.push('/(onboarding)/intent');
          }}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollPad: { paddingBottom: spacing.xxxl },
  step: { fontSize: 12, color: colors.gray },
  h1: { ...typography.h1, color: colors.charcoal },
  section: { ...typography.h3, color: colors.charcoal, textTransform: 'capitalize', marginBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
});
