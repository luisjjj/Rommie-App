import { StyleSheet, Text, View } from 'react-native';
import { CaretDown, MagnifyingGlass, SlidersHorizontal, MapPin } from 'phosphor-react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { AppLogo } from '@/components/ui/AppLogo';
import { Screen } from '@/components/ui/Screen';
import { ArrowCTA, Hero, PromoCard } from '@/components/ui/brand';
import { Chip } from '@/components/ui/primitives';
import { colors, fonts, radii, spacing } from '@/theme/tokens';

const PREVIEW_TAGS = ['Clean space', 'Night owl', 'Early bird', 'Cooks'];

export default function Welcome() {
  return (
    <Screen>
      <View style={styles.inner}>
        {/* masthead */}
        <View style={styles.masthead}>
          <AppLogo size={72} />
          <View style={styles.mastheadDot}>
            <Text style={styles.mastheadDots}>•••</Text>
          </View>
        </View>

        {/* oversized display headline */}
        <View style={styles.headline}>
          <Hero>FIND</Hero>
          <Hero>YOUR</Hero>
          <Hero>ROOMIE</Hero>
        </View>

        {/* location pill + quick actions */}
        <View style={styles.locRow}>
          <View style={styles.locPill}>
            <MapPin size={18} weight="fill" color={colors.tangerine} />
            <Text style={styles.locText}>Lagos</Text>
            <CaretDown size={16} weight="bold" color={colors.gray} />
          </View>
          <View style={[styles.roundBtn, { backgroundColor: colors.lime }]}>
            <MagnifyingGlass size={22} weight="bold" color={colors.forestDeep} />
          </View>
          <View style={[styles.roundBtn, { backgroundColor: colors.creamDark }]}>
            <SlidersHorizontal size={22} weight="bold" color={colors.forestDeep} />
          </View>
        </View>

        {/* vibe chips preview */}
        <View style={styles.chips}>
          {PREVIEW_TAGS.map((tag, i) => (
            <Chip
              key={tag}
              label={tag}
              selected={i === 0}
              onPress={() => router.push('/(onboarding)/user-type')}
            />
          ))}
        </View>

        {/* color-blocked promo */}
        <PromoCard
          title="The Vibe Check"
          subtitle="People whose daily habits fit yours."
          ctaLabel="Explore"
          onCta={() => router.push('/(onboarding)/user-type')}
        />

        {/* entry actions */}
        <View style={styles.actions}>
          <Button title="Get Started" onPress={() => router.push('/(onboarding)/user-type')} />
          <Button title="I already have an account" variant="ghost" onPress={() => router.push('/(auth)/login')} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  inner: { flex: 1, gap: spacing.lg, paddingTop: spacing.sm },
  masthead: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  mastheadDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mastheadDots: { color: colors.charcoal, fontFamily: fonts.sansExtra, fontSize: 14, letterSpacing: 2 },
  headline: { gap: 0, marginTop: spacing.xs },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: spacing.xs },
  locPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.white,
    borderRadius: radii.full,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  locText: { fontFamily: fonts.sansExtra, fontSize: 16, lineHeight: 20, color: colors.charcoal },
  roundBtn: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: -spacing.sm },
  actions: { gap: spacing.sm, paddingBottom: spacing.sm },
});
