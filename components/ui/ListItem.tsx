import { useDesignTokens } from '@/lib/design';
import { borderRadius, spacing, typography } from '@/lib/theme';
import {
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

export interface ListItemProps {
  /** Primary title rendered on the row. */
  title: string;
  /** Optional supporting text below the title. */
  subtitle?: string;
  /** Leading slot — typically an Icon. */
  leading?: React.ReactNode;
  /** Trailing slot — typically a chevron, switch, or value text. */
  trailing?: React.ReactNode;
  /** Press handler. If omitted, the row is rendered non-interactive. */
  onPress?: () => void;
  /** Mark the row as destructive (red title). */
  destructive?: boolean;
  /** Accessibility hint surfaced to screen readers. */
  accessibilityHint?: string;
  /** Accessibility role override. */
  accessibilityRole?: 'button' | 'switch' | 'link';
}

/**
 * Settings/list row primitive.
 *
 * Provides consistent height, padding, leading/trailing slots, and title/subtitle
 * stack. Meets the 44pt touch target on press. Destructive rows render the title
 * in `colors.error` for actions like "Delete account" or "Reset everything".
 */
export function ListItem({
  title,
  subtitle,
  leading,
  trailing,
  onPress,
  destructive = false,
  accessibilityHint,
  accessibilityRole,
}: ListItemProps) {
  const { colors } = useDesignTokens();
  const styles = createStyles(colors);

  const body = (
    <>
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <View style={styles.text}>
        <Text
          style={[styles.title, destructive && styles.titleDestructive]}
          numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </>
  );

  if (!onPress) {
    return <View style={styles.row}>{body}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      accessibilityRole={accessibilityRole ?? 'button'}
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint ?? subtitle}>
      {body}
    </Pressable>
  );
}

type Colors = ReturnType<typeof useDesignTokens>['colors'];

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    row: {
      minHeight: 56,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      gap: spacing.md,
      backgroundColor: colors.surface.default,
      borderRadius: borderRadius.md,
    } as ViewStyle,
    rowPressed: {
      backgroundColor: colors.background.muted,
    } as ViewStyle,
    leading: {
      width: 28,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,
    text: {
      flex: 1,
      gap: 2,
    } as ViewStyle,
    title: {
      ...typography.base,
      color: colors.text.primary,
      fontWeight: '600',
    } as TextStyle,
    titleDestructive: {
      color: colors.error,
    } as TextStyle,
    subtitle: {
      ...typography.sm,
      color: colors.text.secondary,
    } as TextStyle,
    trailing: {
      marginLeft: 'auto',
    } as ViewStyle,
  });
