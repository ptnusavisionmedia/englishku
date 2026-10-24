import { Brutal } from '@/components/ui/Brutal';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/hooks/useTheme';
import { avatarIcon } from '@/lib/icons';

type Props = { avatarKey?: string | null; size?: number };

export function Avatar({ avatarKey, size = 64 }: Props) {
  const { colors } = useTheme();
  return (
    <Brutal
      bg={colors.orange}
      radius={size / 2}
      offset={size > 80 ? 5 : 3}
      accessibilityLabel="Avatar"
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
    >
      <Icon name={avatarIcon(avatarKey)} size={size * 0.82} />
    </Brutal>
  );
}
