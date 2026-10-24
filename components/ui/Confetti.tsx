import { useEffect, useState } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';

import { useReduceMotion } from '@/components/ui/Motion';
import { useTheme } from '@/hooks/useTheme';

type Piece = {
  x: number;
  size: number;
  color: 'blue' | 'red' | 'orange' | 'green';
  delay: number;
  duration: number;
  spin: number;
  round: boolean;
  v: Animated.Value;
};

const COLORS = ['blue', 'red', 'orange', 'green'] as const;

/** Colourful confetti that rains down once, for wins. Ignores touches and respects reduce-motion. */
export function Confetti({ count = 28 }: { count?: number }) {
  const { colors } = useTheme();
  const reduce = useReduceMotion();
  const [pieces] = useState<Piece[]>(() =>
    Array.from({ length: count }, (_, i) => ({
      x: Math.random(),
      size: 8 + Math.random() * 9,
      color: COLORS[i % COLORS.length]!,
      delay: Math.random() * 700,
      duration: 1800 + Math.random() * 1400,
      spin: (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 540),
      round: Math.random() > 0.55,
      v: new Animated.Value(0),
    })),
  );
  const height = Dimensions.get('window').height;

  useEffect(() => {
    if (reduce) return;
    const runs = pieces.map((p) =>
      Animated.timing(p.v, {
        toValue: 1,
        delay: p.delay,
        duration: p.duration,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    );
    runs.forEach((r) => r.start());
    return () => runs.forEach((r) => r.stop());
  }, [pieces, reduce]);

  if (reduce) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            top: -30,
            left: `${p.x * 100}%`,
            width: p.size,
            height: p.round ? p.size : p.size * 1.7,
            borderRadius: p.round ? p.size / 2 : 3,
            backgroundColor: colors[p.color],
            opacity: p.v.interpolate({ inputRange: [0, 0.05, 0.85, 1], outputRange: [0, 1, 1, 0] }),
            transform: [
              {
                translateY: p.v.interpolate({ inputRange: [0, 1], outputRange: [0, height + 60] }),
              },
              {
                translateX: p.v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 22, -10] }),
              },
              {
                rotate: p.v.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', `${p.spin}deg`],
                }),
              },
            ],
          }}
        />
      ))}
    </View>
  );
}
