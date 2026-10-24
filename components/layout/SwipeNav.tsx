import { useRouter, useSegments } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { useSwipe } from '@/hooks/useSwipe';
import { playSound } from '@/lib/sounds';

type Props = {
  /** Page names in left-to-right order, matching the tab screens. */
  pages: string[];
  /** Route to open for a page name. */
  hrefFor: (page: string) => string;
  children: ReactNode;
};

/**
 * Lets the child move between sibling tab pages by swiping: swipe left for the next page, right
 * for the previous one. Tapping the tab bar still works.
 */
export function SwipeNav({ pages, hrefFor, children }: Props) {
  const router = useRouter();
  const segments = useSegments() as string[];
  const last = segments[segments.length - 1] ?? '';
  // The parent area's first tab is the folder index (its last segment is "parent").
  const current = Math.max(
    pages.findIndex((p) => p === last || (p === 'index' && last === 'parent')),
    0,
  );

  const go = (to: number) => {
    const page = pages[to];
    if (page) {
      playSound('swipe');
      router.navigate(hrefFor(page) as never);
    }
  };
  const swipe = useSwipe({ onLeft: () => go(current + 1), onRight: () => go(current - 1) });

  return (
    <View style={styles.flex} {...swipe}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });
