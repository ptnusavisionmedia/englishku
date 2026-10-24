import { create } from 'zustand';

import type { AgeGroup } from '@/types';

type OnboardingState = {
  step: number;
  name: string;
  ageGroup: AgeGroup | null;
  goal: 5 | 10 | 15 | null;
  avatar: string;
  setStep: (step: number) => void;
  setName: (name: string) => void;
  setAgeGroup: (ageGroup: AgeGroup) => void;
  setGoal: (goal: 5 | 10 | 15) => void;
  setAvatar: (avatar: string) => void;
  reset: () => void;
};

const initial = { step: 0, name: '', ageGroup: null, goal: null, avatar: 'bear' } as const;

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initial,
  setStep: (step) => set({ step }),
  setName: (name) => set({ name }),
  setAgeGroup: (ageGroup) => set({ ageGroup }),
  setGoal: (goal) => set({ goal }),
  setAvatar: (avatar) => set({ avatar }),
  reset: () => set({ ...initial }),
}));
