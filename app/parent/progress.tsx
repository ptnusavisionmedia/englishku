import { StyleSheet, View } from 'react-native';

import { Hero } from '@/components/layout/Hero';
import { Screen } from '@/components/layout/Screen';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Row } from '@/components/ui/Row';
import { Text } from '@/components/ui/Text';
import { useLessons } from '@/hooks/useLessons';
import { useTheme } from '@/hooks/useTheme';
import { dateKey, daysAgo, weekdayShort } from '@/lib/date';
import { categoryIcon } from '@/lib/icons';
import { useLearningStore } from '@/stores/learning.store';

export default function ParentProgress() {
  const { colors } = useTheme();
  const activity = useLearningStore((s) => s.activity);
  const vocabulary = useLearningStore((s) => s.vocabulary);
  const userVocab = useLearningStore((s) => s.userVocab);
  const { items } = useLessons();

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = daysAgo(6 - i);
    return {
      label: weekdayShort(d),
      minutes: Math.round((activity[dateKey(d)]?.seconds ?? 0) / 60),
    };
  });
  const max = Math.max(10, ...days.map((d) => d.minutes));
  const barColors = [colors.blue, colors.orange, colors.red, colors.green];

  return (
    <Screen edges={['left', 'right']}>
      <Hero color="green" title="Progress" subtitle="Menit belajar 7 hari terakhir" icon="chart" />

      <View style={styles.bars} accessibilityLabel="Grafik menit belajar 7 hari terakhir">
        {days.map((d, i) => (
          <View key={`${d.label}-${i}`} style={styles.barCol}>
            <Text style={[styles.barValue, { color: colors.textMuted }]}>{d.minutes}</Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.bar,
                  {
                    height: `${(d.minutes / max) * 100}%`,
                    backgroundColor: barColors[i % barColors.length],
                  },
                ]}
              />
            </View>
            <Text style={[styles.barLabel, { color: colors.text }]}>{d.label}</Text>
          </View>
        ))}
      </View>

      <Text style={[styles.title, { color: colors.text }]}>Per tema</Text>
      <View>
        {items.map(({ lesson, category, status }, i) => {
          const words = vocabulary.filter((v) => v.lesson_id === lesson.id);
          const learned = words.filter((w) => (userVocab[w.id]?.mastery_level ?? 0) >= 1).length;
          const name = category?.name ?? lesson.title;
          return (
            <Row
              key={lesson.id}
              icon={categoryIcon(name)}
              iconSize={44}
              title={name}
              subtitle={`${learned} dari ${words.length} kata · ${
                status === 'completed' ? 'Selesai' : status === 'locked' ? 'Terkunci' : 'Berjalan'
              }`}
              last={i === items.length - 1}
            >
              <View style={styles.rowBar}>
                <ProgressBar
                  value={words.length ? learned / words.length : 0}
                  color={colors.blue}
                  height={12}
                  label={`Kata dipelajari di ${name}`}
                />
              </View>
            </Row>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '900' },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 160,
  },
  barCol: { flex: 1, alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' },
  barTrack: { width: 28, flex: 1, justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 10, minHeight: 6 },
  barValue: { fontSize: 13, fontWeight: '800' },
  barLabel: { fontSize: 13, fontWeight: '800' },
  rowBar: { marginTop: 6 },
});
