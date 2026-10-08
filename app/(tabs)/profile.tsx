import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { User } from 'phosphor-react-native';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { Avatar, LifestyleChip } from '@/components/ui/primitives';
import { useMe } from '@/hooks/useQueries';
import { useHideTabBarOnScroll } from '@/lib/navigation/tabBar';
import { setToken } from '@/lib/api/client';
import { isDummyAuth } from '@/lib/auth/dummy';
import { neonSignOut } from '@/lib/auth/neon';
import { useSession } from '@/store/useStore';
import { formatBudget, lifestyleEntries } from '@/utils/format';
import { colors, radii, spacing, typography } from '@/theme/tokens';

export default function OwnProfile() {
  const { data: me } = useMe();
  const scrollHide = useHideTabBarOnScroll();
  const setSession = useSession((s) => s.setSession);

  const logout = async () => {
    if (isDummyAuth) await setToken(null);
    else await neonSignOut();
    setSession(null, null);
    router.replace('/(onboarding)/welcome');
  };

  if (!me) {
    return (
      <Screen>
        <View style={styles.emptyWrap}>
          <View style={styles.medallion}>
            <User size={44} color={colors.forest} weight="duotone" />
          </View>
          <Text style={styles.h1Center}>Profile</Text>
          <Text style={styles.subCenter}>Log in and complete onboarding to see your profile.</Text>
          <View style={styles.emptyCta}>
            <Button title="Get Started" onPress={() => router.replace('/(onboarding)/welcome')} />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        {...scrollHide}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: spacing.lg, paddingBottom: 120 }}
      >
        <View style={styles.card}>
          <Avatar name={me.displayName} size={72} />
          <Text style={styles.name}>{me.displayName}, {me.age}</Text>
          <Text style={styles.sub}>{[me.university ?? me.city, formatBudget(me.budgetMin, me.budgetMax)].join(' • ')}</Text>
          <Text style={styles.bio}>{me.bio}</Text>
          <View style={styles.tags}>
            {lifestyleEntries(me.lifestyle).map(([field, value]) => (
              <LifestyleChip key={field} label={value} />
            ))}
          </View>
        </View>
        <View style={{ gap: 12 }}>
          <Button title="Preview Public Profile" variant="secondary" onPress={() => router.push(`/profile/${me.id}`)} />
          <Button title="Safety & Community Guidelines" variant="secondary" onPress={() => router.push('/settings/safety')} />
          <Button title="Settings" variant="secondary" onPress={() => router.push('/settings')} />
          <Button title="Log Out" variant="ghost" onPress={() => Alert.alert('Log out?', 'You can log back in anytime.', [{ text: 'Cancel' }, { text: 'Log Out', onPress: logout }])} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  h1: { ...typography.h1, color: colors.charcoal },
  h1Center: { ...typography.h1, color: colors.charcoal, textAlign: 'center' },
  subCenter: { ...typography.bodySmall, color: colors.gray, textAlign: 'center', marginTop: spacing.sm },
  emptyWrap: { flex: 1, justifyContent: 'center' },
  medallion: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.forestSoft,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  emptyCta: { marginTop: spacing.xxl },
  card: { backgroundColor: colors.white, borderRadius: radii.xl, padding: spacing.xl, alignItems: 'center', marginBottom: spacing.lg },
  name: { ...typography.h1, color: colors.charcoal, marginTop: spacing.md },
  sub: { ...typography.bodySmall, color: colors.gray },
  bio: { ...typography.bodySmall, color: colors.charcoal, marginTop: spacing.sm, textAlign: 'center' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: spacing.md },
});
