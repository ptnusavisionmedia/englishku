import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { FadeInUp, Float, Pop } from '@/components/ui/Motion';
import { StarRow } from '@/components/ui/StarRow';
import { Text } from '@/components/ui/Text';
import { useLessons } from '@/hooks/useLessons';
import { Confetti } from '@/components/ui/Confetti';
import { useTheme } from '@/hooks/useTheme';
import { playSound } from '@/lib/sounds';
import { resultMessage } from '@/lib/learning';
import { useLearningStore } from '@/stores/learning.store';

export default function LessonComplete() {
  const { lessonId, stars, correct, total } = useLocalSearchParams<{
    lessonId: string;
    stars: string;
    correct: string;
    total: string;
  }>();
  const { colors } = useTheme();
  const router = useRouter();
  const newBadges = useLearningStore((s) => s.newBadges);
  const syncError = useLearningStore((s) => s.syncError);
  const { items } = useLessons();

  useEffect(() => {
    playSound('win');
    const badge = setTimeout(() => {
      if (useLearningStore.getState().newBadges.length > 0) playSound('badge');
    }, 1500);
    return () => {
      clearTimeout(badge);
      useLearningStore.getState().clearNewBadges();
    };
  }, []);

  const earned = Number(stars) || 1;
  const message = resultMessage(earned);
  const next = items.find(
    (i, idx) => items[idx - 1]?.lesson.id === lessonId && i.status !== 'locked',
  );

  return (
    <Screen>
      {earned >= 2 ? <Confetti /> : null}
      <View style={styles.center}>
        <Pop>
          <Float distance={6}>
            <Icon name="party" size={120} />
          </Float>
        </Pop>
        <FadeInUp delay={150}>
          <Text style={[styles.title, { color: colors.text }]}>{message.title}</Text>
        </FadeInUp>
        <Text style={[styles.sub, { color: colors.textMuted }]}>{message.subtitle}</Text>
        <StarRow earned={earned} size={64} />
        <Text style={[styles.sub, { color: colors.textMuted }]}>
          {correct} dari {total} jawaban benar di percobaan pertama
        </Text>
      </View>

      {newBadges.length > 0 ? (
        <View style={styles.center}>
          <Text style={[styles.section, { color: colors.text }]}>Badge baru!</Text>
          <View style={styles.badges}>
            {newBadges.map((b, i) => (
              <Pop key={b.id} delay={600 + i * 200}>
                <Badge name={b.name} description={b.description ?? undefined} />
              </Pop>
            ))}
          </View>
        </View>
      ) : null}

      {syncError ? (
        <Text accessibilityRole="alert" style={{ color: colors.textMuted, textAlign: 'center' }}>
          {syncError}
        </Text>
      ) : null}

      <View style={styles.footer}>
        {next ? (
          <Button
            title="Pelajaran berikutnya"
            icon="arrow-right"
            onPress={() =>
              router.replace({ pathname: '/lesson/[id]', params: { id: next.lesson.id } })
            }
          />
        ) : null}
        <Button
          title="Ke Beranda"
          icon="home"
          variant="secondary"
          onPress={() => router.replace('/home')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', gap: 10 },
  title: { fontSize: 44, fontWeight: '900' },
  sub: { fontSize: 18, textAlign: 'center', fontWeight: '700' },
  section: { fontSize: 24, fontWeight: '800' },
  badges: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', justifyContent: 'center' },
  footer: { gap: 12, marginTop: 'auto' },
});
