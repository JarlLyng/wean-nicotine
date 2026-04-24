/**
 * Onboarding step 2: choose the weekly reduction pace.
 *
 * Users pick from 5 presets (3/5/7/10/15%). Default is 5% — gentle
 * enough for most people that the body adjusts without severe
 * withdrawal. More aggressive paces reach zero faster but have higher
 * dropout risk.
 */

import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/Button';
import { useDesignTokens, getColors, typography } from '@/lib/design';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { spacing, borderRadius } from '@/lib/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

const REDUCTION_PRESETS = [
  { value: 3, label: '3%', description: 'Very gentle — slower taper, easier on withdrawal' },
  { value: 5, label: '5%', description: 'Default — balanced pace recommended for most people' },
  { value: 7, label: '7%', description: 'Moderate — faster progress, slightly more challenging' },
  { value: 10, label: '10%', description: 'Faster — noticeably tougher weekly steps' },
  { value: 15, label: '15%', description: 'Aggressive — quickest but highest dropout rate' },
];

export default function PaceScreen() {
  useDesignTokens();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const baseline = params.baseline ? parseInt(params.baseline as string, 10) : 10;

  const [reductionPercent, setReductionPercent] = useState(5);
  const s = useMemo(
    () => createStyles(getColors(colorScheme === 'dark' ? 'dark' : 'light')),
    [colorScheme],
  );

  const handleNext = () => {
    router.push({
      pathname: '/(onboarding)/price',
      params: {
        baseline: baseline.toString(),
        pace: reductionPercent.toString(),
      },
    });
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.content}>
          <View style={s.questionSection}>
            <Text style={s.question}>How fast do you want to reduce?</Text>
            <Text style={s.hint}>
              This is how much your daily allowance drops each week. You can change it later in Settings.
            </Text>
          </View>

          <View style={s.presets}>
            {REDUCTION_PRESETS.map((preset) => {
              const isSelected = preset.value === reductionPercent;
              return (
                <Pressable
                  key={preset.value}
                  onPress={() => setReductionPercent(preset.value)}
                  style={[s.preset, isSelected && s.presetSelected]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`${preset.label} weekly reduction`}
                  accessibilityHint={preset.description}
                >
                  <View style={s.presetHeader}>
                    <Text style={[s.presetLabel, isSelected && s.presetLabelSelected]}>
                      {preset.label}
                    </Text>
                    <View style={[s.radio, isSelected && s.radioSelected]}>
                      {isSelected ? <View style={s.radioInner} /> : null}
                    </View>
                  </View>
                  <Text style={[s.presetDescription, isSelected && s.presetDescriptionSelected]}>
                    {preset.description}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={s.spacer} />

          <Button title="Next" onPress={handleNext} style={s.button} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const createStyles = (colors: ReturnType<typeof useDesignTokens>['colors']) =>
  StyleSheet.create({
    scrollContent: { flexGrow: 1 } as ViewStyle,
    content: {
      flex: 1,
      paddingTop: spacing.xl,
      paddingBottom: spacing.lg,
    } as ViewStyle,
    questionSection: { marginBottom: spacing.xxl } as ViewStyle,
    question: {
      fontSize: typography.sizes.xl,
      lineHeight: 30,
      fontWeight: `${typography.weights.bold}`,
      color: colors.text.primary,
      marginBottom: spacing.sm,
    } as TextStyle,
    hint: {
      fontSize: typography.sizes.sm,
      lineHeight: typography.lineHeights.tight,
      color: colors.text.secondary,
    } as TextStyle,
    presets: { gap: spacing.sm } as ViewStyle,
    preset: {
      padding: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border.subtle,
      backgroundColor: colors.background.card,
      gap: spacing.xs,
    } as ViewStyle,
    presetSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '14',
    } as ViewStyle,
    presetHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    } as ViewStyle,
    presetLabel: {
      fontSize: typography.sizes.lg,
      fontWeight: `${typography.weights.bold}`,
      color: colors.text.primary,
    } as TextStyle,
    presetLabelSelected: { color: colors.primary } as TextStyle,
    presetDescription: {
      fontSize: typography.sizes.sm,
      color: colors.text.secondary,
      lineHeight: typography.lineHeights.tight,
    } as TextStyle,
    presetDescriptionSelected: { color: colors.text.primary } as TextStyle,
    radio: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.border.default,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,
    radioSelected: { borderColor: colors.primary } as ViewStyle,
    radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.primary,
    } as ViewStyle,
    spacer: { flex: 1, minHeight: spacing.xl } as ViewStyle,
    button: { marginBottom: spacing.sm } as ViewStyle,
  });
