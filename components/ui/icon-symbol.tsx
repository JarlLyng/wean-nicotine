// Android and web. iOS takes icon-symbol.ios.tsx, with SF Symbols.

import { ColorValue, StyleProp, ViewStyle } from 'react-native';

import { Icon, IconName } from '@/components/ui/Icon';

/**
 * The SF Symbols the app names, and the Phosphor icon that stands in for each
 * where SF Symbols don't exist. Phosphor is what the rest of the app draws
 * with, so the tab bar matches the screens above it.
 */
const MAPPING = {
  'house.fill': 'house',
  'chart.line.uptrend.xyaxis': 'chart-line-up',
  'heart.fill': 'heart',
  'gearshape.fill': 'gear',
} satisfies Record<string, IconName>;

export type IconSymbolName = keyof typeof MAPPING;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: ColorValue;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Icon name={MAPPING[name]} size={size} color={String(color)} weight="fill" style={style} />
  );
}
