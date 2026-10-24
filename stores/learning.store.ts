import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { getErrorMessage, withTimeout } from '@/lib/api';
import { dateKey } from '@/lib/date';
import {
  countLearned,
  isAchievementMet,
  nextStreak,
  starsFor,
  type LearnerStats,
} from '@/lib/learning';
import * as achievementService from '@/services/local-achievement.service';
import * as lessonService from '@/services/local-lesson.service';
import * as profileService from '@/services/local-profile.service';
import * as progressService from '@/services/local-progress.service';
import * as vocabularyService from '@/services/local-vocabulary.service';
import type {
  Achievement,
  Category,
  Lesson,
  Outcome,
  Profile,
  ProfileUpdate,
  UserProgress,
  UserVocabulary,
  Vocabulary,
} from '@/types';

type Activity = Record<string, { seconds: number }>;

type LearningState = {
  ownerId: number | null;
  profile: Profile | null;
  categories: Category[];
  lessons: Lesson[];
  vocabulary: Vocabulary[];
  progress: Record<string, UserProgress>;
  userVocab: Record<string, UserVocabulary>;
  achievements: Achievement[];
  /** achievement id -> unlocked_at */
  unlocked: Record<string, string>;
  /** Study seconds per day. Kept on this device only. */
  activity: Activity;
  pronunciations: number;
  newBadges: Achievement[];
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
  syncError: string | null;

  load: (userId: number) => Promise<void>;
  reset: () => void;
  updateProfile: (patch: ProfileUpdate) => Promise<void>;
  toggleFavorite: (vocabularyId: string) => Promise<void>;
  setMastery: (vocabularyId: string, level: number) => Promise<void>;
  markSeen: (vocabularyIds: string[]) => Promise<void>;
  startLesson: (lessonId: string) => Promise<void>;
  finishLesson: (lessonId: string, outcome: Outcome) => Promise<number>;
  finishGame: (outcome: Outcome) => Promise<number>;
  recordActivity: (seconds: number) => void;
  recordPronunciation: () => Promise<void>;
  clearNewBadges: () => void;
  /** Pin or unpin an earned badge for the home screen. 'full' means three are already pinned. */
  togglePinnedBadge: (achievementId: string) => Promise<'pinned' | 'unpinned' | 'full' | 'locked'>;
  /** Replace the pinned badges (only earned ones, no duplicates, max 3). */
  setPinnedBadges: (ids: string[]) => Promise<void>;
};

const empty = {
  profile: null,
  categories: [],
  lessons: [],
  vocabulary: [],
  progress: {},
  userVocab: {},
  achievements: [],
  unlocked: {},
  newBadges: [],
  isLoading: false,
  isLoaded: false,
  error: null,
  syncError: null,
} satisfies Partial<LearningState>;

const byId = <T extends { id: string }>(rows: T[]) =>
  Object.fromEntries(rows.map((r) => [r.id, r])) as Record<string, T>;

