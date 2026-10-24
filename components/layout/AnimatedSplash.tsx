import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Confetti } from '@/components/ui/Confetti';
import { useReduceMotion } from '@/components/ui/Motion';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';
import { darken } from '@/lib/color';
import { playSound, preloadSounds } from '@/lib/sounds';

type Props = {
  /** True once fonts, the database and the session are ready. */
  ready: boolean;
  /** True once the bundled fonts are loaded (the tagline needs them). */
  fontsReady: boolean;
  /** Called once the native splash may be hidden (our animated screen is on screen). */
  onShown: () => void;
  /** Called after the fade-out, when this overlay can be removed. */
  onDone: () => void;
};

/** Shortest time the intro plays, so it never flashes by. */
const MIN_MS = 2600;
const RAYS = 14;
const BUBBLES = [
  { color: 'blue', size: 170, x: -50, y: 60, drift: 18 },
  { color: 'red', size: 120, x: 250, y: 120, drift: -14 },
  { color: 'orange', size: 150, x: 220, y: 560, drift: 16 },
  { color: 'green', size: 130, x: -40, y: 520, drift: -18 },
] as const;
// Sticker illustrations that pop in around the logo and keep bobbing.
const STICKERS = [
  { icon: 'star', size: 54, x: -128, y: -118, delay: 600, bob: 7 },
  { icon: 'rocket', size: 62, x: 128, y: -104, delay: 800, bob: 9 },
  { icon: 'abc', size: 58, x: -138, y: 70, delay: 1000, bob: 8 },
  { icon: 'heart', size: 48, x: 134, y: 78, delay: 1200, bob: 6 },
];

/**
 * Animated intro: a sunburst spins behind the logo while it bounces in, wobbles and floats;
 * sticker illustrations pop around it, coloured bubbles drift, confetti rains once, the tagline
 * fades in and a glossy candy bar fills up. Starts exactly where the native splash left off, then
 * fades out when the app is ready and the intro has played long enough.
 */
