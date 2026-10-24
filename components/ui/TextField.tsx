import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Brutal } from '@/components/ui/Brutal';
import { Text } from '@/components/ui/Text';
import { fonts } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

type Props = TextInputProps & {
  label: string;
  error?: string;
};

export function TextField({ label, error, style, multiline, ...rest }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <Brutal
        offset={3}
        radius={14}
        bg={colors.surface}
        borderColor={error ? colors.red : colors.border}
      >
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={colors.textMuted}
          multiline={multiline}
          style={[
            styles.input,
            multiline && styles.multiline,
            { color: colors.text, fontFamily: fonts.semi },
            style,
          ]}
          {...rest}
        />
      </Brutal>
      {error ? (
        <Text accessibilityRole="alert" style={[styles.error, { color: colors.dangerText }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: { fontSize: 15, fontWeight: '800' },
  input: { minHeight: 50, paddingHorizontal: 14, fontSize: 18 },
  multiline: { minHeight: 140, paddingTop: 12, textAlignVertical: 'top' },
  error: { fontSize: 14, fontWeight: '700' },
});
