import { useMemo } from 'react';

import { lessonStatus } from '@/lib/learning';
import { useLearningStore } from '@/stores/learning.store';
import type { Category, Lesson, LessonStatus } from '@/types';

export type LessonItem = {
  lesson: Lesson;
  index: number;
  category?: Category;
  status: LessonStatus;
};

/** Lessons in path order with their category and current status for this child. */
export function useLessons() {
  const lessons = useLearningStore((s) => s.lessons);
  const categories = useLearningStore((s) => s.categories);
  const progress = useLearningStore((s) => s.progress);

  return useMemo(() => {
    const sorted = [...lessons].sort((a, b) => a.sort_order - b.sort_order);
    const items: LessonItem[] = sorted.map((lesson, index) => ({
      lesson,
      index,
      category: categories.find((c) => c.id === lesson.category_id),
      status: lessonStatus(lesson, sorted, progress),
    }));
    const recommended =
      items.find((i) => i.status === 'in_progress') ??
      items.find((i) => i.status === 'available') ??
      items[0];
    return { items, recommended };
  }, [lessons, categories, progress]);
}