export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => {
      const userId = () => get().profile?.id ?? get().ownerId;

      /** Persist a change in the background; show a gentle notice if it could not be saved. */
      const sync = async (task: () => Promise<unknown>) => {
        try {
          await task();
          set({ syncError: null });
        } catch (e) {
          set({ syncError: getErrorMessage(e) });
        }
      };

      const stats = (): LearnerStats => {
        const s = get();
        const completed = Object.values(s.progress).filter((p) => p.status === 'completed');
        const themes = new Set<string>();
        for (const p of completed) {
          const lesson = s.lessons.find((l) => l.id === p.lesson_id);
          const cat = s.categories.find((c) => c.id === lesson?.category_id);
          if (cat) themes.add(cat.name);
        }
        return {
          wordsLearned: countLearned(s.userVocab),
          lessonsCompleted: completed.length,
          streak: s.profile?.current_streak ?? 0,
          stars: s.profile?.total_stars ?? 0,
          pronunciations: s.pronunciations,
          completedThemes: themes,
        };
      };

      const checkAchievements = async () => {
        const s = get();
        const uid = userId();
        if (!uid) return;
        const current = stats();
        const fresh = s.achievements.filter(
          (a) => !s.unlocked[a.id] && isAchievementMet(a, current),
        );
        if (fresh.length === 0) return;
        const now = new Date().toISOString();
        set((st) => ({
          unlocked: { ...st.unlocked, ...Object.fromEntries(fresh.map((a) => [a.id, now])) },
          newBadges: [...st.newBadges, ...fresh],
        }));
        await sync(() =>
          achievementService.unlockAchievements(
            uid,
            fresh.map((a) => a.id),
          ),
        );
      };

      /** Add stars and keep the daily streak going. */
      const reward = async (stars: number) => {
        const profile = get().profile;
        if (!profile) return;
        const patch = {
          total_stars: profile.total_stars + stars,
          current_streak: nextStreak(profile, dateKey()),
          last_active_date: dateKey(),
        };
        set({ profile: { ...profile, ...patch } });
        await sync(() => profileService.updateProfile(profile.id, patch));
      };

      return {
        ownerId: null,
        activity: {},
        pronunciations: 0,
        ...empty,

        load: async (uid) => {
          if (get().ownerId !== uid) {
            set({ ...empty, ownerId: uid, activity: {}, pronunciations: 0 });
          }
          set({ isLoading: true, error: null });
          try {
            const [
              profile,
              categories,
              lessons,
              vocabulary,
              progress,
              userVocab,
              achievements,
              ua,
            ] = await withTimeout(
              Promise.all([
                profileService.fetchProfile(uid),
                lessonService.fetchCategories(),
                lessonService.fetchLessons(),
                vocabularyService.fetchVocabulary(),
                progressService.fetchProgress(uid),
                vocabularyService.fetchUserVocabulary(uid),
                achievementService.fetchAchievements(),
                achievementService.fetchUserAchievements(uid),
              ]),
              15000,
              'Koneksi terlalu lambat. Periksa internet lalu coba lagi.',
            );
            set({
              ownerId: uid,
              profile,
              categories,
              lessons,
              vocabulary,
              progress: Object.fromEntries(progress.map((p) => [p.lesson_id, p])),
              userVocab: Object.fromEntries(userVocab.map((v) => [v.vocabulary_id, v])),
              achievements,
              unlocked: Object.fromEntries(ua.map((a) => [a.achievement_id, a.unlocked_at])),
              isLoaded: true,
            });
          } catch (e) {
            set({ error: getErrorMessage(e) });
          } finally {
            set({ isLoading: false });
          }
        },

        reset: () => set({ ...empty, ownerId: null, activity: {}, pronunciations: 0 }),

        updateProfile: async (patch) => {
          const profile = get().profile;
          if (!profile) return;
          set({ profile: { ...profile, ...patch } });
          await sync(() => profileService.updateProfile(profile.id, patch));
        },

        toggleFavorite: async (vocabularyId) => {
          const uid = userId();
          if (!uid) return;
          const existing = get().userVocab[vocabularyId];
          const is_favorite = !existing?.is_favorite;
          set((s) => ({
            userVocab: {
              ...s.userVocab,
              [vocabularyId]: {
                id: existing?.id ?? 0,
                user_id: uid,
                vocabulary_id: vocabularyId,
                mastery_level: existing?.mastery_level ?? 0,
                last_reviewed_at: existing?.last_reviewed_at ?? null,
                created_at: existing?.created_at ?? new Date().toISOString(),
                is_favorite,
              },
            },
          }));
          await sync(async () => {
            const [row] = await vocabularyService.upsertUserVocabulary(uid, [
              { vocabulary_id: vocabularyId, is_favorite },
            ]);
            if (row) set((s) => ({ userVocab: { ...s.userVocab, [vocabularyId]: row } }));
          });
        },

        setMastery: async (vocabularyId, level) => {
          const uid = userId();
          if (!uid) return;
          const existing = get().userVocab[vocabularyId];
          if ((existing?.mastery_level ?? 0) >= level) return;
          set((s) => ({
            userVocab: {
              ...s.userVocab,
              [vocabularyId]: {
                id: existing?.id ?? 0,
                user_id: uid,
                vocabulary_id: vocabularyId,
                is_favorite: existing?.is_favorite ?? false,
                last_reviewed_at: new Date().toISOString(),
                created_at: existing?.created_at ?? new Date().toISOString(),
                mastery_level: level,
              },
            },
          }));
          await sync(async () => {
            const [row] = await vocabularyService.upsertUserVocabulary(uid, [
              { vocabulary_id: vocabularyId, mastery_level: level },
            ]);
            if (row) set((s) => ({ userVocab: { ...s.userVocab, [vocabularyId]: row } }));
          });
          await checkAchievements();
        },

        markSeen: async (ids) => {
          const uid = userId();
          if (!uid) return;
          const unseen = ids.filter((id) => (get().userVocab[id]?.mastery_level ?? 0) < 1);
          if (unseen.length === 0) return;
          const now = new Date().toISOString();
          set((s) => {
            const next = { ...s.userVocab };
            for (const id of unseen) {
              const e = next[id];
              next[id] = {
                id: e?.id ?? 0,
                user_id: uid,
                vocabulary_id: id,
                is_favorite: e?.is_favorite ?? false,
                created_at: e?.created_at ?? now,
                last_reviewed_at: now,
                mastery_level: 1,
              };
            }
            return { userVocab: next };
          });
          await sync(async () => {
            const rows = await vocabularyService.upsertUserVocabulary(
              uid,
              unseen.map((id) => ({ vocabulary_id: id, mastery_level: 1 })),
            );
            set((s) => ({
              userVocab: {
                ...s.userVocab,
                ...Object.fromEntries(rows.map((r) => [r.vocabulary_id, r])),
              },
            }));
          });
          await checkAchievements();
        },

        startLesson: async (lessonId) => {
          const uid = userId();
          if (!uid || get().progress[lessonId]) return;
          await sync(async () => {
            const row = await progressService.saveProgress(uid, lessonId, 'in_progress', 0);
            set((s) => ({ progress: { ...s.progress, [lessonId]: row } }));
          });
        },

        finishLesson: async (lessonId, outcome) => {
          const uid = userId();
          const before = get().progress[lessonId];
          const first = before?.status !== 'completed';
          const stars = first ? starsFor(outcome) : 1;
          const score = Math.round((100 * outcome.correct) / Math.max(outcome.total, 1));
          if (uid) {
            const best = Math.max(score, before?.score ?? 0);
            set((s) => ({
              progress: {
                ...s.progress,
                [lessonId]: {
                  id: before?.id ?? 0,
                  user_id: uid,
                  lesson_id: lessonId,
                  status: 'completed',
                  score: best,
                  completed_at: new Date().toISOString(),
                  created_at: before?.created_at ?? new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
              },
            }));
            await sync(async () => {
              const row = await progressService.saveProgress(uid, lessonId, 'completed', best);
              set((s) => ({ progress: { ...s.progress, [lessonId]: row } }));
            });
          }
          await reward(stars);
          await checkAchievements();
          return stars;
        },

        finishGame: async (outcome) => {
          const stars = starsFor(outcome);
          await reward(stars);
          await checkAchievements();
          return stars;
        },

        recordActivity: (seconds) => {
          if (seconds <= 0) return;
          const key = dateKey();
          set((s) => ({
            activity: {
              ...s.activity,
              [key]: { seconds: (s.activity[key]?.seconds ?? 0) + Math.min(seconds, 1800) },
            },
          }));
        },

        recordPronunciation: async () => {
          set((s) => ({ pronunciations: s.pronunciations + 1 }));
          await checkAchievements();
        },

        clearNewBadges: () => set({ newBadges: [] }),

        togglePinnedBadge: async (achievementId) => {
          const { profile, unlocked } = get();
          if (!profile || !unlocked[achievementId]) return 'locked';
          const current = profile.pinned_badges;
          if (current.includes(achievementId)) {
            await get().updateProfile({
              pinned_badges: current.filter((id) => id !== achievementId),
            });
            return 'unpinned';
          }
          if (current.length >= 3) return 'full';
          await get().updateProfile({ pinned_badges: [...current, achievementId] });
          return 'pinned';
        },

        setPinnedBadges: async (ids) => {
          const { unlocked } = get();
          const next = [...new Set(ids)].filter((id) => unlocked[id]).slice(0, 3);
          await get().updateProfile({ pinned_badges: next });
        },
      };
    },
    {
      name: 'englishku-learning',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        ownerId: s.ownerId,
        activity: s.activity,
        pronunciations: s.pronunciations,
      }),
    },
  ),
);

export { byId };
