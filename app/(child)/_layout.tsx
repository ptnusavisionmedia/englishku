import { Tabs } from 'expo-router';

import { SwipeNav } from '@/components/layout/SwipeNav';
import { TabBarButton, TabIcon } from '@/components/layout/TabParts';
import { brutal } from '@/constants/theme';
import { smoothTabs } from '@/constants/tabTransition';
import { fonts } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';
import { playSound } from '@/lib/sounds';

const PAGES = ['home', 'learn', 'games', 'collection', 'profile'];

const tab = (title: string, icon: string) => ({
  title,
  tabBarAccessibilityLabel: `Tab ${title}`,
  tabBarIcon: ({ focused }: { focused: boolean }) => <TabIcon name={icon} focused={focused} />,
});

/** Swipe left/right (or tap the bar) to move between Beranda, Belajar, Bermain, Koleksi, Profil. */
export default function ChildLayout() {
  const { colors } = useTheme();
  return (
    <SwipeNav pages={PAGES} hrefFor={(p) => `/${p}`}>
      <Tabs
        screenListeners={{ tabPress: () => playSound('tab') }}
        screenOptions={{
          headerShown: false,
          ...smoothTabs,
          tabBarButton: (props) => <TabBarButton {...props} />,
          tabBarActiveTintColor: colors.text,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: { fontSize: 12, fontFamily: fonts.black, marginTop: 2 },
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: brutal.border,
            height: 82,
            paddingTop: 8,
            paddingBottom: 8,
          },
          sceneStyle: { backgroundColor: colors.background },
        }}
      >
        <Tabs.Screen name="home" options={tab('Beranda', 'home')} />
        <Tabs.Screen name="learn" options={tab('Belajar', 'book')} />
        <Tabs.Screen name="games" options={tab('Bermain', 'gamepad')} />
        <Tabs.Screen name="collection" options={tab('Koleksi', 'chest')} />
        <Tabs.Screen name="profile" options={tab('Profil', 'smile')} />
      </Tabs>
    </SwipeNav>
  );
}
