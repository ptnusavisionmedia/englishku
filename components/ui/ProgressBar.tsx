import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { darken } from '@/lib/color';

type Props = { value: number; color?: string; height?: number; label?: string };

/** Glossy candy bar: a tinted track, a fill with a shine strip and darker rim, animated smoothly. */
export function ProgressBar({ value, color, height = 22, label = 'Progress' }: Props) {
  const { colors } = useTheme();
  const pct = Math.max(0, Math.min(1, value));
  const fill = color ?? colors.green;
  const [anim] = useState(() => new Animated.Value(pct));

  useEffect(() => {
    Animated.timing(anim, {
      toValue: pct,
      duration: 700,
      easing: Easing.out(Easing.back(1.1)),
      useNativeDriver: false,
    }).start();
  }, [pct, anim]);

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct * 100) }}
      style={[
        styles.track,
        {
          height,
          borderRadius: height / 2,
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <Animated.View
        style={{
          height: '100%',
          minWidth: pct > 0 ? height : 0,
          width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          backgroundColor: fill,
          borderRadius: height / 2,
          borderBottomWidth: 3,
          borderBottomColor: darken(fill, 0.22),
        }}
      >
        <View style={[styles.shine, { top: 2, left: height / 2 - 2 }]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', borderWidth: 2.5, overflow: 'hidden' },
  shine: {
    position: 'absolute',
    right: 8,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
});
