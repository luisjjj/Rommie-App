import { ScrollView, StyleSheet, Text } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { StackHeader } from '@/components/ui/StackHeader';
import { colors, spacing, typography } from '@/theme/tokens';

const TIPS = [
  'Talk before agreeing to live together.',
  'Meet in a suitable public place where possible.',
  'Confirm accommodation details independently.',
  'Avoid sending money to someone based only on an online interaction.',
  'Tell someone you trust before meeting a new contact.',
  'Never share exact addresses or bank details in chat.',
];

export default function Safety() {
  return (
    <Screen>
      <StackHeader title="Safety" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: spacing.xl }}>
        <Text style={styles.h1}>Stay safe on Roomie</Text>
        <Text style={styles.body}>
          Roomie helps you meet people — you decide who to live with. Verification badges (when introduced) never
          guarantee safety.
        </Text>
        {TIPS.map((t) => (
          <Text key={t} style={styles.tip}>• {t}</Text>
        ))}
        <Text style={styles.body}>
          You can report, block, or unmatch from any profile or conversation. Reports are reviewed; abusive or
          suspicious behaviour may lead to removal.
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  h1: { ...typography.h1, color: colors.charcoal, marginBottom: spacing.md },
  body: { ...typography.bodySmall, color: colors.charcoal, marginBottom: spacing.md },
  tip: { ...typography.bodySmall, color: colors.charcoal, marginBottom: 8 },
});
