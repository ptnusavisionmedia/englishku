import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Hero } from '@/components/layout/Hero';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { Row } from '@/components/ui/Row';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';
import { dateKey, daysAgo } from '@/lib/date';
import { countLearned } from '@/lib/learning';
import { useLearningStore } from '@/stores/learning.store';
import { useSettingsStore } from '@/stores/settings.store';

const formatMinutes = (seconds: number) => `${Math.round(seconds / 60)} menit`;

export default function ParentSummary() {
  const { colors } = useTheme();
  const router = useRouter();
  const profile = useLearningStore((s) => s.profile);
  const activity = useLearningStore((s) => s.activity);
  const progress = useLearningStore((s) => s.progress);
  const userVocab = useLearningStore((s) => s.userVocab);
  const lessons = useLearningStore((s) => s.lessons);
  const setSettings = useSettingsStore((s) => s.set);

  const today = activity[dateKey()]?.seconds ?? 0;
  const week = Array.from(
    { length: 7 },
    (_, i) => activity[dateKey(daysAgo(i))]?.seconds ?? 0,
  ).reduce((a, b) => a + b, 0);
  const done = lessons.filter((l) => progress[l.id]?.status === 'completed').length;

  const rows: [string, string, string][] = [
    ['clipboard', 'Waktu belajar hari ini', formatMinutes(today)],
    ['chart', 'Waktu belajar 7 hari terakhir', formatMinutes(week)],
    ['check', 'Tema selesai', `${done} dari ${lessons.length}`],
    ['book', 'Kata dipelajari', String(countLearned(userVocab))],
    ['flame', 'Streak', `${profile?.current_streak ?? 0} hari`],
    ['star', 'Total bintang', String(profile?.total_stars ?? 0)],
  ];

  return (
    <Screen edges={['left', 'right']}>
      <Hero
        color="orange"
        title="Mode Orang Tua"
        subtitle={`Ringkasan belajar ${profile?.display_name ?? 'anak'}`}
        icon="clipboard"
      />
      <Text style={[styles.note, { color: colors.textMuted }]}>
        Waktu belajar tersimpan di perangkat ini saja.
      </Text>
      {rows.map(([icon, label, value], i) => (
        <Row
          key={label}
          icon={icon}
          iconSize={38}
          title={label}
          last={i === rows.length - 1}
          trailing={<Text style={[styles.value, { color: colors.text }]}>{value}</Text>}
        />
      ))}
      <Button
        title="Kembali ke mode anak"
        icon="home"
        size="md"
        onPress={() => {
          setSettings({ parentUnlocked: false });
          router.replace('/home');
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: { fontSize: 15, fontWeight: '600' },
  value: { fontSize: 19, fontWeight: '800' },
});
