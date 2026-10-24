import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Local session: only the numeric user id is stored. The password (or its hash) is never kept
 * in AsyncStorage.
 */
const SESSION_KEY = 'englishku.session.userId';

export async function saveSession(userId: number): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, String(userId));
}

export async function loadSession(): Promise<number | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  const id = raw ? Number(raw) : NaN;
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}
