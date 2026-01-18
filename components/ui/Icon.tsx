/**
 * Icon component using Phosphor Icons
 * Provides a consistent icon interface across the app
 */

import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import {
  House,
  ChartLineUp,
  Heart,
  Gear,
  Wind,
  Waves,
  Brain,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ArrowRight,
  Plus,
  Minus,
  Trash,
  Bell,
  BellSlash,
  ArrowClockwise,
  Calendar,
  CurrencyDollar,
  Coins,
} from 'phosphor-react-native';

export type IconName = 
  | 'house' 
  | 'chart-line-up' 
  | 'heart' 
  | 'gear'
  | 'wind'
  | 'waves'
  | 'brain'
  | 'check-circle'
  | 'x-circle'
  | 'arrow-left'
  | 'arrow-right'
  | 'plus'
  | 'minus'
  | 'trash'
  | 'bell'
  | 'bell-slash'
  | 'arrow-clockwise'
  | 'calendar'
  | 'currency-dollar'
  | 'coins';

export type IconWeight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  weight?: IconWeight;
  style?: StyleProp<ViewStyle>;
}

// Mapping of icon names to Phosphor icon components
const ICON_MAP: Record<IconName, React.ComponentType<any>> = {
  'house': House,
  'chart-line-up': ChartLineUp,
  'heart': Heart,
  'gear': Gear,
  'wind': Wind,
  'waves': Waves,
  'brain': Brain,
  'check-circle': CheckCircle,
  'x-circle': XCircle,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'plus': Plus,
  'minus': Minus,
  'trash': Trash,
  'bell': Bell,
  'bell-slash': BellSlash,
  'arrow-clockwise': ArrowClockwise,
  'calendar': Calendar,
  'currency-dollar': CurrencyDollar,
  'coins': Coins,
};

export function Icon({ name, size = 24, color, weight = 'regular', style }: IconProps) {
  const IconComponent = ICON_MAP[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in icon map`);
    return null;
  }

  return (
    <IconComponent 
      size={size} 
      color={color} 
      weight={weight}
      style={style}
    />
  );
}
