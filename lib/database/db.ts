import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import { runMigrations } from '@/lib/database/migrations';
import { seedDatabase } from '@/lib/database/seed';

export const DATABASE_NAME = 'englishku.db';

let ready: Promise<SQLiteDatabase> | null = null;

async function open(): Promise<SQLiteDatabase> {
  const db = await openDatabaseAsync(DATABASE_NAME);
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  await runMigrations(db);
  await seedDatabase(db);
  return db;
}

/**
 * Opens the local database, applies pending migrations, and seeds content. The same promise is
 * shared by every caller, so it is safe to call from anywhere. A failure is not cached, so
 * "Coba Lagi" can simply call it again.
 */
export function getDb(): Promise<SQLiteDatabase> {
  if (!ready) {
    ready = open().catch((error) => {
      ready = null;
      throw error;
    });
  }
  return ready;
}

/** Development helper: deletes ALL local data (users, progress) and recreates the database. */
export async function resetDatabaseForDevelopment(): Promise<void> {
  if (!__DEV__) throw new Error('Reset hanya tersedia di mode development.');
  const { deleteDatabaseAsync } = await import('expo-sqlite');
  if (ready) await (await ready).closeAsync();
  ready = null;
  await deleteDatabaseAsync(DATABASE_NAME);
  await getDb();
}
