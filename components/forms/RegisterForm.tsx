import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BrutalPressable } from '@/components/ui/Brutal';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { AVATARS } from '@/constants/content';
import { useTheme } from '@/hooks/useTheme';
import { playSound } from '@/lib/sounds';
import { getErrorMessage } from '@/lib/api';
import { avatarIcon } from '@/lib/icons';
import { hasErrors, validateLocalRegister } from '@/lib/validation';
import { useAuthStore } from '@/stores/auth.store';
import type { AgeGroup } from '@/types';

const AGES: { key: AgeGroup; label: string }[] = [
  { key: '4-6', label: '4–6 tahun' },
  { key: '7-10', label: '7–10 tahun' },
];

export function RegisterForm() {
  const { colors } = useTheme();
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [values, setValues] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null);
  const [avatar, setAvatar] = useState('bear');
  const [errors, setErrors] = useState<ReturnType<typeof validateLocalRegister>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const set = (key: keyof typeof values) => (text: string) =>
    setValues((v) => ({ ...v, [key]: text }));

  const submit = async () => {
    const found = validateLocalRegister({ ...values, ageGroup });
    setErrors(found);
    setFormError(null);
    if (hasErrors(found) || !ageGroup) return;
    try {
      await register({
        username: values.username,
        password: values.password,
        displayName: values.displayName,
        ageGroup,
        avatar,
      });
    } catch (e) {
      playSound('wrong');
      setFormError(getErrorMessage(e));
    }
  };

  return (
    <View style={styles.form}>
      <TextField
        label="Username"
        value={values.username}
        onChangeText={set('username')}
        error={errors.username}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username-new"
        textContentType="username"
        placeholder="Huruf, angka, _ dan ."
      />
      <TextField
        label="Password"
        value={values.password}
        onChangeText={set('password')}
        error={errors.password}
        secureTextEntry
        autoCapitalize="none"
        textContentType="newPassword"
        placeholder="Minimal 6 karakter"
      />
      <TextField
        label="Konfirmasi password"
        value={values.confirmPassword}
        onChangeText={set('confirmPassword')}
        error={errors.confirmPassword}
        secureTextEntry
        autoCapitalize="none"
        textContentType="newPassword"
        placeholder="Ulangi password"
      />
      <TextField
        label="Nama panggilan anak"
        value={values.displayName}
        onChangeText={set('displayName')}
        error={errors.displayName}
        maxLength={30}
        placeholder="Contoh: Budi"
        onSubmitEditing={submit}
      />

      <View style={styles.group}>
        <Text style={[styles.label, { color: colors.text }]}>Usia</Text>
        <View style={styles.row}>
          {AGES.map((a) => {
            const active = ageGroup === a.key;
            return (
              <BrutalPressable
                key={a.key}
                bg={active ? colors.orange : colors.surface}
                radius={14}
                offset={3}
                accessibilityLabel={a.label}
                accessibilityState={{ selected: active }}
                onPress={() => setAgeGroup(a.key)}
                containerStyle={styles.flex}
                style={styles.choice}
              >
                <Text
                  style={[styles.choiceText, { color: active ? colors.onBright : colors.text }]}
                >
                  {a.label}
                </Text>
              </BrutalPressable>
            );
          })}
        </View>
        {errors.ageGroup ? (
          <Text accessibilityRole="alert" style={[styles.error, { color: colors.dangerText }]}>
            {errors.ageGroup}
          </Text>
        ) : null}
      </View>

      <View style={styles.group}>
        <Text style={[styles.label, { color: colors.text }]}>Pilih avatar</Text>
        <View style={styles.row}>
          {AVATARS.filter((a) => a.unlockStars === 0).map((a) => (
            <BrutalPressable
              key={a.key}
              bg={avatar === a.key ? colors.orange : colors.surface}
              radius={32}
              offset={3}
              accessibilityLabel={`Avatar ${a.key}`}
              accessibilityState={{ selected: avatar === a.key }}
              onPress={() => setAvatar(a.key)}
              style={styles.avatar}
            >
              <Icon name={avatarIcon(a.key)} size={54} />
            </BrutalPressable>
          ))}
        </View>
      </View>

      {formError ? (
        <Text accessibilityRole="alert" style={[styles.error, { color: colors.dangerText }]}>
          {formError}
        </Text>
      ) : null}
      <Button title="Buat Akun" icon="rocket" onPress={submit} loading={isLoading} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 16 },
  flex: { flex: 1 },
  group: { gap: 8 },
  label: { fontSize: 15, fontWeight: '800' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  choice: { alignItems: 'center', padding: 14 },
  choiceText: { fontSize: 19, fontWeight: '800' },
  avatar: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center' },
  error: { fontSize: 15, fontWeight: '700' },
});
