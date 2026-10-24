import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import { File } from 'expo-file-system';
import { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { Brutal, BrutalPressable } from '@/components/ui/Brutal';
import { AudioButton } from '@/components/ui/AudioButton';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Pop, Pulse } from '@/components/ui/Motion';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';
import { playSound } from '@/lib/sounds';
import { useLearningStore } from '@/stores/learning.store';
import { useSettingsStore } from '@/stores/settings.store';

type Feedback = { title: string; hint: string; icon: string };

const MAX_MS = 4000;
const MIN_MS = 600;

const FEEDBACK: Feedback[] = [
  { title: 'Great!', hint: 'Suaramu bagus sekali!', icon: 'star' },
  { title: 'Great!', hint: 'Kamu hebat, terus berlatih!', icon: 'party' },
  { title: 'Good try!', hint: 'Bagus! Dengarkan lagi, lalu coba sekali lagi.', icon: 'smile' },
];
const TRY_AGAIN: Feedback = {
  title: "Let's try again!",
  hint: 'Tekan mikrofon, lalu ucapkan kata dengan suara agak keras.',
  icon: 'repeat',
};

/**
 * Speak-and-repeat practice. Audio is recorded only while the button is active, is never uploaded,
 * and the temporary file is deleted right away. Feedback is a friendly simulation until a speech
 * recognition API is plugged into `evaluate`.
 */
export function PronunciationPanel({ word }: { word: string }) {
  const { colors } = useTheme();
  const recorder = useAudioRecorder(RecordingPresets.LOW_QUALITY);
  const micConsent = useSettingsStore((s) => s.micConsent);
  const recordPronunciation = useLearningStore((s) => s.recordPronunciation);
  const [recording, setRecording] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const startedAt = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setFeedback(null);
  }, [word]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  // Replace this with a real speech-recognition call to score the child's attempt.
  const evaluate = (durationMs: number): Feedback =>
    durationMs < MIN_MS ? TRY_AGAIN : FEEDBACK[Math.floor(Math.random() * FEEDBACK.length)]!;

  const stop = async () => {
    if (timer.current) clearTimeout(timer.current);
    setRecording(false);
    playSound('recStop');
    const duration = Date.now() - startedAt.current;
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (uri) new File(uri).delete();
    } catch {
      // The temp file may already be gone; nothing is kept either way.
    }
    await setAudioModeAsync({ allowsRecording: false }).catch(() => {});
    const result = evaluate(duration);
    setFeedback(result);
    if (result !== TRY_AGAIN) void recordPronunciation();
  };

  const begin = async () => {
    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Mikrofon belum aktif',
        'Minta orang tua mengizinkan mikrofon di pengaturan perangkat untuk latihan ucapan.',
      );
      return;
    }
    try {
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      playSound('recStart');
      startedAt.current = Date.now();
      setFeedback(null);
      setRecording(true);
      timer.current = setTimeout(() => void stop(), MAX_MS);
    } catch {
      Alert.alert('Ups!', 'Mikrofon belum bisa dipakai. Coba lagi ya!');
    }
  };

  const onMic = () => {
    if (recording) return void stop();
    if (micConsent) return void begin();
    Alert.alert(
      'Izin orang tua',
      'Latihan ucapan memakai mikrofon. Suara anak tidak disimpan dan tidak dikirim ke mana pun. Orang tua setuju?',
      [
        { text: 'Belum', style: 'cancel' },
        {
          text: 'Setuju',
          onPress: () => {
            useSettingsStore.getState().set({ micConsent: true });
            void begin();
          },
        },
      ],
    );
  };

  return (
    <Card tint="tintPurple" style={styles.card}>
      <Text style={[styles.title, { color: colors.text }]}>Ucapkan: {word}</Text>
      <View style={styles.row}>
        <AudioButton text={word} size={64} label={`Dengarkan ${word} dulu`} />
        <Pulse active={recording}>
          <BrutalPressable
            bg={recording ? colors.red : colors.green}
            radius={44}
            offset={5}
            accessibilityLabel={recording ? 'Berhenti merekam' : 'Mulai latihan ucapan'}
            accessibilityState={{ selected: recording }}
            onPress={onMic}
            style={styles.mic}
          >
            <Icon name={recording ? 'stop' : 'mic'} size={48} />
          </BrutalPressable>
        </Pulse>
      </View>
      <Text style={[styles.status, { color: colors.textMuted }]}>
        {recording ? 'Aku mendengarkan… ucapkan sekarang!' : 'Dengarkan dulu, lalu tekan mikrofon'}
      </Text>
      {feedback ? (
        <Pop style={styles.popFull}>
          <Brutal
            bg={colors.surface}
            offset={3}
            radius={16}
            accessibilityRole="alert"
            style={styles.feedback}
          >
            <Icon name={feedback.icon} size={48} />
            <Text style={[styles.feedbackTitle, { color: colors.text }]}>{feedback.title}</Text>
            <Text style={{ color: colors.textMuted, textAlign: 'center', fontWeight: '600' }}>
              {feedback.hint}
            </Text>
          </Brutal>
        </Pop>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 10, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '800' },
  row: { flexDirection: 'row', gap: 20, alignItems: 'center' },
  mic: { width: 88, height: 88, alignItems: 'center', justifyContent: 'center' },
  status: { fontSize: 15, textAlign: 'center', fontWeight: '600' },
  popFull: { alignSelf: 'stretch' },
  feedback: { padding: 14, alignItems: 'center', gap: 2 },
  feedbackTitle: { fontSize: 26, fontWeight: '800' },
});
