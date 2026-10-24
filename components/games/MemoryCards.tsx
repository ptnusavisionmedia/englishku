import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BrutalPressable } from '@/components/ui/Brutal';
import { Icon } from '@/components/ui/Icon';
import { Bounce } from '@/components/ui/Motion';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';
import { wordIcon } from '@/lib/icons';
import { pick, shuffle } from '@/lib/random';
import { speak } from '@/lib/speech';
import { playSound } from '@/lib/sounds';
import type { Outcome, Vocabulary } from '@/types';

type Card = { key: string; vocab: Vocabulary; kind: 'icon' | 'word' };
type Props = { pool: Vocabulary[]; pairs?: number; onFinish: (outcome: Outcome) => void };

export function MemoryCards({ pool, pairs = 6, onFinish }: Props) {
  const { colors } = useTheme();
  const cards = useMemo<Card[]>(() => {
    const chosen = pick(pool, Math.min(pairs, pool.length));
    return shuffle(
      chosen.flatMap<Card>((v) => [
        { key: `${v.id}-i`, vocab: v, kind: 'icon' },
        { key: `${v.id}-w`, vocab: v, kind: 'word' },
      ]),
    );
  }, [pool, pairs]);
  const pairCount = cards.length / 2;

  const [open, setOpen] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  useEffect(() => {
    if (pairCount > 0 && matched.length === pairCount) {
      // Fewer wasted moves = more stars, but a finished board is always a good result.
      const extra = Math.max(0, moves - pairCount);
      const correct = Math.max(Math.ceil(pairCount * 0.6), pairCount - Math.floor(extra / 2));
      const t = setTimeout(() => onFinish({ correct, total: pairCount }), 800);
      return () => clearTimeout(t);
    }
  }, [matched, pairCount, moves, onFinish]);

  const flip = (card: Card) => {
    if (open.length >= 2 || open.includes(card.key) || matched.includes(card.vocab.id)) return;
    const next = [...open, card.key];
    setOpen(next);
    playSound('flip');
    if (card.kind === 'word') speak(card.vocab.word);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next.map((k) => cards.find((c) => c.key === k)!);
      if (a!.vocab.id === b!.vocab.id) {
        timer.current = setTimeout(() => {
          playSound('match');
          setMatched((m) => [...m, a!.vocab.id]);
          setOpen([]);
        }, 500);
      } else {
        timer.current = setTimeout(() => setOpen([]), 1000);
      }
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={[styles.instruction, { color: colors.text }]}>
        Pasangan: {matched.length} / {pairCount}
      </Text>
      <View style={styles.grid}>
        {cards.map((c) => {
          const isMatched = matched.includes(c.vocab.id);
          const faceUp = open.includes(c.key) || isMatched;
          return (
            <View key={c.key} style={styles.cell}>
              <Bounce trigger={isMatched ? 'match' : null}>
                <BrutalPressable
                  bg={isMatched ? colors.green : faceUp ? colors.surface : colors.blue}
                  radius={16}
                  offset={3}
                  accessibilityLabel={
                    faceUp
                      ? c.kind === 'icon'
                        ? `Gambar ${c.vocab.word}`
                        : c.vocab.word
                      : 'Kartu tertutup'
                  }
                  sound={false}
                  onPress={() => flip(c)}
                  style={styles.card}
                >
                  {faceUp ? (
                    c.kind === 'icon' ? (
                      <Icon name={wordIcon(c.vocab.word)} size={62} />
                    ) : (
                      <Text
                        style={[styles.word, { color: isMatched ? colors.onBright : colors.text }]}
                        adjustsFontSizeToFit
                        numberOfLines={2}
                      >
                        {c.vocab.word}
                      </Text>
                    )
                  ) : (
                    <Icon name="question" size={44} />
                  )}
                </BrutalPressable>
              </Bounce>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, gap: 12 },
  instruction: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  cell: { width: '31%' },
  card: { aspectRatio: 0.95, alignItems: 'center', justifyContent: 'center', padding: 4 },
  word: { fontSize: 20, fontWeight: '800', textAlign: 'center' },
});
