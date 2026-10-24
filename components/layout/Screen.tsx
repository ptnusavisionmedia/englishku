import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/useTheme';

type Props = {
  children: ReactNode;
  /** Wrap content in a keyboard-aware ScrollView. Pass `scroll={false}` for fixed layouts or lists. */
  scroll?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
};

export function Screen({ children, scroll = true, edges = ['top', 'left', 'right'] }: Props) {
  const { colors } = useTheme();
  return (
    <SafeAreaView edges={edges} style={[styles.flex, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {scroll ? (
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.flex, styles.fixed]}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1, padding: 20, gap: 16, paddingBottom: 36 },
  fixed: { padding: 20, gap: 14 },
});
