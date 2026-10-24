import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { useTheme } from '@/hooks/useTheme';
import { playSound } from '@/lib/sounds';

const makeQuestion = () => {
  const a = 12 + Math.floor(Math.random() * 18);
  const b = 6 + Math.floor(Math.random() * 12);
  return { a, b, answer: a + b };
};

/** Simple adult check: a math question that is awkward for young children. */
export function ParentGate({ onPass, onCancel }: { onPass: () => void; onCancel: () => void }) {
  const { colors } = useTheme();
  const [question, setQuestion] = useState(makeQuestion);
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | undefined>();

  const submit = () => {
    if (Number(value.trim()) === question.answer) {
      playSound('correct');
      return onPass();
    }
    playSound('wrong');
    setError('Jawaban belum tepat. Coba soal baru.');
    setValue('');
    setQuestion(makeQuestion());
  };

  return (
    <View style={styles.center}>
      <Card style={styles.card}>
        <View style={styles.iconRow}>
          <Icon name="lock" size={64} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Khusus orang tua</Text>
        <Text style={[styles.question, { color: colors.text }]}>
          {question.a} + {question.b} = ?
        </Text>
        <TextField
          label="Jawaban"
          value={value}
          onChangeText={(t) => {
            setValue(t.replace(/[^0-9]/g, ''));
            setError(undefined);
          }}
          error={error}
          keyboardType="number-pad"
          maxLength={3}
          onSubmitEditing={submit}
        />
        <Button title="Masuk" onPress={submit} disabled={!value} size="md" />
        <Button title="Kembali" variant="ghost" onPress={onCancel} size="md" />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', padding: 20 },
  card: { gap: 14, alignItems: 'stretch' },
  iconRow: { alignItems: 'center' },
  title: { fontSize: 26, fontWeight: '800', textAlign: 'center' },
  question: { fontSize: 36, fontWeight: '900', textAlign: 'center' },
});
