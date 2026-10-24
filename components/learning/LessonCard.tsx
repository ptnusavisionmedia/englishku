import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';
import { playSound } from '@/lib/sounds';
import { categoryIcon } from '@/lib/icons';
import type { Category, Lesson, LessonStatus } from '@/types';

const STATUS: Record<LessonStatus, { icon: string; label: string }> = {
  locked: { icon: 'lock', label: 'Terkunci' },
  available: { icon: 'play', label: 'Ayo mulai' },
  in_progress: { icon: 'book', label: 'Lanjutkan' },
  completed: { icon: 'check', label: 'Selesai' },
};

type Props = {
  lesson: Lesson;
  category?: Category;
  status: LessonStatus;
  index: number;
  recommended?: boolean;
  /** Draws the vertical path line only between lessons. */
  last?: boolean;
  /** Compact version without the path line (used on the home screen). */
  standalone?: boolean;
  onPress: () => void;
};

/**
 * One stop on the learning path: a numbered node on a vertical line, the theme artwork, and its
 * state. No card around it; the recommended stop gets a soft yellow highlight.
 */
export function LessonCard({
  lesson,
  category,
  status,
  index,
  recommended,
  last,
  standalone,
  onPress,
}: Props) {
  const { colors } = useTheme();
  const locked = status === 'locked';
  const info = STATUS[status];
  const name = category?.name ?? lesson.title;
  const node = {
    completed: colors.green,
    in_progress: colors.blue,
    available: colors.orange,
    locked: colors.tintBlue,
  }[status];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${info.label}`}
      accessibilityState={{ disabled: locked }}
      onPress={() => {
        playSound(locked ? 'wrong' : 'tap');
        onPress();
      }}
      style={({ pressed }) => [
        styles.row,
        recommended && { backgroundColor: colors.tintYellow, borderRadius: 24 },
        pressed && { opacity: 0.75 },
      ]}
    >
      {!standalone ? (
        <View style={styles.track}>
          <View style={[styles.node, { backgroundColor: node, borderColor: colors.border }]}>
            {status === 'completed' || locked ? (
              <Icon name={info.icon} size={22} />
            ) : (
              <Text style={[styles.num, { color: colors.onBright }]}>{index + 1}</Text>
            )}
          </View>
          {!last ? <View style={[styles.line, { backgroundColor: `${colors.shadow}88` }]} /> : null}
        </View>
      ) : null}
      <View style={[styles.body, locked && { opacity: 0.5 }]}>
        <Text style={[styles.title, { color: colors.text }]}>{name}</Text>
        <Text style={[styles.sub, { color: colors.textMuted }]} numberOfLines={1}>
          {lesson.title} · {info.label}
        </Text>
      </View>
      <View style={locked && { opacity: 0.5 }}>
        <Icon name={categoryIcon(name)} size={standalone ? 64 : 58} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  track: { alignItems: 'center', alignSelf: 'stretch', width: 40 },
  node: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  num: { fontSize: 19, fontWeight: '900' },
  line: { position: 'absolute', top: 40, bottom: -64, width: 4, borderRadius: 2 },
  body: { flex: 1 },
  title: { fontSize: 22, fontWeight: '800' },
  sub: { fontSize: 15, fontWeight: '600' },
});
