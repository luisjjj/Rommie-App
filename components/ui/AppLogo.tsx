import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { LOGO_SVG, LOGO_MARK_VIEWBOX } from '@/assets/logoSvg';

function withViewBox(svg: string, viewBox: string): string {
  return svg.replace('<svg ', `<svg viewBox="${viewBox}" `);
}

/**
 * In-app Roomie logo, rendered from the recolored brand artwork
 * (assets/logo.svg, forest-green edition).
 * - `lockup`: full squircle + wordmark (welcome, splash-sized spots).
 * - `mark`: tight R crop in a rounded tile (headers, small spots).
 */
export function AppLogo({ size = 44, variant = 'lockup' }: { size?: number; variant?: 'lockup' | 'mark' }) {
  if (variant === 'mark') {
    return (
      <View style={[styles.tile, { width: size, height: size, borderRadius: size * 0.24 }]}>
        <SvgXml xml={withViewBox(LOGO_SVG, LOGO_MARK_VIEWBOX)} width={size} height={size} />
      </View>
    );
  }
  return <SvgXml xml={LOGO_SVG} width={size} height={size} />;
}

const styles = StyleSheet.create({
  tile: { overflow: 'hidden', backgroundColor: 'transparent' },
});
