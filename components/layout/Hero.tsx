import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/Icon';
import { Float } from '@/components/ui/Motion';
import { Text } from '@/components/ui/Text';
import { Wobble } from '@/components/ui/Wobble';
import { useTheme } from '@/hooks/useTheme';
import { darken } from '@/lib/color';

type Props = {
  color: 'blue' | 'orange' | 'green' | 'red';
  title?: string;
  subtitle?: string;
  /** Large illustration floating at the right of the title. */
  icon?: string;
  children?: ReactNode;
};

/**
 * Full-width glossy header at the top of a tab. It breaks out of the Screen padding, covers the
 * status bar area, has soft shine bubbles, rounded bottom corners and a darker candy bevel.
 * Use `<Screen edges={['left','right']}>`.
 */
export function Hero({ color, title, subtitle, icon, children }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const fill = colors[color];
  return (
    <View
      style={[
        styles.hero,
        {
          backgroundColor: fill,
          borderBottomColor: darken(fill, 0.22),
          paddingTop: insets.top + 16,
        },
      ]}
    >
      <View pointerEvents="none" style={[styles.blob, styles.blobA]} />
      <View pointerEvents="none" style={[styles.blob, styles.blobB]} />
      <View pointerEvents="none" style={styles.shine} />
      {title ? (
        <View style={styles.titleRow}>
          <View style={styles.flex}>
            <Text style={[styles.title, { color: colors.onBright }]} accessibilityRole="header">
              {title}
            </Text>
            {subtitle ? (
              <Text style={[styles.subtitle, { color: colors.onBright }]}>{subtitle}</Text>
            ) : null}
          </View>
          {icon ? (
            <Float distance={6}>
              <Wobble label="Gambar tema">
                <Icon name={icon} size={92} />
              </Wobble>
            </Float>
          ) : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginHorizontal: -20,
    marginTop: -20,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    borderBottomWidth: 7,
    gap: 14,
    overflow: 'hidden',
  },
  flex: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 40, fontWeight: '900' },
  subtitle: { fontSize: 17, fontWeight: '700' },
  blob: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 999 },
  blobA: { width: 190, height: 190, right: -60, top: -70 },
  blobB: { width: 120, height: 120, left: -40, bottom: -56 },
  shine: {
    position: 'absolute',
    top: 10,
    left: 28,
    width: 110,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.4)',
    transform: [{ rotate: '-8deg' }],
  },
});
