import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowRight, type IconProps } from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';
import { colors, fonts, radii, shadows, spacing, typography } from '@/theme/tokens';

/** Oversized display headline — the voice of the brand. */
export function Hero({ children, size = 'lg', color }: { children: string; size?: 'lg' | 'md'; color?: string }) {
  return <Text style={[size === 'lg' ? styles.hero : styles.heroS, color ? { color } : null]}>{children}</Text>;
}

/** Big circular-chunk CTA pill with an arrow — primary actions everywhere. */
export function ArrowCTA({
  label,
  onPress,
  variant = 'lime',
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: 'lime' | 'forest' | 'cream';
  style?: object;
}) {
  const bg = variant === 'lime' ? colors.lime : variant === 'forest' ? colors.forest : colors.cream;
  const fg = variant === 'lime' ? colors.forestDeep : variant === 'forest' ? colors.lime : colors.forestDeep;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      style={({ pressed }) => [
        styles.cta,
        { backgroundColor: bg },
        pressed && { opacity: 0.88 },
        style,
      ]}
    >
      <Text style={[styles.ctaLabel, { color: fg }]}>{label}</Text>
      <View style={[styles.ctaArrow, { backgroundColor: variant === 'lime' ? colors.forestDeep : fg }]}>
        <ArrowRight size={18} weight="bold" color={bg} />
      </View>
    </Pressable>
  );
}

/** Big-number stat tile ("5 shared tastes") in the detail-card language. */
export function StatTile({ icon, value, label, dark }: { icon: React.ReactNode; value: string; label: string; dark?: boolean }) {
  return (
    <View style={[styles.tile, dark && styles.tileDark]}>
      <View style={styles.tileIcon}>{icon}</View>
      <Text style={[styles.tileValue, dark && styles.tileValueDark]}>{value}</Text>
      <Text style={[styles.tileLabel, dark && styles.tileLabelDark]} numberOfLines={2}>{label}</Text>
    </View>
  );
}

/** Rotated sticker badge — match scores, move-in timing, anything to shout. */
export function StickerBadge({ label, value, rotate = -6 }: { label: string; value: string; rotate?: number }) {
  return (
    <View style={[styles.badge, { transform: [{ rotate: `${rotate}deg` }] }]}>
      <Text style={styles.badgeValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
        {value}
      </Text>
      <Text style={styles.badgeLabel}>{label}</Text>
    </View>
  );
}

/** Color-blocked promo card with playful shapes — marketing moments. */
export function PromoCard({
  title,
  subtitle,
  ctaLabel,
  onCta,
  ctaVariant = 'cream',
}: {
  title: string;
  subtitle: string;
  ctaLabel: string;
  onCta: () => void;
  ctaVariant?: 'cream' | 'lime';
}) {
  return (
    <View style={[styles.promo, shadows.card]}>
      {/* abstract shapes */}
      <View style={styles.shapeA} />
      <View style={styles.shapeB} />
      <Text style={styles.promoTitle}>{title}</Text>
      <Text style={styles.promoSub}>{subtitle}</Text>
      <View style={styles.promoCta}>
        <ArrowCTA label={ctaLabel} onPress={onCta} variant={ctaVariant} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { ...typography.hero },
  heroS: { ...typography.heroSmall },
  cta: {
    minHeight: 56,
    borderRadius: radii.full,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  ctaLabel: { ...typography.h3, color: colors.forestDeep, fontFamily: fonts.sansExtra, flexShrink: 1 },
  ctaArrow: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  tile: {
    flex: 1,
    backgroundColor: colors.cream,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    gap: 4,
  },
  tileDark: { backgroundColor: 'rgba(255,255,255,0.14)' },
  tileIcon: { marginBottom: 2 },
  tileValue: { ...typography.stat, color: colors.forestDeep },
  tileValueDark: { color: colors.lime },
  tileLabel: { ...typography.caption, color: colors.gray, textAlign: 'center' },
  tileLabelDark: { color: 'rgba(255,255,255,0.8)' },
  badge: { backgroundColor: colors.lime, borderRadius: radii.full, paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center' },
  badgeValue: { fontFamily: fonts.display, fontSize: 24, lineHeight: 26, color: colors.forestDeep },
  badgeLabel: { ...typography.caption, color: colors.forestDeep, textTransform: 'uppercase', letterSpacing: 0.5 },
  promo: {
    backgroundColor: colors.forest,
    borderRadius: radii.xl,
    padding: spacing.xl,
    overflow: 'hidden',
  },
  shapeA: {
    position: 'absolute',
    right: -28,
    bottom: -34,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.tangerine,
  },
  shapeB: {
    position: 'absolute',
    right: 54,
    bottom: -6,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.lime,
    opacity: 0.9,
  },
  promoTitle: { ...typography.display, color: colors.lime, fontSize: 34 },
  promoSub: { ...typography.body, color: 'rgba(255,255,255,0.85)', marginTop: spacing.xs },
  promoCta: { marginTop: spacing.lg, alignSelf: 'flex-start' },
});

export type { IconProps };
