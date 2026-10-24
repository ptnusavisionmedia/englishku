import { useEffect, useState, type ReactNode } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/hooks/useTheme';
import { darken } from '@/lib/color';

/**
 * Tab icon on a candy plate: when its tab becomes active the plate grows in with a spring while
 * the icon hops up, and both settle back smoothly when another tab is chosen.
 */
export function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const { colors } = useTheme();
  const [on] = useState(() => new Animated.Value(focused ? 1 : 0));
  useEffect(() => {
    Animated.spring(on, {
      toValue: focused ? 1 : 0,
      friction: 6,
      tension: 130,
      useNativeDriver: true,
    }).start();
  }, [focused, on]);

  return (
    <View style={styles.box}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.plate,
          {
            backgroundColor: colors.orange,
            borderColor: darken(colors.orange, 0.16),
            opacity: on,
            transform: [{ scale: on.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] }) }],
          },
        ]}
      />
      <Animated.View
        style={{
          transform: [
            { translateY: on.interpolate({ inputRange: [0, 1], outputRange: [0, -2] }) },
            { scale: on.interpolate({ inputRange: [0, 1], outputRange: [1, 1.14] }) },
          ],
        }}
      >
        <Icon name={name} size={34} />
      </Animated.View>
    </View>
  );
}

type ButtonProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  // Props that the tab navigator passes to its buttons (types differ per platform).
  [key: string]: any;
};

/**
 * Tab bar button with no Android ripple or dark pressed overlay: it just squishes down a little
 * and springs back, matching the rest of the candy buttons.
 */
export function TabBarButton({
  children,
  style,
  onPress,
  onLongPress,
  accessibilityState,
  accessibilityLabel,
  testID,
}: ButtonProps) {
  const [press] = useState(() => new Animated.Value(1));
  const to = (v: number) =>
    Animated.spring(press, {
      toValue: v,
      speed: 40,
      bounciness: 10,
      useNativeDriver: true,
    }).start();
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={accessibilityState}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => to(0.86)}
      onPressOut={() => to(1)}
      android_ripple={{ color: 'transparent' }}
      style={[style, styles.button]}
    >
      <Animated.View style={[styles.inner, { transform: [{ scale: press }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: { width: 60, height: 46, alignItems: 'center', justifyContent: 'center' },
  plate: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 18,
    borderWidth: 2.5,
  },
  button: { alignItems: 'center', justifyContent: 'center' },
  inner: { alignItems: 'center', justifyContent: 'center' },
});
