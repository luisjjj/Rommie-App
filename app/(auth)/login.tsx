import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { AppLogo } from '@/components/ui/AppLogo';
import { FormField } from '@/components/ui/FormField';
import { Screen } from '@/components/ui/Screen';
import { loginSchema, type LoginInput } from '@/lib/validation/schemas';
import { authApi } from '@/lib/api/endpoints';
import { dummySignIn, isDummyAuth } from '@/lib/auth/dummy';
import { getAccessToken, neonSignIn } from '@/lib/auth/neon';
import { useSession } from '@/store/useStore';
import { colors, radii, shadows, spacing, typography } from '@/theme/tokens';

export default function LoginScreen() {
  const setSession = useSession((s) => s.setSession);
  const [serverError, setServerError] = React.useState('');
  const { control, handleSubmit, formState: { isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (v: LoginInput) => {
    setServerError('');
    try {
      if (isDummyAuth) {
        // Building mode: any credentials work, no backend needed.
        const res = await dummySignIn(v.email);
        setSession(res.token, res.user.id);
        router.replace('/(tabs)/discover');
        return;
      }
      // Neon Auth: sign in against managed auth, then link the app account.
      await neonSignIn(v.email, v.password);
      const token = await getAccessToken();
      const sync = await authApi.sync(v.email);
      setSession(token, sync.data.id);
      router.replace('/(tabs)/discover');
    } catch (e: unknown) {
      const resMsg = (e as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      setServerError(resMsg ?? (e instanceof Error ? e.message : 'Could not log you in. Check your details and try again.'));
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

          <Text style={styles.headline}>Welcome back.</Text>
          <Text style={styles.sub}>Log in to keep discovering people you could actually live with.</Text>

          <View style={styles.card}>
            <FormField control={control} name="email" label="Email" placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
            <FormField control={control} name="password" label="Password" placeholder="••••••••" secureTextEntry />
            {serverError ? <Text style={styles.err}>{serverError}</Text> : null}
            <View style={styles.cta}>
              <Button title="Log In" loading={isSubmitting} onPress={handleSubmit(onSubmit)} />
            </View>
          </View>

          <Button title="New here? Create an account" variant="ghost" onPress={() => router.push('/(auth)/register')} />
          {isDummyAuth ? (
            <Text style={styles.demo}>Demo mode — any credentials work, no backend needed.</Text>
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
  err: { ...typography.bodySmall, color: colors.danger, marginBottom: spacing.md },
  cta: { marginTop: spacing.sm },
  demo: { ...typography.caption, color: colors.gray, textAlign: 'center', marginTop: spacing.md },
});
