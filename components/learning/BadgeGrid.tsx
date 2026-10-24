import { StyleSheet, View } from 'react-native';

import { BrutalPressable } from '@/components/ui/Brutal';
import { Icon } from '@/components/ui/Icon';
import { FadeInUp } from '@/components/ui/Motion';
import { Text } from '@/components/ui/Text';
import { TINTS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { badgeIcon } from '@/lib/icons';
import type { Achievement } from '@/types';

type Props = {
  achievements: Achievement[];
  /** achievement id -> unlocked_at */
  unlocked: Record<string, string>;
  pinned: string[];
  onPressEarned: (achievement: Achievement) => void;
  onPressLocked?: (achievement: Achievement) => void;
};

/**
 * Every badge in the game. Earned badges show their artwork, name and description (tap to pin or
 * unpin it for the home screen); badges not earned yet are just a question mark.
 */
export function BadgeGrid({ achievements, unlocked, pinned, onPressEarned, onPressLocked }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.grid}>
      {achievements.map((a, i) => {
        const earned = !!unlocked[a.id];
        const isPinned = pinned.includes(a.id);
        return (
          <FadeInUp key={a.id} delay={Math.min(i, 8) * 50} style={styles.cell}>
            <BrutalPressable
              bg={earned ? colors[TINTS[i % TINTS.length]!] : colors.tintBlue}
              radius={26}
              offset={earned ? 6 : 4}
              borderColor={isPinned ? colors.orange : undefined}
              sound={earned ? 'pop' : 'tap'}
              accessibilityLabel={
                earned ? `${a.name}${isPinned ? ', dipasang' : ''}` : 'Badge belum didapat'
              }
              onPress={() => (earned ? onPressEarned(a) : onPressLocked?.(a))}
              style={styles.tile}
            >
              {isPinned ? (
                <View style={[styles.tag, { backgroundColor: colors.orange }]}>
                  <Text style={[styles.tagText, { color: colors.onBright }]}>Dipasang</Text>
                </View>
              ) : null}
              <View style={!earned && { opacity: 0.55 }}>
                <Icon name={earned ? badgeIcon(a.name) : 'question'} size={76} />
              </View>
              <Text
                style={[styles.name, { color: earned ? colors.text : colors.textMuted }]}
                numberOfLines={2}
              >
                {earned ? a.name : '???'}
              </Text>
              {earned && a.description ? (
                <Text style={[styles.desc, { color: colors.textMuted }]} numberOfLines={2}>
                  {a.description}
                </Text>
              ) : null}
            </BrutalPressable>
          </FadeInUp>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cell: { width: '31.5%' },
  tile: { alignItems: 'center', paddingVertical: 12, paddingHorizontal: 6, gap: 2, minHeight: 160 },
  name: { fontSize: 15, fontWeight: '800', textAlign: 'center' },
  desc: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  tag: {
    position: 'absolute',
    top: 6,
    alignSelf: 'center',
    zIndex: 2,
    borderRadius: 999,
    paddingHorizontal: 8,
  },
  tagText: { fontSize: 10, fontWeight: '800' },
});
