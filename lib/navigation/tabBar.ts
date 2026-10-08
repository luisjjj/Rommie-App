import React from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

type HideFn = (hidden: boolean) => void;

let hideFn: HideFn | null = null;

/** Called by the floating tab bar to register its visibility setter. */
export function registerTabBarHider(fn: HideFn | null) {
  hideFn = fn;
}

export function setTabBarHidden(hidden: boolean) {
  hideFn?.(hidden);
}

/**
 * Spread onto tab-screen scrollables: the floating pill slides away on scroll
 * down and springs back on scroll up (or when near the top, or on tab press).
 * Shared-value driven — no re-renders while scrolling.
 */
export function useHideTabBarOnScroll() {
  const lastY = React.useRef(0);
  return React.useMemo(
    () => ({
      scrollEventThrottle: 16,
      onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const y = e.nativeEvent.contentOffset.y;
        const dy = y - lastY.current;
        lastY.current = y;
        if (y < 80) {
          setTabBarHidden(false);
          return;
        }
        if (dy > 6) setTabBarHidden(true);
        else if (dy < -6) setTabBarHidden(false);
      },
    }),
    [],
  );
}
