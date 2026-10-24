import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';
import { playSound } from '@/lib/sounds';

type Props = {
  icon?: string;
  iconSize?: number;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  /** Extra content under the text (e.g. a progress bar). */
  children?: ReactNode;
  onPress?: () => void;
  /** No divider under the last row of a list. */
  last?: boolean;
  dim?: boolean;
  /** Soft tinted background, used for the one "recommended" row. */
  highlight?: boolean;
  accessibilityLabel?: string;
};

/** Flat list row with a hairline divider: the app's replacement for stacks of cards. */
export function Row({
  icon,
  iconSize = 48,
  title,
  subtitle,
  trailing,
  children,
  onPress,
  last,
  dim,
  highlight,
  accessibilityLabel,
}: Props) {
  const { colors } = useTheme();
  const content = (
    <>
      {icon ? <Icon name={icon} size={iconSize} /> : null}
      <View style={styles.body}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.sub, { color: colors.textMuted }]} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
        {children}
      </View>
      {trailing}
    </>
  );

  const style = [
    styles.row,
    !last && !highlight && { borderBottomWidth: 2, borderBottomColor: `${colors.shadow}55` },
    highlight && { backgroundColor: colors.tintYellow, borderRadius: 22, paddingHorizontal: 14 },
    dim && { opacity: 0.55 },
  ];

  if (!onPress) return <View style={style}>{content}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={() => {
        playSound('tap');
        onPress();
      }}
      style={({ pressed }) => [style, pressed && { opacity: 0.7 }]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  body: { flex: 1, gap: 1 },
  title: { fontSize: 20, fontWeight: '800' },
  sub: { fontSize: 15, fontWeight: '600' },
});
