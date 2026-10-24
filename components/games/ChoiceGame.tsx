import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { QuizOption, type OptionState } from '@/components/learning/QuizOption';
import { AudioButton } from '@/components/ui/AudioButton';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Bounce, FadeInUp, Float } from '@/components/ui/Motion';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';
import { wordIcon } from '@/lib/icons';
import { pick, shuffle } from '@/lib/random';
import { speak } from '@/lib/speech';
import type { Outcome, Vocabulary } from '@/types';

export type ChoiceMode = 'listen' | 'find' | 'quiz';
type Kind = 'listen' | 'find' | 'translate';

type Question = { target: Vocabulary; options: Vocabulary[]; kind: Kind };

type Props = {
  mode: ChoiceMode;
  pool: Vocabulary[];
  rounds?: number;
  onFinish: (outcome: Outcome) => void;
};

const QUIZ_KINDS: Kind[] = ['find', 'listen', 'translate'];

export function ChoiceGame({ mode, pool, rounds = 5, onFinish }: Props) {
  const { colors } = useTheme();

  const questions = useMemo<Question[]>(() => {
    const targets = pick(pool, Math.min(rounds, pool.length));
    return targets.map((target, i) => {
      const others = pick(
        pool.filter((w) => w.id !== target.id),
        Math.min(3, pool.length - 1),
      );
      const kind: Kind = mode === 'quiz' ? QUIZ_KINDS[i % QUIZ_KINDS.length]! : mode;
      return { target, kind, options: shuffle([target, ...others]) };
    });
  }, [pool, rounds, mode]);

  const [index, setIndex] = useState(0);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const [correct, setCorrect] = useState(0);

  const q = questions[index];

  // Say the word out loud as soon as a listening question appears.
  useEffect(() => {
    if (q?.kind === 'listen') speak(q.target.word);
  }, [q]);

  if (!q) return null;

  const choose = (option: Vocabulary) => {
    if (solved) return;
    if (option.id === q.target.id) {
      setSolved(true);
      if (wrongIds.length === 0) setCorrect((c) => c + 1);
    } else if (!wrongIds.includes(option.id)) {
      setWrongIds((w) => [...w, option.id]);
    }
  };

  const next = () => {
    const finished = index + 1 >= questions.length;
    const total = questions.length;
    if (finished) return onFinish({ correct, total });
    setIndex(index + 1);
    setWrongIds([]);
    setSolved(false);
  };

  const stateOf = (option: Vocabulary): OptionState => {
    if (solved) return option.id === q.target.id ? 'correct' : 'dim';
    return wrongIds.includes(option.id) ? 'wrong' : 'idle';
  };

  const instruction =
    q.kind === 'listen'
      ? 'Dengarkan, lalu pilih gambar yang benar.'
      : q.kind === 'find'
        ? 'Lihat gambar, lalu pilih katanya.'
        : `Apa bahasa Inggris dari “${q.target.translation}”?`;

  const showIconOptions = q.kind === 'listen';

  return (
    <View style={styles.wrap}>
      <ProgressBar value={index / questions.length} color={colors.blue} label="Kemajuan soal" />
      <Text style={[styles.instruction, { color: colors.text }]}>{instruction}</Text>

      {/* key restarts the entrance animation for every new question */}
      <FadeInUp key={q.target.id} style={styles.prompt}>
        {q.kind === 'listen' ? (
          <AudioButton text={q.target.word} size={96} label="Dengarkan lagi" />
        ) : q.kind === 'find' ? (
          <Float distance={4}>
            <Icon name={wordIcon(q.target.word)} size={128} label={`Gambar ${q.target.word}`} />
          </Float>
        ) : (
          <Icon name="question" size={96} />
        )}
      </FadeInUp>

      <View style={styles.grid}>
        {q.options.map((o) => (
          <QuizOption
            key={`${q.target.id}-${o.id}`}
            state={stateOf(o)}
            icon={showIconOptions ? wordIcon(o.word) : undefined}
            label={showIconOptions ? undefined : o.word}
            accessibilityLabel={showIconOptions ? `Gambar ${o.word}` : o.word}
            onPress={() => choose(o)}
          />
        ))}
      </View>

      <View style={styles.footer}>
        {solved ? (
          <>
            <Bounce trigger="solved">
              <Text
                accessibilityRole="alert"
                style={[styles.feedback, { color: colors.successText }]}
              >
                {wrongIds.length === 0 ? 'Great!' : `Bagus! Jawabannya ${q.target.word}`}
              </Text>
            </Bounce>
            <Button
              title={index + 1 >= questions.length ? 'Selesai' : 'Lanjut'}
              icon="arrow-right"
              onPress={next}
              variant="success"
            />
          </>
        ) : wrongIds.length > 0 ? (
          <Text accessibilityRole="alert" style={[styles.feedback, { color: colors.textMuted }]}>
            Good try! Coba lagi ya
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, gap: 14 },
  instruction: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  prompt: { alignItems: 'center', justifyContent: 'center', minHeight: 130 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  footer: { gap: 12, minHeight: 100, justifyContent: 'flex-end' },
  feedback: { fontSize: 24, fontWeight: '800', textAlign: 'center' },
});
