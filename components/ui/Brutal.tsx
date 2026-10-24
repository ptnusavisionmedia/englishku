import { useState, type ReactNode } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { brutal, radius as radii } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { darken, isLight } from '@/lib/color';
import { playSound } from '@/lib/sounds';
import type { SoundName } from '@/lib/sounds/sound-files';

/*
 * Glossy "candy" building block (name kept from the earlier theme so every screen keeps working).
 * A coloured face with a thin darker outline, a bright shine bar near the top, and a darker bevel
 * peeking out underneath, like a cartoon button.
 */

type BaseProps = {
  children?: ReactNode;
  /** Fill colour of the face. */
  bg?: string;
  /** Height of the bevel under the face. */
  offset?: number;
  radius?: number;
  /** Style of the face (padding, alignment...). */
  style?: StyleProp<ViewStyle>;
  /** Style of the outer wrapper (margins, flex...). */
  containerStyle?: StyleProp<ViewStyle>;
  borderColor?: string;
  shadowColor?: string;
};

function useCandy(bg: string | undefined, borderColor?: string, shadowColor?: string) {
  const { colors } = useTheme();
  const face = bg ?? colors.surface;
  const flat = face === 'transparent';
  const light = isLight(face);
  return {
    face,
    flat,
    glossy: !flat && !light,
    border: flat ? 'transparent' : (borderColor ?? (light ? colors.border : darken(face, 0.14))),
    bevel: flat ? 'transparent' : (shadowColor ?? (light ? colors.shadow : darken(face, 0.26))),
  };
}

function Gloss({ radius }: { radius: number }) {
  const inset = Math.min(radius * 0.8, 24);
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 4,
        left: inset,
        right: inset,
        height: '30%',
        maxHeight: 24,
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.36)',
      }}
    />
  );
}

/** A glossy non-interactive panel. */
export function Brutal({
  children,
  bg,
  offset = brutal.offset,
  radius = radii.lg,
  style,
  containerStyle,
  borderColor,
  shadowColor,
  ...rest
}: BaseProps & Omit<React.ComponentProps<typeof View>, 'style'>) {
  const c = useCandy(bg, borderColor, shadowColor);
  return (
    <View style={[{ paddingBottom: offset }, containerStyle]} {...rest}>
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { top: offset, borderRadius: radius, backgroundColor: c.bevel },
        ]}
      />
      <View
        style={[
          {
            backgroundColor: c.face,
            borderWidth: c.flat ? 0 : 2.5,
            borderColor: c.border,
            borderRadius: radius,
            overflow: 'hidden',
          },
          style,
        ]}
      >
        {c.glossy ? <Gloss radius={radius} /> : null}
        {children}
      </View>
    </View>
  );
}

type PressProps = BaseProps & {
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityState?: React.ComponentProps<typeof Pressable>['accessibilityState'];
  accessibilityRole?: React.ComponentProps<typeof Pressable>['accessibilityRole'];
  hitSlop?: number;
  /** Sound effect on press. Default "tap"; pass false for none. */
  sound?: SoundName | false;
};

/** Glossy candy button: the face squishes down onto its bevel and springs back when released. */
export function BrutalPressable({
  children,
  bg,
  offset = brutal.offset,
  radius = radii.lg,
  style,
  containerStyle,
  borderColor,
  shadowColor,
  onPress,
  disabled,
  accessibilityLabel,
  accessibilityState,
  accessibilityRole = 'button',
  hitSlop,
  sound = 'tap',
}: PressProps) {
  const c = useCandy(bg, borderColor, shadowColor);
  const [press] = useState(() => new Animated.Value(0));
  const to = (v: number) =>
    Animated.spring(press, {
      toValue: v,
      speed: 55,
      bounciness: 11,
      useNativeDriver: true,
    }).start();

  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled, ...accessibilityState }}
      disabled={disabled}
      hitSlop={hitSlop}
      onPress={() => {
        if (sound) playSound(sound);
        onPress?.();
      }}
      onPressIn={() => to(1)}
      onPressOut={() => to(0)}
      style={[{ paddingBottom: offset, opacity: disabled ? 0.55 : 1 }, containerStyle]}
    >
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { top: offset, borderRadius: radius, backgroundColor: c.bevel },
        ]}
      />
      <Animated.View
        style={[
          {
            backgroundColor: c.face,
            borderWidth: c.flat ? 0 : 2.5,
            borderColor: c.border,
            borderRadius: radius,
            overflow: 'hidden',
            transform: [
              { translateY: press.interpolate({ inputRange: [0, 1], outputRange: [0, offset] }) },
              { scale: press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.985] }) },
            ],
          },
          style,
        ]}
      >
        {c.glossy ? <Gloss radius={radius} /> : null}
        {children}
      </Animated.View>
    </Pressable>
  );
}
