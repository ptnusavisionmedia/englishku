import * as Speech from 'expo-speech';

import { useSettingsStore } from '@/stores/settings.store';

/** Speak an English word or sentence slowly and clearly. Respects the parent's sound setting. */
export function speak(text: string, options: { rate?: number } = {}): boolean {
  if (!useSettingsStore.getState().soundEnabled) return false;
  void Speech.stop();
  Speech.speak(text, { language: 'en-US', rate: options.rate ?? 0.8, pitch: 1.05 });
  return true;
}

export function stopSpeaking() {
  void Speech.stop();
}
