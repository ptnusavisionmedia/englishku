import { Link } from 'expo-router';
import { Image, StyleSheet, View } from 'react-native';

import { RegisterForm } from '@/components/forms/RegisterForm';
import { Screen } from '@/components/layout/Screen';
import { FadeInUp } from '@/components/ui/Motion';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';

export default function RegisterScreen() {
  const { colors } = useTheme();
  return (
    <Screen>
      <View style={styles.header}>
        <Image
          source={require('../../assets/englishku-logo-clean.png')}
          accessibilityLabel="Logo EnglishKu"
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.title, { color: colors.text }]}>Buat akun</Text>
        <Text style={[styles.sub, { color: colors.textMuted }]}>
          Data tersimpan di HP ini: username, nama panggilan, dan progres belajar.
        </Text>
      </View>
      <FadeInUp delay={100}>
        <RegisterForm />
      </FadeInUp>
      <Text style={[styles.footer, { color: colors.textMuted }]}>
        Sudah punya akun?{' '}
        <Link href="/login" style={{ color: colors.link, fontWeight: '800' }}>
          Masuk
        </Link>
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: 4 },
  logo: { width: 130, height: 130 },
  title: { fontSize: 32, fontWeight: '900', textAlign: 'center' },
  sub: { fontSize: 16, textAlign: 'center', fontWeight: '600' },
  footer: { textAlign: 'center', fontSize: 16, fontWeight: '600' },
});
