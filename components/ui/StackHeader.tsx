import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'phosphor-react-native';
import { colors, radii, spacing, typography } from '@/theme/tokens';

/**
 * Branded in-app header used on stack screens (profile, chat, settings).
 * Replaces the native iOS/Android nav bar so the whole app looks like Roomie.
 */
export function StackHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={onBack ?? (() => router.back())}
        style={styles.backBtn}
      >
        <ArrowLeft size={22} color={colors.forest} weight="bold" />
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, marginBottom: spacing.sm },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.forestSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...typography.h2, color: colors.charcoal, marginLeft: spacing.md, flex: 1 },
  spacer: { width: 40 },
});
