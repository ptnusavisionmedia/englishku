import type { StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';

import { Brutal } from '@/components/ui/Brutal';
import type { Tint } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

type Props = Omit<React.ComponentProps<typeof View>, 'style'> & {
  tint?: Tint;
  /** Padding etc. for the card face. */
  style?: StyleProp<ViewStyle>;
  /** Margins/flex for the outer wrapper. */
  containerStyle?: StyleProp<ViewStyle>;
  offset?: number;
};

export function Card({ tint, style, containerStyle, offset, children, ...rest }: Props) {
  const { colors } = useTheme();
  return (
    <Brutal
      bg={tint ? colors[tint] : colors.surface}
      offset={offset}
      containerStyle={containerStyle}
      style={[{ padding: 16 }, style]}
      {...rest}
    >
      {children}
    </Brutal>
  );
}
