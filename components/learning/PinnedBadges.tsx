import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Pop } from '@/components/ui/Motion';
import { badgeIcon } from '@/lib/icons';
import { useLearningStore } from '@/stores/learning.store';

/**
 * The badges a child chose to show off (max 3). Used under the name on the home screen.
 * Ignores ids that are no longer earned or no longer exist.
 */
export function PinnedBadges({ size = 40 }: { size?: number }) {
  const ids = useLearningStore((s) => s.profile?.pinned_badges);
  const achievements = useLearningStore((s) => s.achievements);
  const unlocked = useLearningStore((s) => s.unlocked);

  const shown = (ids ?? [])
    .map((id) => achievements.find((a) => a.id === id))
    .filter((a): a is NonNullable<typeof a> => !!a && !!unlocked[a.id])
    .slice(0, 3);
  if (shown.length === 0) return null;

  return (
    <View
      style={styles.row}
      accessibilityLabel={`Badge dipasang: ${shown.map((a) => a.name).join(', ')}`}
    >
      {shown.map((a, i) => (
        <Pop key={a.id} delay={i * 120}>
          <Icon name={badgeIcon(a.name)} size={size} />
        </Pop>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', gap: 4, marginTop: 2 } });
