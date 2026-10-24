import { getDb } from '@/lib/database/db';
import type { AchievementRow, UserAchievementRow } from '@/lib/database/types';
import type { Achievement, UserAchievement } from '@/types';

export async function fetchAchievements(): Promise<Achievement[]> {
  const db = await getDb();
  return db.getAllAsync<AchievementRow>('SELECT * FROM achievements ORDER BY rowid');
}

export async function fetchUserAchievements(userId: number): Promise<UserAchievement[]> {
  const db = await getDb();
  return db.getAllAsync<UserAchievementRow>('SELECT * FROM user_achievements WHERE user_id = ?', [
    userId,
  ]);
}

export async function unlockAchievements(
  userId: number,
  achievementIds: string[],
): Promise<UserAchievement[]> {
  if (achievementIds.length === 0) return [];
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    for (const id of achievementIds) {
      await db.runAsync(
        'INSERT OR IGNORE INTO user_achievements (user_id, achievement_id) VALUES (?, ?)',
        [userId, id],
      );
    }
  });
  return fetchUserAchievements(userId);
}
