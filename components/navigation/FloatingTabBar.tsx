import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { ChatsCircle, Heart, MagnifyingGlass, User } from 'phosphor-react-native';
import { colors, radii, shadows, spacing } from '@/theme/tokens';
import { registerTabBarHider, setTabBarHidden } from '@/lib/navigation/tabBar';

interface FloatingTabBarProps {
  active: string;
  onNavigate: (name: string) => void;
}

export type { FloatingTabBarProps };

const TABS = [
  { name: 'discover', title: 'Discover', Icon: MagnifyingGlass },
  { name: 'likes', title: 'Likes', Icon: Heart },
  { name: 'matches', title: 'Matches', Icon: ChatsCircle },
  { name: 'profile', title: 'Profile', Icon: User },
];

/**
 * Floating pill tab bar. The active tab expands into an icon+label pill while
 * the others collapse to icons; the whole bar slides away on scroll down and
 * springs back on scroll up, tab press, or when near the top.
 */
export function FloatingTabBar({ active, onNavigate }: FloatingTabBarProps) {
  const insets = useSafeAreaInsets();
  const hidden = useSharedValue(false);

  React.useEffect(() => {
    registerTabBarHider((v) => {
      hidden.value = v;
    });
    return () => registerTabBarHider(null);
  }, [hidden]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withSpring(hidden.value ? 140 : 0, { damping: 22, stiffness: 200 }) }],
    opacity: withTiming(hidden.value ? 0 : 1, { duration: 180 }),
  }));

  return (
    <Animated.View
      style={[styles.pill, { bottom: Math.max(insets.bottom, 12) + 12 }, animatedStyle]}
    >
      {TABS.map((tab) => {
        const focused = tab.name === active;
        const { Icon } = tab;
        return (
          <Pressable
            key={tab.name}
            accessibilityRole="button"
            accessibilityLabel={tab.title}
            accessibilityState={{ selected: focused }}
            onPress={() => {
              setTabBarHidden(false);
              if (!focused) onNavigate(tab.name);
            }}
            style={({ pressed }) => [styles.tab, focused && styles.tabActive, pressed && { opacity: 0.7 }]}
          >
            <Icon size={24} color={focused ? colors.forest : colors.gray} weight={focused ? 'fill' : 'regular'} />
            {focused ? <Text style={styles.label}>{tab.title}</Text> : null}
          </Pressable>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    backgroundColor: colors.white,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.grayLight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    ...shadows.card,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
  },
  tabActive: { backgroundColor: colors.forestSoft },
  label: { fontSize: 13, fontWeight: '700', color: colors.forest },
});
