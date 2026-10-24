import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';

import { dateKey } from '@/lib/date';
import { useLearningStore } from '@/stores/learning.store';
import { useSettingsStore } from '@/stores/settings.store';

/** Adds the time spent on a screen to today's study log when the screen closes. */
export function useStudyTimer() {
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
    return () => {
      const seconds = Math.round((Date.now() - startedAt.current) / 1000);
      useLearningStore.getState().recordActivity(seconds);
    };
  }, []);
}

export const useTodaySeconds = () => useLearningStore((s) => s.activity[dateKey()]?.seconds ?? 0);

/** Parent-set daily time limit. `guard` runs an action only while the child still has time left. */
export function useStudyGuard() {
  const router = useRouter();
  const limitMinutes = useSettingsStore((s) => s.dailyLimitMinutes);
  const todaySeconds = useTodaySeconds();
  const limited = limitMinutes > 0 && todaySeconds >= limitMinutes * 60;

  const guard = useCallback(
    (action: () => void) => {
      if (!limited) return action();
      router.push({
        pathname: '/modal',
        params: {
          icon: 'moon',
          title: 'Waktunya istirahat',
          message: 'Kamu sudah belajar banyak hari ini. Sampai jumpa besok ya!',
        },
      });
    },
    [limited, router],
  );

  return { limited, guard, limitMinutes, todaySeconds };
}
