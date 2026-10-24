import { Redirect } from 'expo-router';

import { LoadingState } from '@/components/common/States';
import { Screen } from '@/components/layout/Screen';
import { isOnboarded } from '@/lib/learning';
import { useAuthStore } from '@/stores/auth.store';
import { useLearningStore } from '@/stores/learning.store';

export default function Index() {
  const user = useAuthStore((s) => s.user);
  const profile = useLearningStore((s) => s.profile);
  const isLoaded = useLearningStore((s) => s.isLoaded);

  if (!user) return <Redirect href="/login" />;
  if (!isLoaded) {
    return (
      <Screen scroll={false}>
        <LoadingState />
      </Screen>
    );
  }
  return <Redirect href={isOnboarded(profile) ? '/home' : '/onboarding'} />;
}
