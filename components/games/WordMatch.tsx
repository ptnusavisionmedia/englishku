import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { QuizOption } from '@/components/learning/QuizOption';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';
import { wordIcon } from '@/lib/icons';
import { pick, shuffle } from '@/lib/random';
import { speak } from '@/lib/speech';
import type { Outcome, Vocabulary } from '@/types';

type Props = { pool: Vocabulary[]; pairs?: number; onFinish: (outcome: Outcome) => void };

export function WordMatch({ pool, pairs = 5, onFinish }: Props) {
  const { colors } = useTheme();
  const items = useMemo(() => pick(pool, Math.min(pairs, pool.length)), [pool, pairs]);
  const words = useMemo(() => shuffle(items), [items]);

  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [missed, setMissed] = useState<string[]>([]);
  const [wrongWord, setWrongWord] = useState<string | null>(null);
  const finished = useRef(false);

  useEffect(() => {
    if (matched.length === items.length && items.length > 0 && !finished.current) {
      finished.current = true;
      const t = setTimeout(
        () => onFinish({ correct: items.length - missed.length, total: items.length }),
        700,
      );
      return () => clearTimeout(t);
    }
  }, [matched, items, missed, onFinish]);

  const pickWord = (word: Vocabulary) => {
    if (!selected) return;
    if (word.id === selected) {
      speak(word.word);
      setMatched((m) => [...m, word.id]);
      setSelected(null);
      setWrongWord(null);
    } else {
      setMissed((m) => (m.includes(selected) ? m : [...m, selected]));
      // A fresh object each time so the tile shakes again on repeated mistakes.
      setWrongWord(word.id);
    }
  };

  return (
    <View style={styles.wrap}>
      <ProgressBar
        value={matched.length / items.length}
        color={colors.blue}
        label="Pasangan ditemukan"
      />
      <Text style={[styles.instruction, { color: colors.text }]}>
        {selected ? 'Sekarang pilih katanya.' : 'Pilih satu gambar dulu.'}
      </Text>
      <View style={styles.cols}>
        <View style={styles.col}>
          {items.map((w) => (
            <QuizOption
              key={w.id}
              icon={wordIcon(w.word)}
              accessibilityLabel={`Gambar ${w.word}`}
              state={matched.includes(w.id) || selected === w.id ? 'correct' : 'idle'}
              onPress={() => {
                if (matched.includes(w.id)) return;
                setSelected(w.id);
                setWrongWord(null);
              }}
            />
          ))}
        </View>
        <View style={styles.col}>
          {words.map((w) => (
            <QuizOption
              key={w.id}
              label={w.word}
              state={matched.includes(w.id) ? 'correct' : wrongWord === w.id ? 'wrong' : 'idle'}
              onPress={() => (matched.includes(w.id) ? undefined : pickWord(w))}
            />
          ))}
        </View>
      </View>
      {wrongWord ? (
        <Text accessibilityRole="alert" style={[styles.hint, { color: colors.textMuted }]}>
          Good try! Coba kata yang lain
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, gap: 12 },
  instruction: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  cols: { flexDirection: 'row', gap: 10 },
  col: { flex: 1, gap: 4 },
  hint: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
});
