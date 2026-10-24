import type { Tint } from '@/constants/theme';
import type { GameType } from '@/types';

/** Avatar artwork lives in assets/icons/avatar-<key>.png. */
export type Avatar = { key: string; unlockStars: number };

export const AVATARS: Avatar[] = [
  { key: 'bear', unlockStars: 0 },
  { key: 'rabbit', unlockStars: 0 },
  { key: 'cat', unlockStars: 0 },
  { key: 'panda', unlockStars: 0 },
  { key: 'fox', unlockStars: 10 },
  { key: 'lion', unlockStars: 20 },
  { key: 'unicorn', unlockStars: 35 },
  { key: 'dino', unlockStars: 50 },
];

export const STARS_PER_LEVEL = 15;
export const DAILY_LIMIT_OPTIONS = [0, 15, 30, 45, 60] as const;

export const GAMES: {
  type: GameType;
  title: string;
  instruction: string;
  /** Icon name from assets/icons. */
  icon: string;
  tint: Tint;
}[] = [
  {
    type: 'word-match',
    title: 'Word Match',
    instruction: 'Cocokkan gambar dengan katanya.',
    icon: 'puzzle',
    tint: 'tintBlue',
  },
  {
    type: 'listen-choose',
    title: 'Listen and Choose',
    instruction: 'Dengarkan, lalu pilih gambar yang benar.',
    icon: 'ear',
    tint: 'tintGreen',
  },
  {
    type: 'find-word',
    title: 'Find the Word',
    instruction: 'Lihat gambar, lalu pilih katanya.',
    icon: 'magnifier',
    tint: 'tintYellow',
  },
  {
    type: 'memory',
    title: 'Memory Cards',
    instruction: 'Buka kartu dan cari pasangannya.',
    icon: 'cards',
    tint: 'tintPink',
  },
  {
    type: 'spelling',
    title: 'Spelling Puzzle',
    instruction: 'Susun huruf menjadi kata.',
    icon: 'abc',
    tint: 'tintPurple',
  },
  {
    type: 'quick-quiz',
    title: 'Quick Quiz',
    instruction: 'Jawab 5 pertanyaan singkat.',
    icon: 'star',
    tint: 'tintOrange',
  },
];
