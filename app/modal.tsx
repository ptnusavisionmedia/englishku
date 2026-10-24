import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Brutal } from '@/components/ui/Brutal';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Pop } from '@/components/ui/Motion';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';
import { playSound } from '@/lib/sounds';

/** Friendly message dialog: /modal?icon=...&title=...&message=... (icon = name from assets/icons). */
export default function MessageModal() {
  const { colors } = useTheme();
  const router = useRouter();
  useEffect(() => playSound('pop'), []);
  const { icon, title, message } = useLocalSearchParams<{
    icon?: string;
    title?: string;
    message?: string;
  }>();

  return (
    <View style={styles.backdrop}>
      <Pressable
        accessibilityLabel="Tutup"
        style={StyleSheet.absoluteFill}
        onPress={() => router.back()}
      />
      <Pop>
        <Brutal
          bg={colors.surface}
          offset={6}
          radius={24}
          accessibilityViewIsModal
          style={styles.card}
        >
          <Icon name={icon ?? 'sparkle'} size={96} />
          <Text style={[styles.title, { color: colors.text }]}>{title ?? 'Halo!'}</Text>
          {message ? (
            <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>
          ) : null}
          <Button title="Oke" onPress={() => router.back()} style={styles.btn} />
        </Brutal>
      </Pop>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(120,160,230,0.35)',
    justifyContent: 'center',
    padding: 24,
  },
  card: { padding: 24, alignItems: 'center', gap: 10 },
  title: { fontSize: 30, fontWeight: '900', textAlign: 'center' },
  message: { fontSize: 18, textAlign: 'center', fontWeight: '600' },
  btn: { alignSelf: 'stretch', marginTop: 10 },
});
