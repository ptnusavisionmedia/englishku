import { STARS_PER_LEVEL } from '@/constants/content';
import { diffDays } from '@/lib/date';
import type {
  Achievement,
  Lesson,
  LessonStatus,
  Outcome,
  Profile,
  UserProgress,
  UserVocabulary,
} from '@/types';

export const levelFromStars = (stars: number) => 1 + Math.floor(stars / STARS_PER_LEVEL);

/** Progress (0..1) inside the current level. */
export const levelProgress = (stars: number) => (stars % STARS_PER_LEVEL) / STARS_PER_LEVEL;

/** Always at least one star so a child never leaves empty-handed. */
export function starsFor({ correct, total }: Outcome): 1 | 2 | 3 {
  const ratio = total > 0 ? correct / total : 1;
  if (ratio >= 0.8) return 3;
  if (ratio >= 0.5) return 2;
  return 1;
}

export function resultMessage(stars: number): { title: string; subtitle: string } {
  if (stars >= 3) return { title: 'Great job!', subtitle: 'Hebat sekali! Kamu keren!' };
  if (stars === 2) return { title: 'Well done!', subtitle: 'Bagus! Sedikit lagi sempurna.' };
  return { title: 'Good try!', subtitle: 'Terus semangat, ayo coba lagi!' };
}

export function lessonStatus(
  lesson: Lesson,
  sortedLessons: Lesson[],
  progress: Record<string, UserProgress>,
): LessonStatus {
  const own = progress[lesson.id];
  if (own?.status === 'completed') return 'completed';
  if (own?.status === 'in_progress') return 'in_progress';
  if (!lesson.is_locked) return 'available';
  const index = sortedLessons.findIndex((l) => l.id === lesson.id);
  const previous = index > 0 ? sortedLessons[index - 1] : undefined;
  return !previous || progress[previous.id]?.status === 'completed' ? 'available' : 'locked';
}

export function nextStreak(profile: Profile, today: string): number {
  const last = profile.last_active_date;
  if (last === today) return Math.max(profile.current_streak, 1);
  if (last && diffDays(last, today) === 1) return profile.current_streak + 1;
  return 1;
}

export type LearnerStats = {
  wordsLearned: number;
  lessonsCompleted: number;
  streak: number;
  stars: number;
  pronunciations: number;
  completedThemes: Set<string>;
};

export const countLearned = (userVocab: Record<string, UserVocabulary>) =>
  Object.values(userVocab).filter((v) => v.mastery_level >= 1).length;

/** requirement_type: words_learned | lessons_completed | streak_days | total_stars | pronunciations | category:<Theme> */
export function isAchievementMet(a: Achievement, s: LearnerStats): boolean {
  const need = a.requirement_value;
  if (a.requirement_type.startsWith('category:')) {
    return s.completedThemes.has(a.requirement_type.slice('category:'.length));
  }
  switch (a.requirement_type) {
    case 'words_learned':
      return s.wordsLearned >= need;
    case 'lessons_completed':
      return s.lessonsCompleted >= need;
    case 'streak_days':
      return s.streak >= need;
    case 'total_stars':
      return s.stars >= need;
    case 'pronunciations':
      return s.pronunciations >= need;
    default:
      return false;
  }
}

/** A child is set up once the name, age group, and daily goal are chosen. */
export const isOnboarded = (
  p: {
    display_name: string | null;
    age_group: string | null;
    daily_goal_minutes: number | null;
  } | null,
) => !!p?.display_name && !!p.age_group && !!p.daily_goal_minutes;
