import { memo } from 'react';
import { Image } from 'react-native';

import { ICON_IMAGES } from '@/lib/icons';

type Props = { name: string; size?: number; label?: string };

/** Custom EnglishKu icon (PNG illustrations live in assets/icons). */
export const Icon = memo(function Icon({ name, size = 32, label }: Props) {
  const source = ICON_IMAGES[name] ?? ICON_IMAGES.question;
  return (
    <Image
      source={source}
      style={{ width: size, height: size }}
      resizeMode="contain"
      accessible={!!label}
      accessibilityLabel={label}
    />
  );
});
