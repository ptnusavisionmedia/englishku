import { StyleSheet, Text as RNText, type TextProps } from 'react-native';

import { fonts } from '@/constants/typography';

/**
 * App-wide Text. Maps `fontWeight` to the matching bundled font file (custom fonts do not honour
 * fontWeight on Android) and sets a roomy line height so Baloo 2 never clips. Big heavy text
 * (titles) uses the display face; pass `display` to force it. White text (used on bright candy
 * fills) automatically gets a soft cartoon drop shadow so it stays readable on light colours.
 */
export function Text({ style, display, ...rest }: TextProps & { display?: boolean }) {
  const flat = StyleSheet.flatten(style) ?? {};
  const weight = Number(flat.fontWeight === 'bold' ? 700 : (flat.fontWeight ?? 400));
  const size = (flat.fontSize as number | undefined) ?? 14;
  const family =
    flat.fontFamily ??
    (display || (size >= 26 && weight >= 800)
      ? fonts.display
      : weight >= 800
        ? fonts.black
        : weight >= 700
          ? fonts.bold
          : weight >= 600
            ? fonts.semi
            : fonts.body);
  const onFill = String(flat.color).toLowerCase() === '#ffffff';
  return (
    <RNText
      {...rest}
      style={[
        style,
        {
          fontFamily: family,
          fontWeight: 'normal',
          lineHeight: flat.lineHeight ?? Math.round(size * 1.3),
          includeFontPadding: false,
        },
        onFill && {
          textShadowColor: 'rgba(20,50,120,0.35)',
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 0,
        },
      ]}
    />
  );
}
