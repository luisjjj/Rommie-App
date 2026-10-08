import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '@/theme/tokens';

/** Slim 7-step progress cue shared by every onboarding screen. */
export function StepProgress({ step, total = 7 }: { step: number; total?: number }) {
  return (
    <View style={styles.track} accessibilityRole="progressbar">
      <View style={[styles.fill, { width: `${Math.min(100, (step / total) * 100)}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.grayLight,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  fill: { height: 4, borderRadius: 2, backgroundColor: colors.forest },
});
