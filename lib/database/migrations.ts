import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Versioned schema migrations, tracked with `PRAGMA user_version`.
 *
 * Rules:
 *  - Never edit a migration that has shipped. Add a new one at the end of the list.
 *  - Never DROP user tables. Use `ALTER TABLE ... ADD COLUMN` or copy-then-rename in a new migration.
 *  - Each migration runs once, in order, inside a transaction. The local database survives EAS Updates.
 */
type Migration = { version: number; up: (db: SQLiteDatabase) => Promise<void> };

const migrations: Migration[] = [
  {
    version: 1,
    up: async (db) => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE COLLATE NOCASE,
          password_hash TEXT NOT NULL,
          password_salt TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS profiles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL UNIQUE,
          display_name TEXT,
          age_group TEXT CHECK (age_group IN ('4-6', '7-10')),
          avatar TEXT,
          daily_goal_minutes INTEGER DEFAULT 5,
          total_stars INTEGER NOT NULL DEFAULT 0,
          current_streak INTEGER NOT NULL DEFAULT 0,
          last_active_date TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS categories (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          emoji TEXT,
          sort_order INTEGER NOT NULL DEFAULT 0,
          is_active INTEGER NOT NULL DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS lessons (
          id TEXT PRIMARY KEY NOT NULL,
          category_id TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          age_group TEXT NOT NULL DEFAULT 'all',
          level INTEGER NOT NULL DEFAULT 1,
          sort_order INTEGER NOT NULL DEFAULT 0,
          is_locked INTEGER NOT NULL DEFAULT 0,
          FOREIGN KEY (category_id) REFERENCES categories(id)
        );

        CREATE TABLE IF NOT EXISTS vocabulary (
          id TEXT PRIMARY KEY NOT NULL,
          lesson_id TEXT NOT NULL,
          word TEXT NOT NULL,
          translation TEXT NOT NULL,
          example_sentence TEXT,
          emoji TEXT,
          image_url TEXT,
          audio_url TEXT,
          difficulty INTEGER NOT NULL DEFAULT 1,
          FOREIGN KEY (lesson_id) REFERENCES lessons(id)
        );

        CREATE TABLE IF NOT EXISTS user_progress (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          lesson_id TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'in_progress',
          score INTEGER NOT NULL DEFAULT 0,
          completed_at TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          UNIQUE (user_id, lesson_id),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS user_vocabulary (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          vocabulary_id TEXT NOT NULL,
          is_favorite INTEGER NOT NULL DEFAULT 0,
          mastery_level INTEGER NOT NULL DEFAULT 0,
          last_reviewed_at TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          UNIQUE (user_id, vocabulary_id),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (vocabulary_id) REFERENCES vocabulary(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS achievements (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          icon TEXT,
          requirement_type TEXT NOT NULL,
          requirement_value INTEGER NOT NULL DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS user_achievements (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          achievement_id TEXT NOT NULL,
          unlocked_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          UNIQUE (user_id, achievement_id),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
        );

        -- Remembers which version of the bundled curriculum was last seeded.
        CREATE TABLE IF NOT EXISTS app_meta (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_lessons_sort ON lessons (sort_order);
        CREATE INDEX IF NOT EXISTS idx_vocabulary_lesson ON vocabulary (lesson_id);
        CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress (user_id);
        CREATE INDEX IF NOT EXISTS idx_user_vocabulary_user ON user_vocabulary (user_id);
      `);
    },
  },
  {
    // The three badges a child shows on the home screen, stored as a JSON array of achievement ids.
    version: 2,
    up: async (db) => {
      await db.execAsync(
        "ALTER TABLE profiles ADD COLUMN pinned_badges TEXT NOT NULL DEFAULT '[]';",
      );
    },
  },
];

export const LATEST_SCHEMA_VERSION = migrations[migrations.length - 1]!.version;

/** Applies every migration newer than the database's `user_version`. Safe to call on every launch. */
export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const current = row?.user_version ?? 0;

  for (const migration of migrations) {
    if (migration.version <= current) continue;
    await db.withTransactionAsync(async () => {
      await migration.up(db);
      // PRAGMA does not accept bound parameters; the value is a trusted integer constant.
      await db.execAsync(`PRAGMA user_version = ${migration.version}`);
    });
  }
}
