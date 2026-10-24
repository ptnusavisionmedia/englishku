import { AppError } from '@/lib/api';
import { getDb } from '@/lib/database/db';
import type { UserProgressRow } from '@/lib/database/types';
import type { UserProgress } from '@/types';

export async function fetchProgress(userId: number): Promise<UserProgress[]> {
  const db = await getDb();
  return db.getAllAsync<UserProgressRow>('SELECT * FROM user_progress WHERE user_id = ?', [userId]);
}

export async function saveProgress(
  userId: number,
  lessonId: string,
  status: 'in_progress' | 'completed',
  score: number,
): Promise<UserProgress> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO user_progress (user_id, lesson_id, status, score, completed_at)
     VALUES (?, ?, ?, ?, CASE WHEN ? = 'completed' THEN CURRENT_TIMESTAMP ELSE NULL END)
     ON CONFLICT(user_id, lesson_id) DO UPDATE SET
       status = excluded.status,
       score = excluded.score,
       completed_at = excluded.completed_at,
       updated_at = CURRENT_TIMESTAMP`,
    [userId, lessonId, status, score, status],
  );
  const row = await db.getFirstAsync<UserProgressRow>(
    'SELECT * FROM user_progress WHERE user_id = ? AND lesson_id = ?',
    [userId, lessonId],
  );
  if (!row) throw new AppError('Progres belum tersimpan.');
  return row;
}
