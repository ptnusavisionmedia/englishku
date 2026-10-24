import { useEffect } from 'react';
import { StyleSheet } from 'react-native';

import { BrutalPressable } from '@/components/ui/Brutal';
import { Icon } from '@/components/ui/Icon';
import { Bounce, Shake } from '@/components/ui/Motion';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';
import { playSound } from '@/lib/sounds';

export type OptionState = 'idle' | 'selected' | 'correct' | 'wrong' | 'dim';

type Props = {
  label?: string;
  /** Icon name from assets/icons. */
  icon?: string;
  state?: OptionState;
  onPress: () => void;
  accessibilityLabel?: string;
  /** Skip the "correct" jingle (used when the parent plays its own). */
  silentCorrect?: boolean;
};

/**
 * Answer tile in glossy candy colours: shakes with a soft boop on a wrong pick, bounces with a
 * happy chime on the right one.
 */
export function QuizOption({
  label,
  icon,
  state = 'idle',
  onPress,
  accessibilityLabel,
  silentCorrect,
}: Props) {
  const { colors } = useTheme();

  useEffect(() => {
    if (state === 'wrong') playSound('wrong');
    else if (state === 'correct' && !silentCorrect) playSound('correct');
    else if (state === 'selected') playSound('tap');
  }, [state, silentCorrect]);

  const bg =
    state === 'correct'
      ? colors.green
      : state === 'wrong'
        ? colors.red
        : state === 'selected'
          ? colors.blue
          : colors.surface;
  const text = state === 'idle' || state === 'dim' ? colors.text : colors.onBright;
  return (
    <Shake trigger={state === 'wrong' ? 'wrong' : null} style={styles.cell}>
      <Bounce trigger={state === 'correct' || state === 'selected' ? state : null}>
        <BrutalPressable
          bg={bg}
          radius={24}
          sound={false}
          accessibilityLabel={accessibilityLabel ?? label ?? 'Pilihan'}
          onPress={onPress}
          containerStyle={{ opacity: state === 'dim' ? 0.45 : 1 }}
          style={styles.face}
        >
          {icon ? <Icon name={icon} size={84} /> : null}
          {label ? <Text style={[styles.label, { color: text }]}>{label}</Text> : null}
        </BrutalPressable>
      </Bounce>
    </Shake>
  );
}

const styles = StyleSheet.create({
  cell: { flexBasis: '46%', flexGrow: 1 },
  face: { minHeight: 116, alignItems: 'center', justifyContent: 'center', padding: 10, gap: 4 },
  label: { fontSize: 25, fontWeight: '800', textAlign: 'center' },
});
