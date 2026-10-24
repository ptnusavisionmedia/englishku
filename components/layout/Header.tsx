import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BrutalPressable } from '@/components/ui/Brutal';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';

type Props = { title: string; icon?: string; onBack?: () => void; right?: React.ReactNode };

export function Header({ title, icon, onBack, right }: Props) {
  const { colors } = useTheme();
  const router = useRouter();
  return (
    <View style={styles.row}>
      <BrutalPressable
        bg={colors.surface}
        radius={14}
        offset={3}
        hitSlop={8}
        accessibilityLabel="Kembali"
        sound="back"
        onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))}
        style={styles.back}
      >
        <Icon name="arrow-left" size={30} />
      </BrutalPressable>
      {icon ? <Icon name={icon} size={38} /> : null}
      <Text
        style={[styles.title, { color: colors.text }]}
        numberOfLines={1}
        accessibilityRole="header"
      >
        {title}
      </Text>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  back: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 26, fontWeight: '800' },
  right: { minWidth: 8, alignItems: 'flex-end' },
});
