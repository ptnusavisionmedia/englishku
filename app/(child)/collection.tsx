import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/common/States';
import { Hero } from '@/components/layout/Hero';
import { Screen } from '@/components/layout/Screen';
import { BadgeGrid } from '@/components/learning/BadgeGrid';
import { AudioButton } from '@/components/ui/AudioButton';
import { Icon } from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Row } from '@/components/ui/Row';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';
import { categoryIcon, wordIcon } from '@/lib/icons';
import { playSound } from '@/lib/sounds';
import { useLearningStore } from '@/stores/learning.store';

const ALL = '__all';
const FAV = '__fav';
const BADGE = '__badge';

export default function CollectionScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const vocabulary = useLearningStore((s) => s.vocabulary);
  const lessons = useLearningStore((s) => s.lessons);
  const categories = useLearningStore((s) => s.categories);
  const userVocab = useLearningStore((s) => s.userVocab);
  const achievements = useLearningStore((s) => s.achievements);
  const unlocked = useLearningStore((s) => s.unlocked);
  const pinned = useLearningStore((s) => s.profile?.pinned_badges ?? []);
  const toggleFavorite = useLearningStore((s) => s.toggleFavorite);
  const togglePinnedBadge = useLearningStore((s) => s.togglePinnedBadge);
  const [filter, setFilter] = useState(ALL);

  const categoryOfLesson = useMemo(() => {
    const byCat = new Map(categories.map((c) => [c.id, c]));
    return new Map(lessons.map((l) => [l.id, byCat.get(l.category_id)]));
  }, [lessons, categories]);

  const learnedCount = vocabulary.filter((v) => (userVocab[v.id]?.mastery_level ?? 0) >= 1).length;
  const badgeCount = achievements.filter((a) => unlocked[a.id]).length;
  const showingBadges = filter === BADGE;

  const shown = vocabulary.filter((v) => {
    if (filter === ALL) return true;
    if (filter === FAV) return userVocab[v.id]?.is_favorite;
    return categoryOfLesson.get(v.lesson_id)?.id === filter;
  });

  // The badge button sits right next to Favorit.
  const chips = [
    { key: ALL, label: 'Semua', icon: 'chest' },
    { key: FAV, label: 'Favorit', icon: 'heart' },
    { key: BADGE, label: 'Badge', icon: 'medal' },
    ...categories.map((c) => ({ key: c.id, label: c.name, icon: categoryIcon(c.name) })),
  ];

  const message = (icon: string, title: string, text: string) =>
    router.push({ pathname: '/modal', params: { icon, title, message: text } });

  const onPressBadge = async (id: string) => {
    const result = await togglePinnedBadge(id);
    if (result === 'full') {
      message('medal', 'Sudah 3 badge', 'Lepas satu badge dulu, lalu pilih yang lain.');
    }
  };

  return (
    <Screen scroll={false} edges={['left', 'right']}>
      <Hero
        color={showingBadges ? 'orange' : 'red'}
        title={showingBadges ? 'Koleksi Badge' : 'Koleksi Kata'}
        subtitle={
          showingBadges
            ? `${badgeCount} dari ${achievements.length} badge didapat`
            : `${learnedCount} dari ${vocabulary.length} kata dipelajari`
        }
        icon={showingBadges ? 'medal' : 'chest'}
      >
        <ProgressBar
          value={
            showingBadges
              ? achievements.length
                ? badgeCount / achievements.length
                : 0
              : vocabulary.length
                ? learnedCount / vocabulary.length
                : 0
          }
          color={showingBadges ? colors.green : colors.orange}
          height={20}
          label={showingBadges ? 'Badge yang sudah didapat' : 'Kata yang sudah dipelajari'}
        />
      </Hero>

      <View>
        <FlatList
          horizontal
          data={chips}
          keyExtractor={(c) => c.key}
          showsHorizontalScrollIndicator={false}
          style={styles.chipList}
          contentContainerStyle={styles.chips}
          renderItem={({ item }) => (
            <Pill
              label={item.label}
              icon={item.icon}
              active={item.key === filter}
              onPress={() => setFilter(item.key)}
            />
          )}
        />
      </View>

      {showingBadges ? (
        <FlatList
          key="badges"
          data={[0]}
          keyExtractor={() => 'badge-grid'}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={[styles.hint, { color: colors.textMuted }]}>
              Ketuk badge yang sudah didapat untuk memasangnya di Beranda (maksimal 3).
            </Text>
          }
          renderItem={() => (
            <BadgeGrid
              achievements={achievements}
              unlocked={unlocked}
              pinned={pinned}
              onPressEarned={(a) => void onPressBadge(a.id)}
            />
          )}
        />
      ) : (
        <FlatList
          key="words"
          data={shown}
          keyExtractor={(v) => v.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              icon={filter === FAV ? 'heart-empty' : 'chest'}
              title={filter === FAV ? 'Belum ada favorit' : 'Belum ada kata'}
              description={
                filter === FAV ? 'Ketuk hati di kartu kata untuk menyimpan favorit.' : undefined
              }
            />
          }
          renderItem={({ item, index }) => {
            const uv = userVocab[item.id];
            const learned = (uv?.mastery_level ?? 0) >= 1;
            return (
              <Row
                icon={learned ? wordIcon(item.word) : 'question'}
                iconSize={52}
                title={item.word}
                subtitle={learned ? item.translation : 'Belum dipelajari'}
                dim={!learned}
                last={index === shown.length - 1}
                trailing={
                  learned ? (
                    <View style={styles.actions}>
                      <AudioButton text={item.word} size={44} />
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={
                          uv?.is_favorite ? 'Hapus dari favorit' : 'Tambah ke favorit'
                        }
                        onPress={() => {
                          playSound('heart');
                          void toggleFavorite(item.id);
                        }}
                        hitSlop={8}
                      >
                        <Icon name={uv?.is_favorite ? 'heart' : 'heart-empty'} size={32} />
                      </Pressable>
                    </View>
                  ) : undefined
                }
              />
            );
          }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chipList: { flexGrow: 0 },
  chips: { gap: 10, paddingRight: 8, paddingBottom: 6 },
  list: { paddingBottom: 24, gap: 10 },
  hint: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
