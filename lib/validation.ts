export type FieldErrors<T extends string> = Partial<Record<T, string>>;

export function validateChildName(name: string): string | undefined {
  const value = name.trim();
  if (!value) return 'Tulis nama panggilan dulu ya.';
  if (value.length > 30) return 'Nama terlalu panjang.';
}

export const hasErrors = (errors: object) => Object.keys(errors).length > 0;

export function validateUsername(username: string): string | undefined {
  const value = username.trim();
  if (!value) return 'Username wajib diisi.';
  if (value.length < 3) return 'Username terlalu pendek (minimal 3 karakter).';
  if (value.length > 30) return 'Username terlalu panjang.';
  if (!/^[A-Za-z0-9_.]+$/.test(value)) {
    return 'Username hanya boleh huruf, angka, garis bawah (_), dan titik (.).';
  }
}

export function validateLocalPassword(password: string): string | undefined {
  if (!password) return 'Password wajib diisi.';
  if (password.length < 6) return 'Password terlalu pendek (minimal 6 karakter).';
}

export function validateLocalLogin(v: { username: string; password: string }) {
  const errors: FieldErrors<'username' | 'password'> = {};
  if (!v.username.trim()) errors.username = 'Username wajib diisi.';
  if (!v.password) errors.password = 'Password wajib diisi.';
  return errors;
}

export function validateLocalRegister(v: {
  username: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  ageGroup: string | null;
}) {
  const errors: FieldErrors<
    'username' | 'password' | 'confirmPassword' | 'displayName' | 'ageGroup'
  > = {};
  const username = validateUsername(v.username);
  const password = validateLocalPassword(v.password);
  const name = validateChildName(v.displayName);
  if (username) errors.username = username;
  if (password) errors.password = password;
  if (!password && v.password !== v.confirmPassword) {
    errors.confirmPassword = 'Konfirmasi password tidak sama.';
  }
  if (!v.confirmPassword && !errors.confirmPassword) errors.confirmPassword = 'Field wajib diisi.';
  if (name) errors.displayName = name;
  if (!v.ageGroup) errors.ageGroup = 'Pilih kelompok usia.';
  return errors;
}
