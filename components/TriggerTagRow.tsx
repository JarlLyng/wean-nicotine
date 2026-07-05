/**
 * TriggerTagRow — optional post-log trigger tagging (#220).
 *
 * Appears quietly under the logging buttons after "Used a pouch". Shows the
 * user's own onboarding-selected triggers as chips; tapping one tags the
 * just-created log entry. Entirely optional — dismissible via the ×, and it
 * never blocks or delays the one-tap logging flow.
 *
 * The row is transient by design: the parent unmounts it on undo, on the
 * next log, or when the user dismisses it. Tapping an already-selected chip
 * untags (clears the trigger).
 */

import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { spacing } from '@/lib/theme';
import { useDesignTokens, typography } from '@/lib/design';

interface TriggerTagRowProps {
  /** The user's configured triggers (from TaperSettings). */
  triggers: string[];
  /** Currently tagged trigger for the target entry, if any. */
  selected: string | null;
  /** Called with the trigger label, or null when untagging. */
  onSelect: (trigger: string | null) => void;
  /** Dismiss the row without tagging. */
  onDismiss: () => void;
}

export function TriggerTagRow({ triggers, selected, onSelect, onDismiss }: TriggerTagRowProps) {
  const { colors } = useDesignTokens();

  if (triggers.length === 0) return null;

  const handleChipPress = (label: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onSelect(selected === label ? null : label);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text
          style={[styles.label, { color: colors.text.secondary, fontSize: typography.sizes.sm }]}
        >
          What triggered it? <Text style={{ color: colors.text.tertiary }}>(optional)</Text>
        </Text>
        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Dismiss trigger tagging"
          hitSlop={12}
          style={({ pressed }) => [styles.dismiss, pressed && { opacity: 0.6 }]}
        >
          <Icon name="x" size={16} color={colors.text.tertiary} />
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {triggers.map((label) => (
          <Chip
            key={label}
            label={label}
            variant="outline"
            selected={selected === label}
            onPress={() => handleChipPress(label)}
            accessibilityHint={
              selected === label
                ? 'Removes this trigger from the last pouch'
                : 'Tags the last pouch with this trigger'
            }
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontWeight: '600',
  },
  dismiss: {
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chips: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
});
