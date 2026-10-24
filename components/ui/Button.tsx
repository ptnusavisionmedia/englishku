import { ActivityIndicator, StyleSheet, View, type ViewStyle } from 'react-native';

import { BrutalPressable } from '@/components/ui/Brutal';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { fonts } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';
import type { SoundName } from '@/lib/sounds/sound-files';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'blue' | 'success' | 'secondary' | 'danger' | 'ghost';
  size?: 'lg' | 'md';
  /** Name of a custom icon from assets/icons. */
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  sound?: SoundName | false;
  style?: ViewStyle;
};

/** Glossy candy button. Primary = orange, blue, success = green, danger = red, secondary = white. */
export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon,
  loading,
  disabled,
  accessibilityLabel,
  sound,
  style,
}: Props) {
  const { colors } = useTheme();
  const inactive = disabled || loading;
  const lg = size === 'lg';

  if (variant === 'ghost') {
    return (
      <BrutalPressable
        bg="transparent"
        offset={0}
        onPress={onPress}
        disabled={inactive}
        sound={sound}
        accessibilityLabel={accessibilityLabel ?? title}
        containerStyle={style}
        style={[styles.face, styles.md]}
      >
        <Text style={[styles.label, { color: colors.link, fontSize: 17 }]}>{title}</Text>
      </BrutalPressable>
    );
  }

  const bg = {
    primary: colors.orange,
    blue: colors.blue,
    success: colors.green,
    danger: colors.red,
    secondary: colors.surface,
  }[variant];
  const fg = variant === 'secondary' ? colors.text : colors.onBright;

  return (
    <BrutalPressable
      bg={bg}
      onPress={onPress}
      disabled={inactive}
      sound={sound ?? (variant === 'success' ? 'pop' : 'tap')}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ busy: !!loading }}
      containerStyle={style}
      radius={lg ? 24 : 18}
      offset={lg ? 6 : 5}
      style={[styles.face, lg ? styles.lg : styles.md]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Icon name={icon} size={lg ? 38 : 30} /> : null}
          <Text style={[styles.label, { color: fg, fontSize: lg ? 23 : 18 }]}>{title}</Text>
        </View>
      )}
    </BrutalPressable>
  );
}

const styles = StyleSheet.create({
  face: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  lg: { minHeight: 64 },
  md: { minHeight: 50 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { fontFamily: fonts.display, textAlign: 'center' },
});
