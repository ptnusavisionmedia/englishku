import { AppError } from '@/lib/api';
import { getDb } from '@/lib/database/db';
import type { ProfileRow } from '@/lib/database/types';
import type { Profile, ProfileUpdate } from '@/types';

/** Reads the stored JSON list defensively; bad data simply means "nothing pinned". */
function parsePinned(raw: string | null): string[] {
  try {
    const value: unknown = JSON.parse(raw ?? '[]');
    return Array.isArray(value)
      ? value.filter((v): v is string => typeof v === 'string').slice(0, 3)
      : [];
  } catch {
    return [];
  }
}

const toProfile = (r: ProfileRow): Profile => ({
  id: r.user_id,
  display_name: r.display_name,
  age_group: r.age_group,
  avatar_url: r.avatar,
  pinned_badges: parsePinned(r.pinned_badges),
  daily_goal_minutes: r.daily_goal_minutes,
  total_stars: r.total_stars,
  current_streak: r.current_streak,
  last_active_date: r.last_active_date,
});

/** Fetch the profile; creates an empty one if the account somehow has none. */
export async function fetchProfile(userId: number): Promise<Profile> {
  const db = await getDb();
  let row = await db.getFirstAsync<ProfileRow>('SELECT * FROM profiles WHERE user_id = ?', [
    userId,
  ]);
  if (!row) {
    await db.runAsync(
      'INSERT OR IGNORE INTO profiles (user_id, daily_goal_minutes) VALUES (?, NULL)',
      [userId],
    );
    row = await db.getFirstAsync<ProfileRow>('SELECT * FROM profiles WHERE user_id = ?', [userId]);
  }
  if (!row) throw new AppError('Profil tidak ditemukan.');
  return toProfile(row);
}

// Only these columns may be updated; keys are mapped to real column names (never user input).
const COLUMNS: Record<keyof ProfileUpdate, string> = {
  display_name: 'display_name',
  age_group: 'age_group',
  avatar_url: 'avatar',
  pinned_badges: 'pinned_badges',
  daily_goal_minutes: 'daily_goal_minutes',
  total_stars: 'total_stars',
  current_streak: 'current_streak',
  last_active_date: 'last_active_date',
};

export async function updateProfile(userId: number, patch: ProfileUpdate): Promise<Profile> {
  const keys = (Object.keys(patch) as (keyof ProfileUpdate)[]).filter(
    (k) => k in COLUMNS && patch[k] !== undefined,
  );
  const db = await getDb();
  if (keys.length > 0) {
    const sets = keys.map((k) => `${COLUMNS[k]} = ?`).join(', ');
    await db.runAsync(
      `UPDATE profiles SET ${sets}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
      [
        ...keys.map((k) => {
          const value = patch[k];
          return (Array.isArray(value) ? JSON.stringify(value.slice(0, 3)) : value) as
            string | number | null;
        }),
        userId,
      ],
    );
  }
  return fetchProfile(userId);
}
