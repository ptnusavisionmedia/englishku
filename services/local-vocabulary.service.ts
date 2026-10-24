import { getDb } from '@/lib/database/db';
import type { UserVocabularyRow, VocabularyRow } from '@/lib/database/types';
import type { UserVocabulary, Vocabulary } from '@/types';

const toUserVocab = (r: UserVocabularyRow): UserVocabulary => ({
  ...r,
  is_favorite: r.is_favorite === 1,
});

export async function fetchVocabulary(): Promise<Vocabulary[]> {
  const db = await getDb();
  return db.getAllAsync<VocabularyRow>(
    'SELECT v.* FROM vocabulary v JOIN lessons l ON l.id = v.lesson_id ORDER BY l.sort_order, v.rowid',
  );
}

export async function fetchUserVocabulary(userId: number): Promise<UserVocabulary[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<UserVocabularyRow>(
    'SELECT * FROM user_vocabulary WHERE user_id = ?',
    [userId],
  );
  return rows.map(toUserVocab);
}

export type UserVocabularyUpsert = {
  vocabulary_id: string;
  is_favorite?: boolean;
  mastery_level?: number;
};

/** Inserts or updates only the fields provided; the other fields keep their stored value. */
export async function upsertUserVocabulary(
  userId: number,
  rows: UserVocabularyUpsert[],
): Promise<UserVocabulary[]> {
  if (rows.length === 0) return [];
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    for (const r of rows) {
      await db.runAsync(
        `INSERT INTO user_vocabulary (user_id, vocabulary_id, is_favorite, mastery_level, last_reviewed_at)
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(user_id, vocabulary_id) DO UPDATE SET
           is_favorite = CASE WHEN ? THEN excluded.is_favorite ELSE user_vocabulary.is_favorite END,
           mastery_level = CASE WHEN ? THEN excluded.mastery_level ELSE user_vocabulary.mastery_level END,
           last_reviewed_at = CURRENT_TIMESTAMP`,
        [
          userId,
          r.vocabulary_id,
          r.is_favorite ? 1 : 0,
          r.mastery_level ?? 0,
          r.is_favorite === undefined ? 0 : 1,
          r.mastery_level === undefined ? 0 : 1,
        ],
      );
    }
  });
  const placeholders = rows.map(() => '?').join(',');
  const saved = await db.getAllAsync<UserVocabularyRow>(
    `SELECT * FROM user_vocabulary WHERE user_id = ? AND vocabulary_id IN (${placeholders})`,
    [userId, ...rows.map((r) => r.vocabulary_id)],
  );
  return saved.map(toUserVocab);
}
