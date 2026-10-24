import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Switch, View } from 'react-native';

import { Hero } from '@/components/layout/Hero';
import { Screen } from '@/components/layout/Screen';
import { Avatar } from '@/components/ui/Avatar';
import { BrutalPressable } from '@/components/ui/Brutal';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { FadeInUp } from '@/components/ui/Motion';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Row } from '@/components/ui/Row';
import { Text } from '@/components/ui/Text';
import { AVATARS } from '@/constants/content';
import { useTheme } from '@/hooks/useTheme';
import { getErrorMessage } from '@/lib/api';
import { avatarIcon, badgeIcon } from '@/lib/icons';
import { levelFromStars, levelProgress } from '@/lib/learning';
import { playSound } from '@/lib/sounds';
import { useAuthStore } from '@/stores/auth.store';
import { useLearningStore } from '@/stores/learning.store';
import { useSettingsStore } from '@/stores/settings.store';

const SLOTS = 3;

export default function ProfileScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const profile = useLearningStore((s) => s.profile);
  const progress = useLearningStore((s) => s.progress);
  const lessons = useLearningStore((s) => s.lessons);
  const achievements = useLearningStore((s) => s.achievements);
  const unlocked = useLearningStore((s) => s.unlocked);
  const updateProfile = useLearningStore((s) => s.updateProfile);
  const setPinnedBadges = useLearningStore((s) => s.setPinnedBadges);
  const username = useAuthStore((s) => s.user?.username);
  const logout = useAuthStore((s) => s.logout);
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const musicEnabled = useSettingsStore((s) => s.musicEnabled);
  const setSettings = useSettingsStore((s) => s.set);
  // Which badge slot is being edited (null = picker closed).
  const [slot, setSlot] = useState<number | null>(null);

  if (!profile) return null;
  const themesDone = lessons.filter((l) => progress[l.id]?.status === 'completed').length;
  const stars = profile.total_stars;
  const earned = achievements.filter((a) => unlocked[a.id]);
  const pinned = profile.pinned_badges.filter((id) => unlocked[id]);

  const openParent = () => {
    setSettings({ parentUnlocked: false });
    router.push('/parent');
  };

  /** Puts `id` in the slot being edited (or empties the slot when `id` is null). */
  const assign = (id: string | null) => {
    if (slot === null) return;
    // Edit exactly three positions, so choosing a badge that is already pinned simply moves it.
    const slots: (string | null)[] = Array.from({ length: SLOTS }, (_, i) => pinned[i] ?? null);
    if (id) {
      for (let i = 0; i < SLOTS; i++) if (slots[i] === id) slots[i] = null;
      slots[slot] = id;
    } else {
      slots[slot] = null;
    }
    void setPinnedBadges(slots.filter((x): x is string => !!x));
    setSlot(null);
  };

  /** Signs out of this account, then opens the login screen or the register screen. */
  const leave = (message: string, next: '/login' | '/register') =>
    Alert.alert('Ganti akun', message, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Lanjut',
        onPress: () => {
          playSound('logout');
          logout()
            .then(() => router.replace(next))
            .catch((e) => Alert.alert('Gagal keluar', getErrorMessage(e)));
        },
      },
    ]);

  const stats = [
    { icon: 'star', text: `${stars} bintang` },
    { icon: 'flame', text: `${profile.current_streak} hari` },
    { icon: 'check', text: `${themesDone} tema` },
  ];

  return (
    <Screen edges={['left', 'right']}>
      <Hero color="blue">
        <View style={styles.center}>
          <Avatar avatarKey={profile.avatar_url} size={110} />
          <Text style={[styles.name, { color: colors.onBright }]}>{profile.display_name}</Text>
          <Text style={[styles.age, { color: colors.onBright }]}>
            Usia {profile.age_group} tahun · Level {levelFromStars(stars)}
          </Text>
          {username ? (
            <Text style={[styles.user, { color: colors.onBright }]}>@{username}</Text>
          ) : null}
        </View>
        <ProgressBar
          value={levelProgress(stars)}
          color={colors.orange}
          height={20}
          label="Menuju level berikutnya"
        />
      </Hero>

      <FadeInUp>
        <View style={styles.stats}>
          {stats.map((s) => (
            <View key={s.icon} style={styles.stat}>
              <Icon name={s.icon} size={44} />
              <Text style={[styles.statText, { color: colors.text }]}>{s.text}</Text>
            </View>
          ))}
        </View>
      </FadeInUp>

      <FadeInUp delay={80}>
        <Text style={[styles.section, { color: colors.text }]}>Badge di Beranda</Text>
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          Pasang sampai 3 badge yang sudah kamu dapat.
        </Text>
        <View style={styles.slots}>
          {Array.from({ length: SLOTS }, (_, i) => {
            const id = pinned[i];
            const achievement = achievements.find((a) => a.id === id);
            const active = slot === i;
            return (
              <BrutalPressable
                key={i}
                bg={active ? colors.orange : achievement ? colors.tintYellow : colors.tintBlue}
                radius={28}
                offset={5}
                sound="pop"
                containerStyle={styles.slotCell}
                accessibilityLabel={
                  achievement ? `Slot ${i + 1}: ${achievement.name}` : `Slot ${i + 1} kosong`
                }
                accessibilityState={{ selected: active }}
                onPress={() => setSlot(active ? null : i)}
                style={styles.slot}
              >
                {achievement ? (
                  <Icon name={badgeIcon(achievement.name)} size={74} />
                ) : (
                  <Text style={[styles.plus, { color: colors.textMuted }]}>+</Text>
                )}
              </BrutalPressable>
            );
          })}
        </View>

        {slot !== null ? (
          <View style={styles.picker}>
            <Text style={[styles.pickerTitle, { color: colors.text }]}>
              Pilih badge untuk slot {slot + 1}
            </Text>
            {earned.length === 0 ? (
              <Text style={[styles.hint, { color: colors.textMuted }]}>
                Belum ada badge. Selesaikan pelajaran dan permainan dulu ya!
              </Text>
            ) : (
              <View style={styles.pickerRow}>
                {earned.map((a) => (
                  <BrutalPressable
                    key={a.id}
                    bg={pinned.includes(a.id) ? colors.tintYellow : colors.surface}
                    radius={22}
                    offset={4}
                    sound="pop"
                    accessibilityLabel={a.name}
                    onPress={() => assign(a.id)}
                    style={styles.pick}
                  >
                    <Icon name={badgeIcon(a.name)} size={58} />
                  </BrutalPressable>
                ))}
              </View>
            )}
            {slot < pinned.length ? (
              <Button
                title="Kosongkan slot"
                variant="secondary"
                size="md"
                sound="back"
                onPress={() => assign(null)}
              />
            ) : null}
          </View>
        ) : null}
      </FadeInUp>

      <FadeInUp delay={140}>
        <Text style={[styles.section, { color: colors.text }]}>Pilih avatar</Text>
        <View style={styles.avatars}>
          {AVATARS.map((a) => {
            const locked = stars < a.unlockStars;
            const active = profile.avatar_url === a.key;
            return (
              <BrutalPressable
                key={a.key}
                bg={active ? colors.orange : colors.tintBlue}
                radius={38}
                offset={4}
                disabled={locked}
                sound="pop"
                accessibilityState={{ selected: active, disabled: locked }}
                accessibilityLabel={
                  locked
                    ? `Avatar ${a.key}, terbuka di ${a.unlockStars} bintang`
                    : `Avatar ${a.key}`
                }
                onPress={() => void updateProfile({ avatar_url: a.key })}
                style={styles.avatarChoice}
              >
                {locked ? (
                  <View style={styles.locked}>
                    <Icon name="lock" size={34} />
                    <Text style={[styles.need, { color: colors.text }]}>{a.unlockStars}</Text>
                  </View>
                ) : (
                  <Icon name={avatarIcon(a.key)} size={62} />
                )}
              </BrutalPressable>
            );
          })}
        </View>
      </FadeInUp>

      <FadeInUp delay={200}>
        <Row
          icon="speaker"
          iconSize={44}
          title="Suara"
          trailing={
            <Switch
              accessibilityLabel="Suara"
              value={soundEnabled}
              trackColor={{ true: colors.green, false: colors.textMuted }}
              onValueChange={(v) => {
                if (v) setSettings({ soundEnabled: true });
                playSound('toggle');
                if (!v) setSettings({ soundEnabled: false });
              }}
            />
          }
        />
        <Row
          icon="sparkle"
          iconSize={44}
          title="Musik"
          last
          trailing={
            <Switch
              accessibilityLabel="Musik"
              value={musicEnabled}
              trackColor={{ true: colors.green, false: colors.textMuted }}
              onValueChange={(v) => {
                playSound('toggle');
                setSettings({ musicEnabled: v });
              }}
            />
          }
        />
      </FadeInUp>

      <FadeInUp delay={260}>
        <View style={styles.accountBlock}>
          <Text style={[styles.section, { color: colors.text }]}>Akun</Text>
          <Button
            title="Ganti Akun"
            icon="repeat"
            variant="blue"
            size="md"
            onPress={() => leave('Keluar dari akun ini lalu masuk dengan akun lain?', '/login')}
          />
          <Button
            title="Buat Akun Baru"
            icon="sparkle"
            variant="success"
            size="md"
            onPress={() => leave('Keluar dari akun ini lalu membuat akun baru?', '/register')}
          />
          <Button
            title="Mode Orang Tua"
            icon="lock"
            variant="secondary"
            size="md"
            onPress={openParent}
          />
          <Button
            title="Keluar"
            icon="arrow-left"
            variant="danger"
            size="md"
            sound={false}
            onPress={() => leave('Keluar dari akun di HP ini?', '/login')}
          />
        </View>
      </FadeInUp>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', gap: 2 },
  name: { fontSize: 40, fontWeight: '900' },
  age: { fontSize: 17, fontWeight: '700' },
  user: { fontSize: 15, fontWeight: '700', opacity: 0.95 },
  stats: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { alignItems: 'center', gap: 2, flex: 1 },
  statText: { fontSize: 16, fontWeight: '800' },
  section: { fontSize: 22, fontWeight: '800', marginBottom: 6 },
  hint: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  slots: { flexDirection: 'row', gap: 12 },
  slotCell: { flex: 1 },
  slot: { height: 96, alignItems: 'center', justifyContent: 'center' },
  plus: { fontSize: 44, fontWeight: '900' },
  picker: { marginTop: 14, gap: 10 },
  pickerTitle: { fontSize: 18, fontWeight: '800' },
  pickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pick: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center' },
  avatars: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 4 },
  avatarChoice: { width: 76, height: 76, alignItems: 'center', justifyContent: 'center' },
  locked: { alignItems: 'center' },
  need: { fontSize: 12, fontWeight: '800', marginTop: -2 },
  accountBlock: { gap: 12 },
});
