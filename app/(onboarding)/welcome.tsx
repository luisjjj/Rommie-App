import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { AppLogo } from '@/components/ui/AppLogo';
import { Screen } from '@/components/ui/Screen';
import { colors, spacing, typography } from '@/theme/tokens';

export default function Welcome() {
  return (
    <Screen>
      <View style={styles.inner}>
        <View style={styles.logoWrap}>
          <AppLogo size={84} />
        </View>
        <Text style={styles.h1}>Find someone you’ll actually enjoy living with.</Text>
        <Text style={styles.body}>
          Meet people looking for roommates around your campus or city, and find out whether your lifestyles fit before
          you move in.
        </Text>
        <View style={{ gap: spacing.md, marginTop: spacing.xxxl }}>
          <Button title="Get Started" onPress={() => router.push('/(onboarding)/user-type')} />
          <Button title="I already have an account" variant="ghost" onPress={() => router.push('/(auth)/login')} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.sm },
  logoWrap: { marginBottom: spacing.xl },
  h1: { ...typography.display, color: colors.charcoal, marginBottom: spacing.md },
  body: { ...typography.body, color: colors.gray },
});
