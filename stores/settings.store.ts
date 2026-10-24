import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemePreference = 'system' | 'light' | 'dark';

type SettingsState = {
  soundEnabled: boolean;
  musicEnabled: boolean;
  notificationsEnabled: boolean;
  /** Daily study limit in minutes; 0 means no limit. */
  dailyLimitMinutes: number;
  theme: ThemePreference;
  /** A parent agreed to let the child practice with the microphone (audio is never stored). */
  micConsent: boolean;
  /** Not persisted: parent area unlocks only for the current visit. */
  parentUnlocked: boolean;
  set: (patch: Partial<Omit<SettingsState, 'set'>>) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      musicEnabled: true,
      notificationsEnabled: true,
      dailyLimitMinutes: 0,
      theme: 'system',
      micConsent: false,
      parentUnlocked: false,
      set: (patch) => set(patch),
    }),
    {
      name: 'englishku-settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ parentUnlocked: _p, set: _s, ...rest }) => rest,
    },
  ),
);
