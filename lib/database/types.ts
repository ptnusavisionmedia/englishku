/** Raw row shapes as stored in SQLite (booleans are 0/1, ids of user tables are integers). */
export type UserRow = {
  id: number;
  username: string;
  password_hash: string;
  password_salt: string;
  created_at: string;
  updated_at: string;
};

export type ProfileRow = {
  id: number;
  user_id: number;
  display_name: string | null;
  age_group: '4-6' | '7-10' | null;
  avatar: string | null;
  /** JSON array of achievement ids shown on the home screen. */
  pinned_badges: string;
  daily_goal_minutes: number | null;
  total_stars: number;
  current_streak: number;
  last_active_date: string | null;
  created_at: string;
  updated_at: string;
};

export type CategoryRow = {
  id: string;
  name: string;
  description: string | null;
  emoji: string | null;
  sort_order: number;
  is_active: number;
};

export type LessonRow = {
  id: string;
  category_id: string;
  title: string;
  description: string | null;
  age_group: string;
  level: number;
  sort_order: number;
  is_locked: number;
};

export type VocabularyRow = {
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

export type UserProgressRow = {
  id: number;
  user_id: number;
  lesson_id: string;
  status: string;
  score: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type UserVocabularyRow = {
  id: number;
  user_id: number;
  vocabulary_id: string;
  is_favorite: number;
  mastery_level: number;
  last_reviewed_at: string | null;
  created_at: string;
};

export type AchievementRow = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  requirement_type: string;
  requirement_value: number;
};

export type UserAchievementRow = {
  id: number;
  user_id: number;
  achievement_id: string;
  unlocked_at: string;
};
