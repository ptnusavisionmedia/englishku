import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { useTheme } from '@/hooks/useTheme';
import { playSound } from '@/lib/sounds';
import { getErrorMessage } from '@/lib/api';
import { hasErrors, validateLocalLogin } from '@/lib/validation';
import { useAuthStore } from '@/stores/auth.store';

export function LoginForm() {
  const { colors } = useTheme();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<ReturnType<typeof validateLocalLogin>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const submit = async () => {
    const found = validateLocalLogin({ username, password });
    setErrors(found);
    setFormError(null);
    if (hasErrors(found)) return;
    try {
      await login(username, password);
    } catch (e) {
      playSound('wrong');
      setFormError(getErrorMessage(e));
    }
  };

  return (
    <View style={styles.form}>
      <TextField
        label="Username"
        value={username}
        onChangeText={setUsername}
        error={errors.username}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username"
        textContentType="username"
        placeholder="Username"
      />
      <TextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="current-password"
        textContentType="password"
        placeholder="Password"
        onSubmitEditing={submit}
      />
      {formError ? (
        <Text accessibilityRole="alert" style={[styles.error, { color: colors.dangerText }]}>
          {formError}
        </Text>
      ) : null}
      <Button title="Masuk" icon="play" onPress={submit} loading={isLoading} />
      <Text style={[styles.note, { color: colors.textMuted }]}>
        Lupa password? Akun tersimpan di HP ini dan password tidak dapat dipulihkan. Anda bisa
        membuat akun baru.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 16 },
  error: { fontSize: 16, fontWeight: '700' },
  note: { textAlign: 'center', fontSize: 14, fontWeight: '600' },
});
