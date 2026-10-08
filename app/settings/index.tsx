import { StyleSheet, Text } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { StackHeader } from '@/components/ui/StackHeader';
import { router } from 'expo-router';
import { colors, typography } from '@/theme/tokens';

export default function Settings() {
  return (
    <Screen style={styles.body}>
      <StackHeader title="Settings" />
      <Button title="Safety & Community Guidelines" variant="secondary" onPress={() => router.push('/settings/safety')} />
      <Button title="Notification Preferences (coming soon)" variant="ghost" onPress={() => {}} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { gap: 12 },
  h1: { ...typography.h1, color: colors.charcoal },
});
