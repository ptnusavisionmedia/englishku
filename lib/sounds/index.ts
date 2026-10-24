import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

import { SOUND_FILES, type SoundName } from '@/lib/sounds/sound-files';
import { useSettingsStore } from '@/stores/settings.store';

const players = new Map<SoundName, AudioPlayer>();

function playerFor(name: SoundName): AudioPlayer {
  let player = players.get(name);
  if (!player) {
    player = createAudioPlayer(SOUND_FILES[name]);
    player.volume = name === 'intro' || name === 'win' ? 0.9 : 0.75;
    players.set(name, player);
  }
  return player;
}

/** Creates every player up front so the first tap does not lag. Safe to call more than once. */
export function preloadSounds() {
  for (const name of Object.keys(SOUND_FILES) as SoundName[]) {
    try {
      playerFor(name);
    } catch {
      // Audio is a nicety; the app works without it.
    }
  }
}

/** Plays a short sound effect. Does nothing when the parent turned sound off. */
export function playSound(name: SoundName) {
  if (!useSettingsStore.getState().soundEnabled) return;
  try {
    const player = playerFor(name);
    void player.seekTo(0);
    player.play();
  } catch {
    // Never let a sound problem interrupt learning.
  }
}
