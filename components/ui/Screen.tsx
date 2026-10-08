import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme/tokens';

interface ScreenProps {
  children: React.ReactNode;
  /** Minimum horizontal gutter. Defaults to spacing.xl (20). */
  gutter?: number;
  /** Set false when a native stack header already handles the top inset. */
  edgeTop?: boolean;
  /** Extra style merged last. Do not set padding here — use `gutter`. */
  style?: ViewStyle;
}

/**
 * App-wide screen container. Guarantees content never touches display edges:
 * real safe-area insets on all four sides, with a minimum 20px gutter, on
 * every device (notched iPhones, edge-to-edge Android, landscape, tablets).
 *
 * Use this instead of React Native's SafeAreaView, which applies zero
 * horizontal inset on iPhone portrait and nothing at all on Android.
 */
export function Screen({ children, gutter = spacing.xl, edgeTop = true, style }: ScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.base,
        {
          // Generous top air everywhere so content never feels jammed under the status bar.
          paddingTop: edgeTop ? Math.max(insets.top, spacing.xxl) : spacing.xl,
          paddingBottom: Math.max(insets.bottom, spacing.xl),
          paddingLeft: Math.max(insets.left, gutter),
          paddingRight: Math.max(insets.right, gutter),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { flex: 1, backgroundColor: colors.cream },
});
