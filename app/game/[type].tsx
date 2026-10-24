import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';

import { EmptyState } from '@/components/common/States';
import { ChoiceGame } from '@/components/games/ChoiceGame';
import { MemoryCards } from '@/components/games/MemoryCards';
import { SpellingPuzzle } from '@/components/games/SpellingPuzzle';
import { WordMatch } from '@/components/games/WordMatch';
import { Header } from '@/components/layout/Header';
import { Screen } from '@/components/layout/Screen';
import { GAMES } from '@/constants/content';
import { useLessons } from '@/hooks/useLessons';
import { useStudyTimer } from '@/hooks/useStudy';
import { useLearningStore } from '@/stores/learning.store';
import type { GameType, Outcome } from '@/types';

export default function GameScreen() {
  const { type } = useLocalSearchParams<{ type: GameType }>();
  const router = useRouter();
  useStudyTimer();

  const game = GAMES.find((g) => g.type === type);
  const vocabulary = useLearningStore((s) => s.vocabulary);
  const ageGroup = useLearningStore((s) => s.profile?.age_group);
  const { items } = useLessons();

  // Games only use words from lessons the child can already open.
  const pool = useMemo(() => {
    const open = new Set(items.filter((i) => i.status !== 'locked').map((i) => i.lesson.id));
    const words = vocabulary.filter((v) => open.has(v.lesson_id));
    const easy = words.filter((v) => v.difficulty <= (ageGroup === '4-6' ? 1 : 3));
    return easy.length >= 8 ? easy : words;
  }, [vocabulary, items, ageGroup]);

  if (!game) {
    return (
      <Screen scroll={false}>
        <Header title="Permainan" />
        <EmptyState title="Permainan tidak ditemukan" icon="gamepad" />
      </Screen>
    );
  }
  if (pool.length < 4) {
    return (
      <Screen scroll={false}>
        <Header title={game.title} icon={game.icon} />
        <EmptyState
          title="Belum cukup kata"
          description="Pelajari beberapa pelajaran dulu ya!"
          icon="book"
        />
      </Screen>
    );
  }

  const young = ageGroup === '4-6';
  const finish = async (outcome: Outcome) => {
    const stars = await useLearningStore.getState().finishGame(outcome);
    router.replace({
      pathname: '/game/result',
      params: {
        type: game.type,
        stars: String(stars),
        correct: String(outcome.correct),
        total: String(outcome.total),
      },
    });
  };
  const done = (o: Outcome) => void finish(o);

  return (
    <Screen scroll={game.type === 'memory' || game.type === 'word-match'}>
      <Header title={game.title} icon={game.icon} />
      {game.type === 'word-match' ? (
        <WordMatch pool={pool} pairs={young ? 4 : 5} onFinish={done} />
      ) : null}
      {game.type === 'listen-choose' ? (
        <ChoiceGame mode="listen" pool={pool} rounds={young ? 5 : 8} onFinish={done} />
      ) : null}
      {game.type === 'find-word' ? (
        <ChoiceGame mode="find" pool={pool} rounds={young ? 5 : 8} onFinish={done} />
      ) : null}
      {game.type === 'memory' ? (
        <MemoryCards pool={pool} pairs={young ? 4 : 6} onFinish={done} />
      ) : null}
      {game.type === 'spelling' ? (
        <SpellingPuzzle pool={pool} rounds={5} maxLength={young ? 4 : 7} onFinish={done} />
      ) : null}
      {game.type === 'quick-quiz' ? (
        <ChoiceGame mode="quiz" pool={pool} rounds={5} onFinish={done} />
      ) : null}
    </Screen>
  );
}
