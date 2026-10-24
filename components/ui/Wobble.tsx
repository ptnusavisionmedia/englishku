import { useState, type ReactNode } from 'react';
import { Animated, Pressable, type ViewStyle } from 'react-native';

import { playSound } from '@/lib/sounds';

type Props = { children: ReactNode; style?: ViewStyle; label?: string };

/** Tap me! Mascots and big pictures hop, wobble and play a pop when touched. */
export function Wobble({ children, style, label }: Props) {
  const [v] = useState(() => new Animated.Value(0));
  const [hop] = useState(() => new Animated.Value(0));

  const play = () => {
    playSound('pop');
    v.setValue(0);
    hop.setValue(0);
    Animated.parallel([
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 90, useNativeDriver: true }),
        Animated.timing(v, { toValue: -1, duration: 140, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0.6, duration: 110, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(hop, { toValue: 1, duration: 140, useNativeDriver: true }),
        Animated.spring(hop, { toValue: 0, friction: 3, tension: 160, useNativeDriver: true }),
      ]),
    ]).start();
  };

  return (
    <Pressable
      accessibilityRole="imagebutton"
      accessibilityLabel={label}
      onPress={play}
      style={style}
    >
      <Animated.View
        style={{
          transform: [
            { translateY: hop.interpolate({ inputRange: [0, 1], outputRange: [0, -16] }) },
            { scale: hop.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] }) },
            { rotate: v.interpolate({ inputRange: [-1, 1], outputRange: ['-10deg', '10deg'] }) },
          ],
        }}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}
