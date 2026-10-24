import { AppError } from '@/lib/api';
import { generateSalt, hashPassword, verifyPassword } from '@/lib/auth/password';
import { clearSession, loadSession, saveSession } from '@/lib/auth/local-auth';
import { getDb } from '@/lib/database/db';
import type { UserRow } from '@/lib/database/types';
import type { AgeGroup, AppUser } from '@/types';

export type RegisterInput = {
  username: string;
  password: string;
  displayName: string;
  ageGroup: AgeGroup;
  avatar: string;
};

const toUser = (row: Pick<UserRow, 'id' | 'username'>): AppUser => ({
  id: row.id,
  username: row.username,
});

export async function registerUser(input: RegisterInput): Promise<AppUser> {
  const db = await getDb();
  const username = input.username.trim();

  const taken = await db.getFirstAsync<{ id: number }>('SELECT id FROM users WHERE username = ?', [
    username,
  ]);
  if (taken) throw new AppError('Username sudah digunakan.', 'username_taken');

  const salt = generateSalt();
  const hash = await hashPassword(input.password, salt);

  let userId = 0;
  try {
    await db.withTransactionAsync(async () => {
      const result = await db.runAsync(
        'INSERT INTO users (username, password_hash, password_salt) VALUES (?, ?, ?)',
        [username, hash, salt],
      );
      userId = result.lastInsertRowId;
      // daily_goal_minutes stays NULL until the child picks a goal in onboarding.
      await db.runAsync(
        `INSERT INTO profiles (user_id, display_name, age_group, avatar, daily_goal_minutes)
         VALUES (?, ?, ?, ?, NULL)`,
        [userId, input.displayName.trim(), input.ageGroup, input.avatar],
      );
    });
  } catch {
    // UNIQUE violation from a concurrent registration, or any other write failure.
    throw new AppError('Username sudah digunakan.', 'username_taken');
  }

  await saveSession(userId);
  return { id: userId, username };
}

export async function loginUser(usernameInput: string, password: string): Promise<AppUser> {
  const db = await getDb();
  const row = await db.getFirstAsync<UserRow>('SELECT * FROM users WHERE username = ?', [
    usernameInput.trim(),
  ]);
  // Same message for unknown user and wrong password, so usernames cannot be probed.
  if (!row || !(await verifyPassword(password, row.password_salt, row.password_hash))) {
    throw new AppError('Username atau password salah.', 'invalid_credentials');
  }
  await saveSession(row.id);
  return toUser(row);
}

export async function logoutUser(): Promise<void> {
  await clearSession();
}

/** Returns the remembered user, or null if nobody is signed in (or the account no longer exists). */
export async function restoreSession(): Promise<AppUser | null> {
  const id = await loadSession();
  if (id === null) return null;
  const db = await getDb();
  const row = await db.getFirstAsync<Pick<UserRow, 'id' | 'username'>>(
    'SELECT id, username FROM users WHERE id = ?',
    [id],
  );
  if (!row) {
    await clearSession();
    return null;
  }
  return toUser(row);
}
