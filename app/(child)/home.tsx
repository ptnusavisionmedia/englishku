import { useRouter } from 'expo-router';
import { Image, StyleSheet, View } from 'react-native';

import { LessonCard } from '@/components/learning/LessonCard';
import { PinnedBadges } from '@/components/learning/PinnedBadges';
import { Hero } from '@/components/layout/Hero';
import { Screen } from '@/components/layout/Screen';
import { Avatar } from '@/components/ui/Avatar';
import { Brutal } from '@/components/ui/Brutal';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { FadeInUp, Float, Pulse } from '@/components/ui/Motion';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Text } from '@/components/ui/Text';
import { Wobble } from '@/components/ui/Wobble';
import { useLessons } from '@/hooks/useLessons';
import { useStudyGuard } from '@/hooks/useStudy';
import { useTheme } from '@/hooks/useTheme';
import { levelFromStars } from '@/lib/learning';
import { useLearningStore } from '@/stores/learning.store';

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const profile = useLearningStore((s) => s.profile);
  const syncError = useLearningStore((s) => s.syncError);
  const { recommended } = useLessons();
  const { guard, limited, todaySeconds } = useStudyGuard();

  if (!profile) return null;
  const goal = profile.daily_goal_minutes ?? 10;
  const minutes = Math.floor(todaySeconds / 60);

  const start = () =>
    guard(
      () =>
        recommended &&
        router.push({ pathname: '/lesson/[id]', params: { id: recommended.lesson.id } }),
    );

  const stats = [
    { icon: 'flame', value: profile.current_streak, label: 'hari', bg: colors.red },
    { icon: 'star', value: profile.total_stars, label: 'bintang', bg: colors.orange },
    { icon: 'medal', value: levelFromStars(profile.total_stars), label: 'level', bg: colors.green },
  ];

  return (
    <Screen edges={['left', 'right']}>
      <Hero color="blue">
        <View style={styles.top}>
          <Avatar avatarKey={profile.avatar_url} size={64} />
          <View style={styles.flex}>
            <Text style={[styles.hello, { color: colors.onBright }]}>Hello,</Text>
            <Text style={[styles.name, { color: colors.onBright }]} numberOfLines={1}>
              {profile.display_name}!
            </Text>
            {/* The up-to-three badges the child chose in Profil. */}
            <PinnedBadges size={38} />
          </View>
          <Float distance={4}>
            <Wobble label="Logo EnglishKu">
              <Image
                source={require('../../assets/englishku-logo-clean.png')}
                accessibilityLabel="EnglishKu"
                style={styles.logo}
                resizeMode="contain"
              />
            </Wobble>
          </Float>
        </View>
        <View style={styles.pills}>
          {stats.map((s) => (
            <Brutal
              key={s.icon}
              bg={s.bg}
              radius={999}
              offset={4}
              accessibilityLabel={`${s.value} ${s.label}`}
              containerStyle={styles.flex}
              style={styles.pill}
            >
              <Icon name={s.icon} size={34} />
              <Text style={[styles.pillValue, { color: colors.onBright }]}>{s.value}</Text>
              <Text style={[styles.pillLabel, { color: colors.onBright }]}>{s.label}</Text>
            </Brutal>
          ))}
        </View>
      </Hero>

      <FadeInUp delay={80}>
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Belajar hari ini</Text>
            <Text style={[styles.minutes, { color: colors.textMuted }]}>
              {minutes >= goal ? 'Target tercapai!' : `${minutes} / ${goal} menit`}
            </Text>
          </View>
          <ProgressBar
            value={todaySeconds / (goal * 60)}
            color={colors.green}
            height={20}
            label="Progress belajar hari ini"
          />
        </View>
      </FadeInUp>

      {limited ? (
        <View style={[styles.rest, { backgroundColor: colors.tintPurple }]}>
          <Icon name="moon" size={44} />
          <View style={styles.flex}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Waktunya istirahat</Text>
            <Text style={[styles.minutes, { color: colors.textMuted }]}>Sampai jumpa besok!</Text>
          </View>
        </View>
      ) : null}

      <FadeInUp delay={150}>
        <Pulse>
          <Button title="Mulai Belajar" icon="rocket" onPress={start} />
        </Pulse>
      </FadeInUp>

      {recommended ? (
        <FadeInUp delay={220}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Pelajaran untukmu</Text>
            <LessonCard
              lesson={recommended.lesson}
              category={recommended.category}
              status={recommended.status}
              index={recommended.index}
              recommended
              standalone
              last
              onPress={start}
            />
          </View>
        </FadeInUp>
      ) : null}

      <FadeInUp delay={290}>
        <View style={styles.row}>
          <Button
            title="Bermain"
            icon="gamepad"
            variant="secondary"
            size="md"
            style={styles.flex}
            onPress={() => router.navigate('/games')}
          />
          <Button
            title="Koleksi"
            icon="chest"
            variant="secondary"
            size="md"
            style={styles.flex}
            onPress={() => router.navigate('/collection')}
          />
        </View>
      </FadeInUp>

      {syncError ? (
        <Text accessibilityRole="alert" style={{ color: colors.textMuted, textAlign: 'center' }}>
          {syncError}
        </Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  hello: { fontSize: 18, fontWeight: '700' },
  name: { fontSize: 36, fontWeight: '900' },
  logo: { width: 70, height: 70 },
  pills: { flexDirection: 'row', gap: 10 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  pillValue: { fontSize: 20, fontWeight: '900' },
  pillLabel: { fontSize: 12, fontWeight: '700' },
  section: { gap: 10 },
  sectionHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 22, fontWeight: '800' },
  minutes: { fontSize: 16, fontWeight: '700' },
  rest: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 24 },
  row: { flexDirection: 'row', gap: 12 },
});
