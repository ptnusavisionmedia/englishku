import { Image, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { Avatar } from '@/components/ui/Avatar';
import { BrutalPressable } from '@/components/ui/Brutal';
import { Button } from '@/components/ui/Button';
import { FadeInUp, Float, Pop } from '@/components/ui/Motion';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';
import { useLearningStore } from '@/stores/learning.store';
import { useOnboardingStore } from '@/stores/onboarding.store';

const STEPS = 2;
const GOALS: { value: 5 | 10 | 15; color: 'green' | 'blue' | 'red' }[] = [
  { value: 5, color: 'green' },
  { value: 10, color: 'blue' },
  { value: 15, color: 'red' },
];

/** Name, age group, and avatar are chosen at registration; here the child picks a daily goal. */
export default function OnboardingScreen() {
  const { colors } = useTheme();
  const profile = useLearningStore((s) => s.profile);
  const updateProfile = useLearningStore((s) => s.updateProfile);
  const { step, goal, setStep, setGoal, reset } = useOnboardingStore();

  const next = () => {
    if (step < STEPS - 1) return setStep(step + 1);
    if (!goal) return;
    void updateProfile({ daily_goal_minutes: goal }).then(reset);
    // The root layout redirects to Home as soon as the goal is saved.
  };

  return (
    <Screen>
      <View style={styles.dots} accessibilityLabel={`Langkah ${step + 1} dari ${STEPS}`}>
        {Array.from({ length: STEPS }, (_, i) => (
          <View
            key={i}
            style={[styles.dot, { backgroundColor: i <= step ? colors.orange : colors.tintBlue }]}
          />
        ))}
      </View>

      {step === 0 ? (
        <View style={styles.center}>
          <Float distance={8}>
            <Image
              source={require('../assets/englishku-logo-clean.png')}
              accessibilityLabel="Logo EnglishKu"
              style={styles.logo}
              resizeMode="contain"
            />
          </Float>
          <Pop delay={200}>
            <Avatar avatarKey={profile?.avatar_url} size={92} />
          </Pop>
          <Text style={[styles.title, { color: colors.text }]}>
            Halo, {profile?.display_name ?? 'teman'}!
          </Text>
          <Text style={[styles.sub, { color: colors.textMuted }]}>
            Belajar English itu seru! Mendengar, bermain, dan mengumpulkan bintang bersama
            EnglishKu.
          </Text>
        </View>
      ) : (
        <View style={styles.block}>
          <Text style={[styles.title, { color: colors.text }]}>
            Mau belajar berapa lama setiap hari?
          </Text>
          <View style={styles.row}>
            {GOALS.map((g, i) => {
              const active = goal === g.value;
              return (
                <FadeInUp key={g.value} delay={i * 90} style={styles.flex}>
                  <BrutalPressable
                    bg={colors[g.color]}
                    radius={26}
                    offset={active ? 3 : 7}
                    sound="pop"
                    accessibilityLabel={`${g.value} menit`}
                    accessibilityState={{ selected: active }}
                    onPress={() => setGoal(g.value)}
                    style={[styles.goal, !active && goal ? { opacity: 0.6 } : null]}
                  >
                    <Text style={[styles.goalNumber, { color: colors.onBright }]}>{g.value}</Text>
                    <Text style={[styles.goalUnit, { color: colors.onBright }]}>menit</Text>
                  </BrutalPressable>
                </FadeInUp>
              );
            })}
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <Button
          title={step === STEPS - 1 ? 'Ayo mulai!' : 'Lanjut'}
          icon={step === STEPS - 1 ? 'rocket' : 'arrow-right'}
          onPress={next}
          disabled={step === STEPS - 1 && !goal}
        />
        {step > 0 ? (
          <Button
            title="Kembali"
            variant="ghost"
            size="md"
            sound="back"
            onPress={() => setStep(step - 1)}
          />
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  dots: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  dot: { width: 36, height: 12, borderRadius: 6 },
  center: { alignItems: 'center', gap: 12 },
  logo: { width: 230, height: 230 },
  title: { fontSize: 34, fontWeight: '900', textAlign: 'center' },
  sub: { fontSize: 18, textAlign: 'center', fontWeight: '600' },
  block: { gap: 20, marginTop: 10 },
  row: { flexDirection: 'row', gap: 12 },
  goal: { alignItems: 'center', paddingVertical: 28 },
  goalNumber: { fontSize: 52, fontWeight: '900' },
  goalUnit: { fontSize: 18, fontWeight: '800', marginTop: -4 },
  footer: { gap: 8, marginTop: 'auto' },
});
