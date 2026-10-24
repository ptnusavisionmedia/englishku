import { useEffect, useRef, useState } from 'react';
import { PanResponder } from 'react-native';

/**
 * Horizontal swipe detection for a view. Only claims the gesture when the finger moves mostly
 * sideways, so vertical scrolling inside the same area keeps working.
 */
export function useSwipe(handlers: { onLeft?: () => void; onRight?: () => void }, distance = 60) {
  const latest = useRef(handlers);
  useEffect(() => {
    latest.current = handlers;
  });

  // The closures only read `latest` when a gesture ends, never during render.
  // eslint-disable-next-line react-hooks/refs
  const [responder] = useState(() =>
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) =>
        Math.abs(g.dx) > 18 && Math.abs(g.dx) > Math.abs(g.dy) * 1.8,
      onPanResponderRelease: (_e, g) => {
        if (g.dx <= -distance) latest.current.onLeft?.();
        else if (g.dx >= distance) latest.current.onRight?.();
      },
    }),
  );
  return responder.panHandlers;
}
