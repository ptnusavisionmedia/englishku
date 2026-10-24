// Sound effects synthesised by scripts/generate-sounds.js and stored in assets/sounds.
import type { AudioSource } from 'expo-audio';

export const SOUND_FILES = {
  tap: require('../../assets/sounds/tap.wav'),
  pop: require('../../assets/sounds/pop.wav'),
  tab: require('../../assets/sounds/tab.wav'),
  swipe: require('../../assets/sounds/swipe.wav'),
  back: require('../../assets/sounds/back.wav'),
  toggle: require('../../assets/sounds/toggle.wav'),
  heart: require('../../assets/sounds/heart.wav'),
  correct: require('../../assets/sounds/correct.wav'),
  wrong: require('../../assets/sounds/wrong.wav'),
  star: require('../../assets/sounds/star.wav'),
  win: require('../../assets/sounds/win.wav'),
  badge: require('../../assets/sounds/badge.wav'),
  flip: require('../../assets/sounds/flip.wav'),
  match: require('../../assets/sounds/match.wav'),
  tile: require('../../assets/sounds/tile.wav'),
  recStart: require('../../assets/sounds/rec-start.wav'),
  recStop: require('../../assets/sounds/rec-stop.wav'),
  intro: require('../../assets/sounds/intro.wav'),
  logout: require('../../assets/sounds/logout.wav'),
} satisfies Record<string, AudioSource>;

export type SoundName = keyof typeof SOUND_FILES;
