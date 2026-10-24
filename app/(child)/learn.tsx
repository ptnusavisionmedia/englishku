import { useRouter } from 'expo-router';

import { EmptyState } from '@/components/common/States';
import { Hero } from '@/components/layout/Hero';
import { LessonCard } from '@/components/learning/LessonCard';
import { Screen } from '@/components/layout/Screen';
import { FadeInUp } from '@/components/ui/Motion';
import { useLessons } from '@/hooks/useLessons';
import { useStudyGuard } from '@/hooks/useStudy';

export default function LearnScreen() {
  const router = useRouter();
  const { items, recommended } = useLessons();
  const { guard } = useStudyGuard();
  const done = items.filter((i) => i.status === 'completed').length;

  return (
    <Screen edges={['left', 'right']}>
      <Hero
        color="orange"
        title="Jalur Belajar"
        subtitle={`${done} dari ${items.length} tema selesai`}
        icon="book"
      />
      {items.length === 0 ? (
        <EmptyState
          title="Belum ada pelajaran"
          description="Pelajaran baru akan segera hadir."
          icon="book"
        />
      ) : (
        items.map((item, i) => (
          <FadeInUp key={item.lesson.id} delay={Math.min(i, 8) * 55}>
            <LessonCard
              {...item}
              last={i === items.length - 1}
              recommended={recommended?.lesson.id === item.lesson.id}
              onPress={() => {
                if (item.status === 'locked') {
                  return router.push({
                    pathname: '/modal',
                    params: {
                      icon: 'lock',
                      title: 'Belum terbuka',
                      message: 'Selesaikan pelajaran sebelumnya dulu ya!',
                    },
                  });
                }
                guard(() =>
                  router.push({ pathname: '/lesson/[id]', params: { id: item.lesson.id } }),
                );
              }}
            />
          </FadeInUp>
        ))
      )}
    </Screen>
  );
}
