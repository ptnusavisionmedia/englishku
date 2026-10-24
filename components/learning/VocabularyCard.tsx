import { Pressable, StyleSheet, View } from 'react-native';

import { AudioButton } from '@/components/ui/AudioButton';
import { Brutal } from '@/components/ui/Brutal';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Float } from '@/components/ui/Motion';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';
import { playSound } from '@/lib/sounds';
import { wordIcon } from '@/lib/icons';
import type { Vocabulary } from '@/types';

type Props = {
  vocab: Vocabulary;
  isFavorite: boolean;
  isMastered: boolean;
  onToggleFavorite: () => void;
  onMastered: () => void;
};

/** The word in focus: one soft panel (no outline) holding the picture, the word and its actions. */
export function VocabularyCard({
  vocab,
  isFavorite,
  isMastered,
  onToggleFavorite,
  onMastered,
}: Props) {
  const { colors } = useTheme();
  return (
    <Brutal bg={colors.blue} radius={34} offset={8} style={styles.panel}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
        accessibilityState={{ selected: isFavorite }}
        onPress={() => {
          playSound('heart');
          onToggleFavorite();
        }}
        hitSlop={10}
        style={styles.fav}
      >
        <Icon name={isFavorite ? 'heart' : 'heart-empty'} size={36} />
      </Pressable>

      <Float distance={5}>
        <Icon name={wordIcon(vocab.word)} size={160} label={`Gambar ${vocab.word}`} />
      </Float>
      <Text style={[styles.word, { color: colors.onBright }]}>{vocab.word}</Text>
      <Text style={[styles.translation, { color: colors.onBright }]}>{vocab.translation}</Text>

      <AudioButton text={vocab.word} size={72} />

      {vocab.example_sentence ? (
        <View style={styles.example}>
          <Text style={[styles.sentence, { color: colors.onBright }]}>
            “{vocab.example_sentence}”
          </Text>
          <AudioButton
            text={vocab.example_sentence}
            size={44}
            rate={0.7}
            label="Dengarkan kalimat contoh"
          />
        </View>
      ) : null}

      <Button
        title={isMastered ? 'Aku sudah bisa!' : 'Saya sudah bisa'}
        icon="check"
        variant={isMastered ? 'success' : 'secondary'}
        onPress={onMastered}
        style={styles.fullWidth}
      />
    </Brutal>
  );
}

const styles = StyleSheet.create({
  panel: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 22,
    paddingHorizontal: 18,
  },
  fav: { position: 'absolute', top: 14, right: 16, zIndex: 1 },
  word: { fontSize: 48, fontWeight: '900' },
  translation: { fontSize: 22, fontWeight: '700' },
  example: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    alignSelf: 'stretch',
    paddingVertical: 6,
  },
  sentence: { flex: 1, fontSize: 19, fontWeight: '600' },
  fullWidth: { alignSelf: 'stretch' },
});
