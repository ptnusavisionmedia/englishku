import { BrutalPressable } from '@/components/ui/Brutal';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/hooks/useTheme';
import { speak } from '@/lib/speech';

type Props = { text: string; size?: number; rate?: number; label?: string };

/** Speaks `text` in English. Uses the device voice, so no audio files are needed. */
export function AudioButton({ text, size = 64, rate, label }: Props) {
  const { colors } = useTheme();
  return (
    <BrutalPressable
      bg={colors.blue}
      radius={size / 2}
      offset={size > 56 ? 5 : 3}
      hitSlop={8}
      accessibilityLabel={label ?? `Dengarkan ${text}`}
      onPress={() => speak(text, { rate })}
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
    >
      <Icon name="speaker" size={size * 0.6} />
    </BrutalPressable>
  );
}
