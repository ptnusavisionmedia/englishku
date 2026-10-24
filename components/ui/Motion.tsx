import { useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Animated, Easing, type ViewStyle } from 'react-native';

/** True when the user asked the OS to reduce motion; animations then become instant. */
export function useReduceMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((v) => active && setReduce(v));
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => {
      active = false;
      sub.remove();
    };
  }, []);
  return reduce;
}

type MotionProps = { children: ReactNode; delay?: number; style?: ViewStyle };

/** Slides up and fades in on mount. Use `delay` to stagger list items. */
export function FadeInUp({ children, delay = 0, style }: MotionProps) {
  const reduce = useReduceMotion();
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (reduce) return void v.setValue(1);
    Animated.timing(v, {
      toValue: 1,
      duration: 380,
      delay,
      easing: Easing.out(Easing.back(1.4)),
      useNativeDriver: true,
    }).start();
  }, [v, delay, reduce]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: v,
          transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [22, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/** Springs from small to full size on mount (stars, badges, result screens). */
export function Pop({ children, delay = 0, style }: MotionProps) {
  const reduce = useReduceMotion();
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (reduce) return void v.setValue(1);
    Animated.spring(v, {
      toValue: 1,
      delay,
      friction: 4,
      tension: 120,
      useNativeDriver: true,
    }).start();
  }, [v, delay, reduce]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: v.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 1, 1] }),
          transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/** Gentle endless bobbing for mascots and loading indicators. */
export function Float({ children, distance = 6, style }: MotionProps & { distance?: number }) {
  const reduce = useReduceMotion();
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (reduce) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(v, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v, reduce]);
  return (
    <Animated.View
      style={[
        style,
        {
          transform: [
            {
              translateY: v.interpolate({ inputRange: [0, 1], outputRange: [distance, -distance] }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/** Pulses while `active` (recording indicator, "tap me" hints). */
export function Pulse({ children, active = true, style }: MotionProps & { active?: boolean }) {
  const reduce = useReduceMotion();
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!active || reduce) return void v.setValue(0);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v, active, reduce]);
  return (
    <Animated.View
      style={[
        style,
        { transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] }) }] },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/** Shakes sideways whenever `trigger` changes to a new truthy value (wrong answer feedback). */
export function Shake({ children, trigger, style }: MotionProps & { trigger: unknown }) {
  const reduce = useReduceMotion();
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!trigger || reduce) return;
    v.setValue(0);
    Animated.sequence([
      Animated.timing(v, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(v, { toValue: -1, duration: 100, useNativeDriver: true }),
      Animated.timing(v, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.timing(v, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [trigger, v, reduce]);
  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ translateX: v.interpolate({ inputRange: [-1, 1], outputRange: [-7, 7] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/** Bounces once whenever `trigger` changes to a new truthy value (correct answer feedback). */
export function Bounce({ children, trigger, style }: MotionProps & { trigger: unknown }) {
  const reduce = useReduceMotion();
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!trigger || reduce) return;
    v.setValue(0);
    Animated.sequence([
      Animated.timing(v, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.spring(v, { toValue: 0, friction: 3, tension: 160, useNativeDriver: true }),
    ]).start();
  }, [trigger, v, reduce]);
  return (
    <Animated.View
      style={[
        style,
        { transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) }] },
      ]}
    >
      {children}
    </Animated.View>
  );
}
