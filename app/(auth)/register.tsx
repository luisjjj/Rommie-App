import React from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { AppLogo } from '@/components/ui/AppLogo';
import { FormField } from '@/components/ui/FormField';
import { Screen } from '@/components/ui/Screen';
import { registerSchema, type RegisterInput } from '@/lib/validation/schemas';
import { authApi } from '@/lib/api/endpoints';
import { dummySignIn, isDummyAuth } from '@/lib/auth/dummy';
import { getAccessToken, neonSignUp } from '@/lib/auth/neon';
import { useSession } from '@/store/useStore';
import { colors, radii, shadows, spacing, typography } from '@/theme/tokens';

export default function RegisterScreen() {
  const setSession = useSession((s) => s.setSession);
  const [serverError, setServerError] = React.useState('');
  const [accepted, setAccepted] = React.useState(false);
  const { control, handleSubmit, formState: { isSubmitting } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', terms: true as unknown as true },
  });

  const onSubmit = async (v: RegisterInput) => {
    setServerError('');
    try {
      if (isDummyAuth) {
        // Building mode: any details work, no backend needed.
        const res = await dummySignIn(v.email);
        setSession(res.token, res.user.id);
        router.replace('/(onboarding)/user-type');
        return;
      }
      // Neon Auth: create the managed identity, then link the app account.
      await neonSignUp(v.email, v.password);
      const token = await getAccessToken();
      const sync = await authApi.sync(v.email);
      setSession(token, sync.data.id);
      router.replace('/(onboarding)/user-type');
    } catch (e: unknown) {
      const resMsg = (e as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      setServerError(resMsg ?? (e instanceof Error ? e.message : 'Could not create your account. Try again.'));
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.decorWrap} pointerEvents="none">
            <View style={styles.blob} />
            <View style={styles.dot} />
          </View>

          <View style={styles.brand}>
            <AppLogo size={48} />
            <Text style={styles.wordmark}>Roomie</Text>
          </View>

          <Text style={styles.headline}>Create your account.</Text>
          <Text style={styles.sub}>Set up your login first — your roommate profile comes right after.</Text>

          <View style={styles.card}>
            <FormField control={control} name="email" label="Email" placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
            <FormField control={control} name="password" label="Password" placeholder="Min. 8 characters" secureTextEntry />
            <Pressable onPress={() => setAccepted(!accepted)} style={styles.terms}>
              <View style={[styles.box, accepted && styles.boxOn]} />
              <Text style={styles.termsText}>I agree to the Terms & Privacy Policy</Text>
            </Pressable>
            {serverError ? <Text style={styles.err}>{serverError}</Text> : null}
            <View style={styles.cta}>
              <Button title="Continue" loading={isSubmitting} onPress={handleSubmit(onSubmit)} />
            </View>
          </View>

          <Button title="I already have an account" variant="ghost" onPress={() => router.push('/(auth)/login')} />
          {isDummyAuth ? (
            <Text style={styles.demo}>Demo mode — any details work, no backend needed.</Text>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingTop: spacing.xxxl, paddingBottom: spacing.xl },
  decorWrap: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  blob: {
    position: 'absolute',
    top: -110,
    right: -110,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: colors.forestSoft,
  },
  dot: {
    position: 'absolute',
    top: 96,
    right: 44,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.yellow,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  wordmark: { fontSize: 22, fontWeight: '800', color: colors.forest },
  headline: { ...typography.display, color: colors.charcoal, marginTop: spacing.xxl },
  sub: { ...typography.body, color: colors.gray, marginTop: spacing.sm },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginTop: spacing.xxl,
    ...shadows.card,
  },
  terms: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: spacing.lg },
  box: { width: 22, height: 22, borderRadius: 6, borderWidth: 1, borderColor: colors.gray },
  boxOn: { backgroundColor: colors.forest, borderColor: colors.forest },
  termsText: { flex: 1, fontSize: 14, color: colors.charcoal },
  err: { fontSize: 14, color: colors.danger, marginBottom: 12 },
  cta: { marginTop: spacing.sm },
  demo: { fontSize: 12, color: colors.gray, textAlign: 'center', marginTop: spacing.md },
});
