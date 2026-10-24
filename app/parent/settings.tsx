import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Switch, View } from 'react-native';

import { Hero } from '@/components/layout/Hero';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { Pill } from '@/components/ui/Pill';
import { Row } from '@/components/ui/Row';
import { Text } from '@/components/ui/Text';
import { DAILY_LIMIT_OPTIONS } from '@/constants/content';
import { useTheme } from '@/hooks/useTheme';
import { getErrorMessage } from '@/lib/api';
import { playSound } from '@/lib/sounds';
import { useAuthStore } from '@/stores/auth.store';
import { useSettingsStore } from '@/stores/settings.store';

const SWITCHES = [
  ['soundEnabled', 'Suara dan pengucapan'],
  ['musicEnabled', 'Musik'],
  ['notificationsEnabled', 'Pengingat belajar'],
  ['micConsent', 'Izin latihan mikrofon'],
] as const;

export default function ParentSettings() {
  const { colors } = useTheme();
  const router = useRouter();
  const s = useSettingsStore();
  const logout = useAuthStore((a) => a.logout);
  const [signingOut, setSigningOut] = useState(false);

  const confirmLogout = () =>
    Alert.alert('Keluar', 'Keluar dari akun di perangkat ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          playSound('logout');
          setSigningOut(true);
          try {
            await logout();
          } catch (e) {
            Alert.alert('Gagal keluar', getErrorMessage(e));
          } finally {
            setSigningOut(false);
          }
        },
      },
    ]);

  return (
    <Screen edges={['left', 'right']}>
      <Hero color="red" title="Pengaturan" subtitle="Atur waktu dan suara" icon="gear" />

      <View style={styles.block}>
        <Text style={[styles.section, { color: colors.text }]}>Batas waktu belajar harian</Text>
        <View style={styles.chips}>
          {DAILY_LIMIT_OPTIONS.map((m) => (
            <Pill
              key={m}
              label={m === 0 ? 'Tanpa batas' : `${m} mnt`}
              active={s.dailyLimitMinutes === m}
              onPress={() => s.set({ dailyLimitMinutes: m })}
            />
          ))}
        </View>
      </View>

      <View>
        {SWITCHES.map(([key, label], i) => (
          <Row
            key={key}
            title={label}
            last={i === SWITCHES.length - 1}
            trailing={
              <Switch
                accessibilityLabel={label}
                value={s[key]}
                trackColor={{ true: colors.green, false: colors.textMuted }}
                onValueChange={(v) => {
                  playSound('toggle');
                  s.set({ [key]: v });
                }}
              />
            }
          />
        ))}
        <Text style={[styles.note, { color: colors.textMuted }]}>
          Suara anak tidak pernah disimpan atau dikirim. Pengingat belajar hanya preferensi; belum
          ada notifikasi yang dikirim.
        </Text>
      </View>

      <Button
        title="Kembali ke mode anak"
        icon="home"
        size="md"
        variant="secondary"
        onPress={() => {
          s.set({ parentUnlocked: false });
          router.replace('/home');
        }}
      />
      <Button
        title="Keluar akun"
        size="md"
        variant="danger"
        loading={signingOut}
        onPress={confirmLogout}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: { gap: 10 },
  section: { fontSize: 20, fontWeight: '800' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  note: { fontSize: 13, fontWeight: '600', marginTop: 6 },
});
