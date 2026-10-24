import { Tabs, useRouter } from 'expo-router';

import { ParentGate } from '@/components/common/ParentGate';
import { SwipeNav } from '@/components/layout/SwipeNav';
import { Screen } from '@/components/layout/Screen';
import { TabBarButton, TabIcon } from '@/components/layout/TabParts';
import { brutal } from '@/constants/theme';
import { smoothTabs } from '@/constants/tabTransition';
import { fonts } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';
import { playSound } from '@/lib/sounds';
import { useSettingsStore } from '@/stores/settings.store';

const PAGES = ['index', 'progress', 'settings'];

const tab = (title: string, icon: string) => ({
  title,
  tabBarAccessibilityLabel: `Tab ${title}`,
  tabBarIcon: ({ focused }: { focused: boolean }) => <TabIcon name={icon} focused={focused} />,
});

/** Separate navigation for adults (swipeable too). Opens only after the parent check is solved. */
export default function ParentLayout() {
  const { colors } = useTheme();
  const router = useRouter();
  const unlocked = useSettingsStore((s) => s.parentUnlocked);
  const setSettings = useSettingsStore((s) => s.set);

  if (!unlocked) {
    return (
      <Screen scroll={false}>
        <ParentGate
          onPass={() => setSettings({ parentUnlocked: true })}
          onCancel={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
        />
      </Screen>
    );
  }

  return (
    <SwipeNav pages={PAGES} hrefFor={(p) => (p === 'index' ? '/parent' : `/parent/${p}`)}>
      <Tabs
        screenListeners={{ tabPress: () => playSound('tab') }}
        screenOptions={{
          headerShown: false,
          ...smoothTabs,
          tabBarButton: (props) => <TabBarButton {...props} />,
          tabBarActiveTintColor: colors.text,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: { fontSize: 12, fontFamily: fonts.black },
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: brutal.border,
            height: 78,
            paddingTop: 6,
            paddingBottom: 6,
          },
          sceneStyle: { backgroundColor: colors.background },
        }}
      >
        <Tabs.Screen name="index" options={tab('Ringkasan', 'clipboard')} />
        <Tabs.Screen name="progress" options={tab('Progress', 'chart')} />
        <Tabs.Screen name="settings" options={tab('Pengaturan', 'gear')} />
      </Tabs>
    </SwipeNav>
  );
}
