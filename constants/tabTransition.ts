import { Animated, Easing } from 'react-native';

/**
 * Smooth page change between tabs: the old page fades and drifts away while the new one fades
 * and settles in from the side, with a hint of scale. Slower and softer than the built-in "shift",
 * and it never reveals a dark backdrop because the navigator background is the app's light colour.
 */
export const smoothTabs = {
  transitionSpec: {
    animation: 'timing' as const,
    config: { duration: 320, easing: Easing.out(Easing.cubic) },
  },
  sceneStyleInterpolator: ({ current }: { current: { progress: Animated.Value } }) => ({
    sceneStyle: {
      opacity: current.progress.interpolate({
        inputRange: [-1, -0.4, 0, 0.4, 1],
        outputRange: [0, 0.2, 1, 0.2, 0],
      }),
      transform: [
        {
          translateX: current.progress.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [-42, 0, 42],
          }),
        },
        {
          scale: current.progress.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [0.96, 1, 0.96],
          }),
        },
      ],
    },
  }),
};
