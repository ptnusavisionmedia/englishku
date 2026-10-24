import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/common/States';
import { ChoiceGame } from '@/components/games/ChoiceGame';
import { Header } from '@/components/layout/Header';
import { Screen } from '@/components/layout/Screen';
import { PronunciationPanel } from '@/components/learning/PronunciationPanel';
import { VocabularyCard } from '@/components/learning/VocabularyCard';
import { Button } from '@/components/ui/Button';
import { FadeInUp } from '@/components/ui/Motion';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Text } from '@/components/ui/Text';
import { useStudyTimer } from '@/hooks/useStudy';
import { useSwipe } from '@/hooks/useSwipe';
import { useTheme } from '@/hooks/useTheme';
import { categoryIcon } from '@/lib/icons';
import { useLearningStore } from '@/stores/learning.store';
import type { Outcome } from '@/types';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const router = useRouter();
  useStudyTimer();

  const lesson = useLearningStore((s) => s.lessons.find((l) => l.id === id));
  const category = useLearningStore((s) => s.categories.find((c) => c.id === lesson?.category_id));
  const allVocab = useLearningStore((s) => s.vocabulary);
  const userVocab = useLearningStore((s) => s.userVocab);
  const store = useLearningStore.getState;

  const words = useMemo(() => allVocab.filter((v) => v.lesson_id === id), [allVocab, id]);
  const [stage, setStage] = useState<'cards' | 'quiz'>('cards');
  const [index, setIndex] = useState(0);
  const [showSpeak, setShowSpeak] = useState(false);
  // Swipe the card left for the next word, right for the previous one.
  const swipe = useSwipe({
    onLeft: () => setIndex((i) => Math.min(i + 1, Math.max(words.length - 1, 0))),
    onRight: () => setIndex((i) => Math.max(i - 1, 0)),
  });

  useEffect(() => {
    if (id) void store().startLesson(id);
  }, [id, store]);

  if (!lesson || words.length === 0) {
    return (
      <Screen scroll={false}>
        <Header title="Pelajaran" />
        <EmptyState
          title="Pelajaran tidak ditemukan"
          description="Kembali dan pilih pelajaran lain ya."
          icon="book"
        />
      </Screen>
    );
  }

  const word = words[index]!;
  const isLast = index === words.length - 1;
  const title = category?.name ?? lesson.title;

  const finishQuiz = async (outcome: Outcome) => {
    const stars = await store().finishLesson(lesson.id, outcome);
    router.replace({
      pathname: '/lesson/complete',
      params: {
        lessonId: lesson.id,
        stars: String(stars),
        correct: String(outcome.correct),
        total: String(outcome.total),
      },
    });
  };

  const startQuiz = () => {
    void store().markSeen(words.map((w) => w.id));
    setStage('quiz');
  };

  return (
    <Screen scroll={stage === 'cards'}>
      <Header title={title} icon={categoryIcon(title)} />

      {stage === 'cards' ? (
        <>
          <View style={styles.progress}>
            <ProgressBar
              value={(index + 1) / words.length}
              color={colors.blue}
              label="Kartu kata"
            />
            <Text style={[styles.count, { color: colors.textMuted }]}>
              Kata {index + 1} dari {words.length}
            </Text>
          </View>

          {/* key restarts the entrance animation for every new card */}
          <View {...swipe}>
            <FadeInUp key={word.id}>
              <VocabularyCard
                vocab={word}
                isFavorite={!!userVocab[word.id]?.is_favorite}
                isMastered={(userVocab[word.id]?.mastery_level ?? 0) >= 3}
                onToggleFavorite={() => void store().toggleFavorite(word.id)}
                onMastered={() => void store().setMastery(word.id, 3)}
              />
            </FadeInUp>
          </View>

          {showSpeak ? (
            <PronunciationPanel word={word.word} />
          ) : (
            <Button
              title="Latihan ucapan"
              icon="mic"
              variant="secondary"
              onPress={() => setShowSpeak(true)}
            />
          )}

          <View style={styles.nav}>
            <Button
              title="Kembali"
              icon="arrow-left"
              variant="secondary"
              style={styles.flex}
              disabled={index === 0}
              onPress={() => setIndex(index - 1)}
            />
            {isLast ? (
              <Button
                title="Mulai Kuis"
                icon="star"
                variant="success"
                style={styles.flex}
                onPress={startQuiz}
              />
            ) : (
              <Button
                title="Lanjut"
                icon="arrow-right"
                style={styles.flex}
                onPress={() => setIndex(index + 1)}
              />
            )}
          </View>
        </>
      ) : (
        <ChoiceGame mode="quiz" pool={words} rounds={5} onFinish={(o) => void finishQuiz(o)} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  progress: { gap: 6 },
  count: { fontSize: 16, fontWeight: '700', textAlign: 'center' },
  nav: { flexDirection: 'row', gap: 12 },
});
