export type AgeGroup = '4-6' | '7-10';
export type LessonStatus = 'locked' | 'available' | 'in_progress' | 'completed';
export type GameType =
  'word-match' | 'listen-choose' | 'find-word' | 'memory' | 'spelling' | 'quick-quiz';

/** The signed-in local account. Never contains the password or its hash. */
export type AppUser = { id: number; username: string };

/** Child profile. `id` is the owning user's id. */
export type Profile = {
  id: number;
  display_name: string | null;
  age_group: AgeGroup | null;
  /** Avatar key, e.g. "bear" (column `avatar` in SQLite). */
  avatar_url: string | null;
  /** Up to three achievement ids the child chose to show on the home screen. */
  pinned_badges: string[];
  daily_goal_minutes: number | null;
  total_stars: number;
  current_streak: number;
  last_active_date: string | null;
};

export type ProfileUpdate = Partial<Omit<Profile, 'id'>>;

export type Category = {
  id: string;
  name: string;
  description: string | null;
  emoji: string | null;
  sort_order: number;
  is_active: boolean;
};

export type Lesson = {
  id: string;
  category_id: string;
  title: string;
  description: string | null;
  age_group: string;
  level: number;
  sort_order: number;
  is_locked: boolean;
};

export type Vocabulary = {
  id: string;
  lesson_id: string;
  word: string;
  translation: string;
  example_sentence: string | null;
  emoji: string | null;
  image_url: string | null;
  audio_url: string | null;
  difficulty: number;
};

export type UserProgress = {
  id: number;
  user_id: number;
  lesson_id: string;
  status: string;
  score: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type UserVocabulary = {
  id: number;
  user_id: number;
  vocabulary_id: string;
  is_favorite: boolean;
  mastery_level: number;
  last_reviewed_at: string | null;
  created_at: string;
};

export type Achievement = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  requirement_type: string;
  requirement_value: number;
};

export type UserAchievement = {
  id: number;
  user_id: number;
  achievement_id: string;
  unlocked_at: string;
};

/** Result of a finished lesson or game, as reported by a game component. */
export type Outcome = { correct: number; total: number };