export function AnimatedSplash({ ready, fontsReady, onShown, onDone }: Props) {
  const { colors } = useTheme();
  const reduce = useReduceMotion();
  const [startedAt] = useState(() => Date.now());
  const [intro] = useState(() => new Animated.Value(0));
  const [float] = useState(() => new Animated.Value(0));
  const [wobble] = useState(() => new Animated.Value(0));
  const [spin] = useState(() => new Animated.Value(0));
  const [tagline] = useState(() => new Animated.Value(0));
  const [bar] = useState(() => new Animated.Value(0));
  const [drift] = useState(() => new Animated.Value(0));
  const [stickers] = useState(() => STICKERS.map(() => new Animated.Value(0)));
  const [fade] = useState(() => new Animated.Value(1));
  const [burst, setBurst] = useState(false);
  const leaving = useRef(false);

  useEffect(() => {
    preloadSounds();
    const sound = setTimeout(() => playSound('intro'), 120);
    const confetti = setTimeout(() => setBurst(true), 700);
    Animated.spring(intro, { toValue: 1, friction: 5, tension: 70, useNativeDriver: true }).start();
    Animated.timing(bar, {
      toValue: 1,
      duration: MIN_MS - 200,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    }).start();
    Animated.timing(tagline, {
      toValue: 1,
      duration: 500,
      delay: 900,
      useNativeDriver: true,
    }).start();
    if (reduce) {
      stickers.forEach((s) => s.setValue(1));
      return () => {
        clearTimeout(sound);
        clearTimeout(confetti);
      };
    }
    Animated.sequence([
      Animated.delay(450),
      Animated.timing(wobble, { toValue: 1, duration: 140, useNativeDriver: true }),
      Animated.timing(wobble, { toValue: -1, duration: 220, useNativeDriver: true }),
      Animated.timing(wobble, { toValue: 0.5, duration: 160, useNativeDriver: true }),
      Animated.timing(wobble, { toValue: 0, duration: 140, useNativeDriver: true }),
    ]).start();
    const loops = [
      Animated.loop(
        Animated.sequence([
          Animated.timing(float, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(float, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ),
      Animated.loop(
        Animated.timing(spin, {
          toValue: 1,
          duration: 16000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(drift, {
            toValue: 1,
            duration: 3200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(drift, {
            toValue: 0,
            duration: 3200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ),
    ];
    loops.forEach((l) => l.start());
    stickers.forEach((s, i) =>
      Animated.sequence([
        Animated.delay(STICKERS[i]!.delay),
        Animated.spring(s, { toValue: 1, friction: 4, tension: 110, useNativeDriver: true }),
      ]).start(),
    );
    return () => {
      clearTimeout(sound);
      clearTimeout(confetti);
      loops.forEach((l) => l.stop());
    };
  }, [intro, float, wobble, spin, tagline, bar, drift, stickers, reduce]);

  // Fade out once the app is ready and the intro has played for its minimum time.
  useEffect(() => {
    if (!ready || leaving.current) return;
    const wait = Math.max(0, MIN_MS - (Date.now() - startedAt));
    const t = setTimeout(() => {
      leaving.current = true;
      Animated.timing(fade, {
        toValue: 0,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => onDone());
    }, wait);
    return () => clearTimeout(t);
  }, [ready, startedAt, fade, onDone]);

  const logoScale = Animated.multiply(
    intro.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }),
    fade.interpolate({ inputRange: [0, 1], outputRange: [1.18, 1] }),
  );

  return (
    <Animated.View
      pointerEvents="auto"
      accessibilityLabel="EnglishKu sedang dimuat"
      onLayout={onShown}
      style={[
        StyleSheet.absoluteFill,
        styles.root,
        { backgroundColor: colors.background, opacity: fade },
      ]}
    >
      {BUBBLES.map((b, i) => (
        <Animated.View
          key={i}
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: b.x,
            top: b.y,
            width: b.size,
            height: b.size,
            borderRadius: b.size / 2,
            backgroundColor: colors[b.color],
            opacity: 0.2,
            transform: [
              { translateY: drift.interpolate({ inputRange: [0, 1], outputRange: [0, b.drift] }) },
            ],
          }}
        />
      ))}

      <View style={styles.stage}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.rays,
            {
              transform: [
                {
                  rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }),
                },
              ],
            },
          ]}
        >
          {Array.from({ length: RAYS }, (_, i) => (
            <View
              key={i}
              style={[
                styles.ray,
                { transform: [{ rotate: `${(i * 360) / RAYS}deg` }, { translateY: -95 }] },
              ]}
            />
          ))}
        </Animated.View>
        <View pointerEvents="none" style={[styles.halo, { backgroundColor: colors.surface }]} />

        {STICKERS.map((s, i) => (
          <Animated.View
            key={s.icon}
            pointerEvents="none"
            style={[
              styles.sticker,
              {
                left: 150 + s.x - s.size / 2,
                top: 150 + s.y - s.size / 2,
                opacity: stickers[i]!,
                transform: [
                  { scale: stickers[i]!.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }) },
                  {
                    rotate: stickers[i]!.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['-50deg', i % 2 ? '8deg' : '-8deg'],
                    }),
                  },
                  {
                    translateY: float.interpolate({
                      inputRange: [0, 1],
                      outputRange: [s.bob, -s.bob],
                    }),
                  },
                ],
              },
            ]}
          >
            <Icon name={s.icon} size={s.size} />
          </Animated.View>
        ))}

        <Animated.View
          style={{
            opacity: intro.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0, 1, 1] }),
            transform: [
              { translateY: float.interpolate({ inputRange: [0, 1], outputRange: [6, -6] }) },
              { scale: logoScale },
              {
                rotate: wobble.interpolate({ inputRange: [-1, 1], outputRange: ['-7deg', '7deg'] }),
              },
            ],
          }}
        >
          <Image
            source={require('../../assets/englishku-logo-clean.png')}
            accessibilityLabel="Logo EnglishKu"
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      {fontsReady ? (
        <Animated.View
          style={{
            opacity: tagline,
            transform: [
              { translateY: tagline.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
            ],
          }}
        >
          <Text display style={[styles.tagline, { color: colors.text }]}>
            Belajar English itu seru!
          </Text>
        </Animated.View>
      ) : (
        <View style={styles.taglineSpace} />
      )}

      <View style={[styles.track, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: colors.green,
              borderBottomColor: darken(colors.green, 0.22),
              width: bar.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            },
          ]}
        >
          <View style={styles.shine} />
        </Animated.View>
      </View>

      {burst ? <Confetti count={22} /> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center', zIndex: 100, overflow: 'hidden' },
  stage: { width: 300, height: 300, alignItems: 'center', justifyContent: 'center' },
  rays: {
    position: 'absolute',
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ray: {
    position: 'absolute',
    left: 131,
    top: 75,
    width: 38,
    height: 150,
    borderRadius: 19,
    backgroundColor: 'rgba(63,140,255,0.14)',
  },
  halo: { position: 'absolute', width: 250, height: 250, borderRadius: 125, opacity: 0.9 },
  logo: { width: 220, height: 220 },
  sticker: { position: 'absolute' },
  tagline: { fontSize: 28, marginTop: 4, textAlign: 'center' },
  taglineSpace: { height: 36 },
  track: {
    width: 220,
    height: 22,
    borderRadius: 11,
    borderWidth: 2.5,
    marginTop: 22,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 11, borderBottomWidth: 3 },
  shine: {
    position: 'absolute',
    top: 2,
    left: 8,
    right: 8,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
});
