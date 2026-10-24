import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Pop } from '@/components/ui/Motion';
import { playSound } from '@/lib/sounds';

type Props = { earned: number; total?: number; size?: number };

/** Stars pop in one after another, each with its own "ding". Unearned stars are greyed out. */
export function StarRow({ earned, total = 3, size = 64 }: Props) {
  useEffect(() => {
    const timers = Array.from({ length: earned }, (_, i) =>
      setTimeout(() => playSound('star'), 350 + i * 260),
    );
    return () => timers.forEach(clearTimeout);
  }, [earned]);

  return (
    <View accessibilityLabel={`${earned} dari ${total} bintang`} style={styles.row}>
      {Array.from({ length: total }, (_, i) => (
        <Pop key={i} delay={300 + i * 260}>
          <Icon name={i < earned ? 'star' : 'star-empty'} size={size} />
        </Pop>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4, justifyContent: 'center' },
});
