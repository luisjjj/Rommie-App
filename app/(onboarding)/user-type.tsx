import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { StepProgress } from '@/components/onboarding/StepProgress';
import { useOnboarding } from '@/store/useStore';
import { colors, radii, spacing, typography } from '@/theme/tokens';

export default function UserType() {
  const { userType, setUserType } = useOnboarding();

  return (
    <Screen>
      <StepProgress step={1} />
      <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.step}>Step 1 of 7</Text>
      <Text style={styles.h1}>Which best describes you?</Text>
      <View style={{ gap: spacing.md, marginTop: spacing.xl }}>
        <Pressable
          onPress={() => setUserType('student')}
          style={[styles.card, userType === 'student' && styles.cardOn]}
        >
          <Text style={styles.cardTitle}>I’m a student</Text>
          <Text style={styles.cardBody}>Find roommates around your university. Connect with your student community.</Text>
        </Pressable>
        <Pressable
          onPress={() => setUserType('general')}
          style={[styles.card, userType === 'general' && styles.cardOn]}
        >
          <Text style={styles.cardTitle}>I’m looking beyond campus</Text>
          <Text style={styles.cardBody}>For young professionals, NYSC members, people relocating, and others.</Text>
        </Pressable>
      </View>
      <View style={{ marginTop: spacing.xxxl }}>
        <Button
          title="Continue"
          disabled={!userType}
          onPress={() => router.push('/(onboarding)/basic-profile')}
        />
      </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  step: { ...typography.caption, color: colors.gray },
  h1: { ...typography.h1, color: colors.charcoal, marginTop: 4 },
  card: { backgroundColor: colors.white, borderRadius: radii.xl, padding: spacing.xl, borderWidth: 2, borderColor: 'transparent' },
  cardOn: { borderColor: colors.forest },
  cardTitle: { ...typography.h2, color: colors.charcoal },
  cardBody: { ...typography.bodySmall, color: colors.gray, marginTop: 4 },
});
