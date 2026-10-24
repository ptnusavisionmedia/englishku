import { Link } from 'expo-router';
import { Image, StyleSheet, View } from 'react-native';

import { LoginForm } from '@/components/forms/LoginForm';
import { Screen } from '@/components/layout/Screen';
import { FadeInUp, Float } from '@/components/ui/Motion';
import { Text } from '@/components/ui/Text';
import { Wobble } from '@/components/ui/Wobble';
import { useTheme } from '@/hooks/useTheme';

export default function LoginScreen() {
  const { colors } = useTheme();
  return (
    <Screen>
      <View style={styles.header}>
        <Float distance={6}>
          <Wobble label="Logo EnglishKu">
            <Image
              source={require('../../assets/englishku-logo-clean.png')}
              accessibilityLabel="Logo EnglishKu"
              style={styles.logo}
              resizeMode="contain"
            />
          </Wobble>
        </Float>
        <Text style={[styles.title, { color: colors.text }]}>Selamat datang!</Text>
        <Text style={[styles.sub, { color: colors.textMuted }]}>
          Masuk dengan username dan password untuk lanjut belajar.
        </Text>
      </View>
      <FadeInUp delay={120}>
        <LoginForm />
      </FadeInUp>
      <Text style={[styles.footer, { color: colors.textMuted }]}>
        Belum punya akun?{' '}
        <Link href="/register" style={{ color: colors.link, fontWeight: '800' }}>
          Daftar
        </Link>
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: 4 },
  logo: { width: 190, height: 190 },
  title: { fontSize: 32, fontWeight: '900' },
  sub: { fontSize: 16, textAlign: 'center', fontWeight: '600' },
  footer: { textAlign: 'center', fontSize: 16, fontWeight: '600' },
});
