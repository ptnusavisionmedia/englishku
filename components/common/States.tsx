import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Float } from '@/components/ui/Motion';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';

export function LoadingState({ label = 'Memuat…' }: { label?: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.center} accessibilityLabel={label} accessibilityRole="progressbar">
      <Float distance={8}>
        <Icon name="book" size={84} />
      </Float>
      <Text style={[styles.sub, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

export function EmptyState({
  title,
  description,
  icon = 'question',
  actionLabel,
  onAction,
}: {
  title: string;
  description?: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.center}>
      <Icon name={icon} size={84} />
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {description ? (
        <Text style={[styles.sub, { color: colors.textMuted }]}>{description}</Text>
      ) : null}
      {actionLabel && onAction ? <Button title={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}

export function ErrorState({
  message,
  detail,
  title = 'Ups!',
  retryLabel = 'Coba lagi',
  onRetry,
}: {
  message: string;
  detail?: string;
  title?: string;
  retryLabel?: string;
  onRetry?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.center} accessibilityRole="alert">
      <Icon name="question" size={84} />
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.sub, { color: colors.textMuted }]}>{message}</Text>
      {detail ? <Text style={[styles.detail, { color: colors.textMuted }]}>{detail}</Text> : null}
      {onRetry ? <Button title={retryLabel} variant="blue" onPress={onRetry} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  title: { fontSize: 26, fontWeight: '800', textAlign: 'center' },
  sub: { fontSize: 17, textAlign: 'center', fontWeight: '600' },
  detail: { fontSize: 12, textAlign: 'center', opacity: 0.8 },
});
