import type { SQLiteDatabase } from 'expo-sqlite';

import { achievements, themes } from '@/lib/database/content';

/**
 * Bump this when lib/database/content.ts changes. The curriculum is upserted by id, so existing
 * rows are updated in place and never duplicated; user data is never touched.
 */
export const CONTENT_VERSION = '1';

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

async function seedContent(db: SQLiteDatabase) {
  await db.withTransactionAsync(async () => {
    for (const [i, t] of themes.entries()) {
      const categoryId = `cat-${slug(t.name)}`;
      const lessonId = `lesson-${slug(t.name)}`;
      await db.runAsync(
        `INSERT INTO categories (id, name, description, emoji, sort_order, is_active)
         VALUES (?, ?, ?, ?, ?, 1)
         ON CONFLICT(id) DO UPDATE SET name = excluded.name, description = excluded.description,
           emoji = excluded.emoji, sort_order = excluded.sort_order`,
        [categoryId, t.name, t.description, t.emoji, i + 1],
      );
      // First 5 lessons are free; the rest unlock after the previous lesson is completed.
      await db.runAsync(
        `INSERT INTO lessons (id, category_id, title, description, age_group, level, sort_order, is_locked)
         VALUES (?, ?, ?, ?, 'all', ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET title = excluded.title, description = excluded.description,
           level = excluded.level, sort_order = excluded.sort_order, is_locked = excluded.is_locked`,
        [
          lessonId,
          categoryId,
          t.lesson,
          t.description,
          Math.floor(i / 5) + 1,
          i + 1,
          i >= 5 ? 1 : 0,
        ],
      );
      for (const [word, translation, example, emoji, difficulty] of t.words) {
        await db.runAsync(
          `INSERT INTO vocabulary (id, lesson_id, word, translation, example_sentence, emoji, difficulty)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET word = excluded.word, translation = excluded.translation,
             example_sentence = excluded.example_sentence, emoji = excluded.emoji,
             difficulty = excluded.difficulty`,
          [
            `vocab-${slug(t.name)}-${slug(word)}`,
            lessonId,
            word,
            translation,
            example,
            emoji,
            difficulty,
          ],
        );
      }
    }
    for (const [name, description, icon, type, value] of achievements) {
      await db.runAsync(
        `INSERT INTO achievements (id, name, description, icon, requirement_type, requirement_value)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET name = excluded.name, description = excluded.description,
           icon = excluded.icon, requirement_type = excluded.requirement_type,
           requirement_value = excluded.requirement_value`,
        [`ach-${slug(name)}`, name, description, icon, type, value],
      );
    }
    await db.runAsync(
      `INSERT INTO app_meta (key, value) VALUES ('content_version', ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      [CONTENT_VERSION],
    );
  });
}

/** Idempotent: content is seeded only when the bundled version changed. */
export async function seedDatabase(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM app_meta WHERE key = 'content_version'",
  );
  if (row?.value !== CONTENT_VERSION) await seedContent(db);
}
