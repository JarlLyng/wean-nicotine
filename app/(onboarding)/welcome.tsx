import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useDesignTokens } from '@/lib/design';
import { spacing, typography, borderRadius } from '@/lib/theme';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const STEPS = [
  { icon: 'chart-line-up' as const, title: 'Set your baseline', description: 'Tell us your current daily usage' },
  { icon: 'calendar' as const, title: 'Follow your plan', description: 'A gradual reduction — at your pace' },
  { icon: 'check-circle' as const, title: 'Track progress', description: 'Log usage, resist cravings, see results' },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors } = useDesignTokens();
  const s = useMemo(() => createStyles(colors), [colors]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={s.content}>
          {/* Hero */}
          <Animated.View entering={FadeInDown.duration(400)} style={s.hero}>
            <Text style={s.heroTitle}>Take back control</Text>
            <Text style={s.heroSubtitle}>
              Wean helps you gradually reduce your snus usage — gently, sustainably, and without pressure.
            </Text>
          </Animated.View>

          {/* Steps */}
          <View style={s.stepsContainer}>
            {STEPS.map((step, i) => (
              <Animated.View
                key={step.title}
                entering={FadeInDown.delay(150 + i * 100).duration(350).springify()}
                style={s.stepRow}>
                <View style={[s.stepIcon, { backgroundColor: colors.primary + '14' }]}>
                  <Icon name={step.icon} size={22} color={colors.primary} weight="regular" />
                </View>
                <View style={s.stepText}>
                  <Text style={s.stepTitle}>{step.title}</Text>
                  <Text style={s.stepDescription}>{step.description}</Text>
                </View>
              </Animated.View>
            ))}
          </View>

          {/* Reassurance */}
          <Animated.View entering={FadeInDown.delay(500).duration(350)}>
            <Text style={s.reassurance}>
              No judgment, no streak pressure. Start over anytime.
            </Text>
          </Animated.View>

          {/* CTA */}
          <Animated.View entering={FadeInDown.delay(600).duration(350)}>
            <Button
              title="Get Started"
              onPress={() => router.push('/(onboarding)/baseline')}
              style={s.button}
            />
            <Text style={s.duration}>Takes less than a minute</Text>
          </Animated.View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const createStyles = (colors: ReturnType<typeof useDesignTokens>['colors']) =>
  StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
    } as ViewStyle,
    content: {
      flex: 1,
      paddingTop: spacing.xl,
      paddingHorizontal: 0,
      paddingBottom: spacing.lg,
    } as ViewStyle,

    // Hero
    hero: {
      marginBottom: spacing.xxxl,
    } as ViewStyle,
    heroTitle: {
      ...typography.title,
      color: colors.text.primary,
      marginBottom: spacing.sm,
    } as TextStyle,
    heroSubtitle: {
      ...typography.body,
      color: colors.text.secondary,
      lineHeight: 22,
    } as TextStyle,

    // Steps
    stepsContainer: {
      gap: spacing.lg,
      marginBottom: spacing.xxxl,
    } as ViewStyle,
    stepRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    } as ViewStyle,
    stepIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,
    stepText: {
      flex: 1,
    } as ViewStyle,
    stepTitle: {
      ...typography.body,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 2,
    } as TextStyle,
    stepDescription: {
      ...typography.sm,
      color: colors.text.secondary,
    } as TextStyle,

    // Reassurance
    reassurance: {
      ...typography.sm,
      color: colors.text.tertiary,
      textAlign: 'center',
      marginBottom: spacing.xl,
    } as TextStyle,

    // CTA
    button: {
      marginBottom: spacing.sm,
    } as ViewStyle,
    duration: {
      ...typography.xs,
      color: colors.text.tertiary,
      textAlign: 'center',
    } as TextStyle,
  });
