import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Brutal, BrutalPressable } from '@/components/ui/Brutal';
import { AudioButton } from '@/components/ui/AudioButton';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Bounce, FadeInUp, Float, Shake } from '@/components/ui/Motion';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';
import { wordIcon } from '@/lib/icons';
import { pick, shuffle } from '@/lib/random';
import { speak } from '@/lib/speech';
import { playSound } from '@/lib/sounds';
import type { Outcome, Vocabulary } from '@/types';

type Props = {
  pool: Vocabulary[];
  rounds?: number;
  maxLength?: number;
  onFinish: (outcome: Outcome) => void;
};

const scramble = (word: string): string[] => {
  const letters = word.toUpperCase().split('');
  for (let i = 0; i < 5; i++) {
    const s = shuffle(letters);
    if (s.join('') !== word.toUpperCase()) return s;
  }
  return letters;
};

export function SpellingPuzzle({ pool, rounds = 5, maxLength = 7, onFinish }: Props) {
  const { colors } = useTheme();
  const words = useMemo(
    () =>
      pick(
        pool.filter((w) => /^[A-Za-z]{3,}$/.test(w.word) && w.word.length <= maxLength),
        rounds,
      ),
    [pool, rounds, maxLength],
  );

  const [index, setIndex] = useState(0);
  const [slots, setSlots] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const [missedThis, setMissedThis] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = words[index];
  const tiles = useMemo(() => (current ? scramble(current.word) : []), [current]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  useEffect(() => {
    if (current) speak(current.word);
  }, [current]);

  if (!current) return null;
  const target = current.word.toUpperCase();

  const addTile = (tileIndex: number) => {
    if (solved || slots.includes(tileIndex) || slots.length >= tiles.length) return;
    playSound('tile');
    const next = [...slots, tileIndex];
    setSlots(next);
    if (next.length === tiles.length) {
      if (next.map((i) => tiles[i]).join('') === target) {
        setSolved(true);
        setMessage('Great!');
        playSound('correct');
        if (!missedThis) setCorrect((c) => c + 1);
        speak(current.word);
      } else {
        setMissedThis(true);
        setShakeKey((k) => k + 1);
        setMessage('Good try! Coba susun lagi');
        playSound('wrong');
        timer.current = setTimeout(() => {
          setSlots([]);
          setMessage(null);
        }, 900);
      }
    }
  };

  const removeSlot = (position: number) => {
    if (solved) return;
    setSlots((s) => s.filter((_, i) => i !== position));
  };

  const next = () => {
    if (index + 1 >= words.length) return onFinish({ correct, total: words.length });
    setIndex(index + 1);
    setSlots([]);
    setSolved(false);
    setMissedThis(false);
    setMessage(null);
  };

  return (
    <View style={styles.wrap}>
      <ProgressBar value={index / words.length} color={colors.blue} label="Kemajuan soal" />
      <Text style={[styles.instruction, { color: colors.text }]}>Susun hurufnya menjadi kata.</Text>

      <FadeInUp key={current.id} style={styles.prompt}>
        <Float distance={4}>
          <Icon name={wordIcon(current.word)} size={110} label={`Gambar ${current.word}`} />
        </Float>
        <AudioButton text={current.word} size={56} />
      </FadeInUp>

      <Shake trigger={shakeKey || null}>
        <View style={styles.row}>
          {tiles.map((_, position) => {
            const letterIndex = slots[position];
            const filled = letterIndex !== undefined;
            return (
              <BrutalPressable
                key={position}
                bg={solved ? colors.green : colors.surface}
                radius={12}
                offset={3}
                accessibilityLabel={
                  filled ? `Huruf ${tiles[letterIndex]}, ketuk untuk menghapus` : 'Kotak kosong'
                }
                onPress={() => removeSlot(position)}
                style={styles.slot}
              >
                <Text style={[styles.letter, { color: solved ? colors.onBright : colors.text }]}>
                  {filled ? tiles[letterIndex] : ''}
                </Text>
              </BrutalPressable>
            );
          })}
        </View>
      </Shake>

      <View style={styles.row}>
        {tiles.map((letter, i) => (
          <Bounce key={i} trigger={slots.includes(i) ? 'used' : null}>
            <BrutalPressable
              bg={colors.orange}
              radius={12}
              offset={3}
              disabled={slots.includes(i)}
              accessibilityLabel={`Huruf ${letter}`}
              onPress={() => addTile(i)}
              style={styles.tile}
            >
              <Text style={[styles.letter, { color: colors.onBright }]}>{letter}</Text>
            </BrutalPressable>
          </Bounce>
        ))}
      </View>

      <View style={styles.footer}>
        {message ? (
          <Brutal
            bg={solved ? colors.green : colors.surface}
            offset={3}
            radius={14}
            style={styles.msgBox}
          >
            <Text
              accessibilityRole="alert"
              style={[styles.message, { color: solved ? colors.onBright : colors.text }]}
            >
              {message}
            </Text>
          </Brutal>
        ) : null}
        {solved ? (
          <Button
            title={index + 1 >= words.length ? 'Selesai' : 'Lanjut'}
            icon="arrow-right"
            variant="success"
            onPress={next}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, gap: 14 },
  instruction: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  prompt: { alignItems: 'center', gap: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  slot: { width: 46, height: 56, alignItems: 'center', justifyContent: 'center' },
  tile: { width: 52, height: 60, alignItems: 'center', justifyContent: 'center' },
  letter: { fontSize: 30, fontWeight: '900' },
  footer: { gap: 12, minHeight: 100, justifyContent: 'flex-end' },
  msgBox: { paddingVertical: 8, paddingHorizontal: 12 },
  message: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
});
