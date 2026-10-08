import React from 'react';
import { Pressable, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { colors, radii, spacing, typography } from '@/theme/tokens';

export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.base, selected && styles.selected]}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
    </Pressable>
  );
}

export function LifestyleChip({ label }: { label: string }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{label}</Text>
    </View>
  );
}

export function Avatar({ name, size = 48, color }: { name: string; size?: number; color?: string }) {
  const initial = (name?.[0] ?? 'R').toUpperCase();
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: color ?? colors.forestSoft }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.4 }]}>{initial}</Text>
    </View>
  );
}

export function EmptyState({ title, body, actionLabel, onAction }: { title: string; body: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
      {actionLabel ? (
        <Pressable onPress={onAction} style={styles.emptyBtn}>
          <Text style={styles.emptyBtnText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function LoadingSkeleton() {
  return (
    <View style={styles.skeleton}>
      <ActivityIndicator color={colors.forest} />
      <Text style={styles.emptyBody}>Finding people around you…</Text>
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>Something didn’t work</Text>
      <Text style={styles.emptyBody}>{message}</Text>
      <Pressable onPress={onRetry} style={styles.emptyBtn}>
        <Text style={styles.emptyBtnText}>Try again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.grayLight,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  selected: { backgroundColor: colors.forest, borderColor: colors.forest },
  text: { ...typography.bodySmall, color: colors.charcoal },
  textSelected: { color: colors.white, fontWeight: '700' },
  tag: { backgroundColor: colors.grayMuted, borderRadius: radii.full, paddingHorizontal: 10, paddingVertical: 6, marginRight: 6, marginBottom: 6 },
  tagText: { ...typography.caption, color: colors.charcoal },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '800', color: colors.forest },
  empty: { alignItems: 'center', padding: spacing.xxl },
  emptyTitle: { ...typography.h2, color: colors.charcoal, textAlign: 'center', marginBottom: 8 },
  emptyBody: { ...typography.bodySmall, color: colors.gray, textAlign: 'center' },
  emptyBtn: { marginTop: spacing.lg, backgroundColor: colors.forest, borderRadius: radii.lg, paddingHorizontal: spacing.xl, paddingVertical: 12 },
  emptyBtnText: { color: colors.white, fontWeight: '700' },
  skeleton: { alignItems: 'center', padding: spacing.xxl },
  h1: { ...typography.h1, color: colors.charcoal },
});
