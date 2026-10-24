import { StyleSheet } from 'react-native';

import { BrutalPressable } from '@/components/ui/Brutal';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  label: string;
  icon?: string;
  active?: boolean;
  onPress: () => void;
};

/** Glossy chip for filters and options. Selected = orange candy, otherwise soft blue. */
export function Pill({ label, icon, active, onPress }: Props) {
  const { colors } = useTheme();
  return (
    <BrutalPressable
      bg={active ? colors.orange : colors.tintBlue}
      radius={999}
      offset={4}
      accessibilityLabel={label}
      accessibilityState={{ selected: !!active }}
      onPress={onPress}
      style={styles.pill}
    >
      {icon ? <Icon name={icon} size={28} /> : null}
      <Text style={[styles.label, { color: active ? colors.onBright : colors.text }]}>{label}</Text>
    </BrutalPressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  label: { fontSize: 16, fontWeight: '800' },
});
