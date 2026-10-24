import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { Icon } from '@/components/ui/Icon';
import { Float } from '@/components/ui/Motion';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';

export default function NotFoundScreen() {
  const { colors } = useTheme();
  return (
    <>
      <Stack.Screen options={{ title: 'Tidak ditemukan' }} />
      <Screen>
        <View style={styles.center}>
          <Float>
            <Icon name="question" size={110} />
          </Float>
          <Text style={[styles.title, { color: colors.text }]}>Halaman tidak ditemukan</Text>
          <Link href="/" style={{ color: colors.link, fontWeight: '800', fontSize: 18 }}>
            Kembali ke beranda
          </Link>
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', gap: 12, marginTop: 40 },
  title: { fontSize: 30, fontWeight: '900', textAlign: 'center' },
});
