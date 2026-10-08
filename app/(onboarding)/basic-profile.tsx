import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Screen } from '@/components/ui/Screen';
import { StepProgress } from '@/components/onboarding/StepProgress';
import { basicProfileSchema } from '@/lib/validation/schemas';
import { useOnboarding } from '@/store/useStore';
import { saveOnboardingProgress } from '@/lib/storage/local';
import { colors, spacing, typography } from '@/theme/tokens';

export default function BasicProfile() {
  const { patch } = useOnboarding();
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(basicProfileSchema),
    defaultValues: { displayName: '', age: undefined as unknown as number, bio: '' },
  });

  const onSubmit = async (v: { displayName: string; age: number; bio?: string }) => {
    patch(v);
    await saveOnboardingProgress('basic', v);
    router.push('/(onboarding)/location');
  };

  return (
    <Screen>
      <StepProgress step={2} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollPad}
          keyboardShouldPersistTaps="handled"
        >
        <Text style={styles.step}>Step 2 of 7 — photo can be added later</Text>
        <Text style={styles.h1}>Tell us about you</Text>
        <FormField control={control} name="displayName" label="First name or nickname" placeholder="Ada" />
        <FormField control={control} name="age" label="Age (16+)" placeholder="21" keyboardType="numeric" />
        <FormField control={control} name="bio" label="Short intro" placeholder="Final-year student, early sleeper…" maxLength={280} />
        <Text style={styles.hint}>Adding a photo later helps others recognise you. You can skip it for now.</Text>
        <Button title="Continue" onPress={handleSubmit(onSubmit)} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollPad: { paddingBottom: spacing.xxxl },
  step: { fontSize: 12, color: colors.gray },
  h1: { ...typography.h1, color: colors.charcoal, marginBottom: spacing.lg },
  hint: { fontSize: 13, color: colors.gray, marginBottom: spacing.lg },
});
