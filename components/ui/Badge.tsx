import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';
import { badgeIcon } from '@/lib/icons';

type Props = { name: string; description?: string; unlocked?: boolean };

/** Achievement badge: just the artwork and its name, no box. Greyed out until unlocked. */
export function Badge({ name, description, unlocked = true }: Props) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityLabel={`${name}${unlocked ? '' : ', belum didapat'}`}
      style={[styles.wrap, !unlocked && { opacity: 0.35 }]}
    >
      <Icon name={badgeIcon(name)} size={72} />
      <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
        {name}
      </Text>
      {description ? (
        <Text style={[styles.desc, { color: colors.textMuted }]} numberOfLines={2}>
          {description}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 110, alignItems: 'center', gap: 2 },
  name: { fontSize: 15, fontWeight: '800', textAlign: 'center' },
  desc: { fontSize: 12, textAlign: 'center', fontWeight: '600' },
});
