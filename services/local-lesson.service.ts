import { getDb } from '@/lib/database/db';
import type { CategoryRow, LessonRow } from '@/lib/database/types';
import type { Category, Lesson } from '@/types';

export async function fetchCategories(): Promise<Category[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<CategoryRow>(
    'SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order',
  );
  return rows.map((r) => ({ ...r, is_active: r.is_active === 1 }));
}

export async function fetchLessons(): Promise<Lesson[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<LessonRow>('SELECT * FROM lessons ORDER BY sort_order');
  return rows.map((r) => ({ ...r, is_locked: r.is_locked === 1 }));
}
