import { create } from 'zustand';

import { getErrorMessage, withTimeout } from '@/lib/api';
import { getDb } from '@/lib/database/db';
import * as auth from '@/services/local-auth.service';
import { useLearningStore } from '@/stores/learning.store';
import { useOnboardingStore } from '@/stores/onboarding.store';
import { useSettingsStore } from '@/stores/settings.store';
import type { AppUser } from '@/types';

type RegisterInput = Parameters<typeof auth.registerUser>[0];

type AuthState = {
  user: AppUser | null;
  isLoading: boolean;
  isInitialized: boolean;
  /** Set when the local database could not be opened; the UI shows it with a retry button. */
  initError: string | null;
  register: (input: RegisterInput) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Opens the database (migrations + seed) and restores the remembered user. No network involved. */
  restoreSession: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isInitialized: false,
  initError: null,

  restoreSession: async () => {
    set({ initError: null });
    try {
      await withTimeout(getDb(), 20000, 'Database lokal terlalu lama dibuka.');
      const user = await auth.restoreSession();
      set({ user });
    } catch (e) {
      set({ user: null, initError: getErrorMessage(e) });
    } finally {
      set({ isInitialized: true });
    }
  },

  register: async (input) => {
    set({ isLoading: true });
    try {
      const user = await auth.registerUser(input);
      set({ user });
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (username, password) => {
    set({ isLoading: true });
    try {
      const user = await auth.loginUser(username, password);
      set({ user });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await auth.logoutUser();
      set({ user: null });
      useLearningStore.getState().reset();
      useOnboardingStore.getState().reset();
      useSettingsStore.getState().set({ parentUnlocked: false });
    } finally {
      set({ isLoading: false });
    }
  },
}));
