import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { StepProgress } from '@/components/onboarding/StepProgress';
import { Chip } from '@/components/ui/primitives';
import { NIGERIAN_CITIES, NIGERIAN_UNIVERSITIES } from '@/constants/options';
import { useOnboarding } from '@/store/useStore';
import { saveOnboardingProgress } from '@/lib/storage/local';
import { colors, spacing, typography } from '@/theme/tokens';

export default function LocationStep() {
  const { userType, data, patch } = useOnboarding();
  const [uni, setUni] = React.useState<string>((data.university as string) ?? '');
  const [city, setCity] = React.useState<string>((data.city as string) ?? '');
  const student = userType !== 'general';

  const next = async () => {
    const payload = student ? { university: uni, city: '' } : { city, university: '' };
    patch(payload);
    await saveOnboardingProgress('location', payload);
    router.push('/(onboarding)/budget');
  };

  return (
    <Screen>
      <StepProgress step={3} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPad}>
        <Text style={styles.step}>Step 3 of 7 — we never publish exact addresses</Text>
        <Text style={styles.h1}>{student ? 'Your campus community' : 'Your city'}</Text>
        {student ? (
          <View style={styles.chips}>
            {NIGERIAN_UNIVERSITIES.map((u) => (
              <Chip key={u} label={u} selected={uni === u} onPress={() => setUni(u)} />
            ))}
          </View>
        ) : (
          <View style={styles.chips}>
            {NIGERIAN_CITIES.map((c) => (
              <Chip key={c} label={c} selected={city === c} onPress={() => setCity(c)} />
            ))}
          </View>
        )}
        <Button title="Continue" disabled={student ? !uni : !city} onPress={next} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollPad: { paddingBottom: spacing.xxxl },
  step: { fontSize: 12, color: colors.gray },
  h1: { ...typography.h1, color: colors.charcoal, marginBottom: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.xl },
});
