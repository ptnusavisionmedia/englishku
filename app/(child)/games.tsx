import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Hero } from '@/components/layout/Hero';
import { Screen } from '@/components/layout/Screen';
import { BrutalPressable } from '@/components/ui/Brutal';
import { Icon } from '@/components/ui/Icon';
import { FadeInUp } from '@/components/ui/Motion';
import { Text } from '@/components/ui/Text';
import { GAMES } from '@/constants/content';
import { TINT_SOLID } from '@/constants/theme';
import { useStudyGuard } from '@/hooks/useStudy';
import { useTheme } from '@/hooks/useTheme';

export default function GamesScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { guard } = useStudyGuard();

  return (
    <Screen edges={['left', 'right']}>
      <Hero color="green" title="Ayo Bermain!" subtitle="Pilih satu permainan" icon="gamepad" />
      <View style={styles.grid}>
        {GAMES.map((g, i) => (
          <FadeInUp key={g.type} delay={i * 70} style={styles.cell}>
            <BrutalPressable
              bg={colors[TINT_SOLID[g.tint]]}
              radius={30}
              offset={7}
              sound="pop"
              accessibilityLabel={`${g.title}. ${g.instruction}`}
              onPress={() =>
                guard(() => router.push({ pathname: '/game/[type]', params: { type: g.type } }))
              }
              style={styles.tile}
            >
              <Icon name={g.icon} size={96} />
              <Text style={[styles.name, { color: colors.onBright }]}>{g.title}</Text>
              <Text style={[styles.sub, { color: colors.onBright }]}>{g.instruction}</Text>
            </BrutalPressable>
          </FadeInUp>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cell: { flexBasis: '47%', flexGrow: 1 },
  tile: { alignItems: 'center', gap: 4, minHeight: 210, justifyContent: 'center', padding: 14 },
  name: { fontSize: 21, fontWeight: '800', textAlign: 'center' },
  sub: { fontSize: 14, textAlign: 'center', fontWeight: '700' },
});
