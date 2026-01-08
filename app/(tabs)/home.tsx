import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { StatCard } from '@/components/ui/StatCard';
import { spacing, colors, typography } from '@/lib/theme';
import { getTaperSettings } from '@/lib/db-settings';
import { getUserPlan } from '@/lib/db-user-plan';
import { calculateDailyAllowance } from '@/lib/taper-plan';
import { createLogEntry, countLogEntriesByType } from '@/lib/db-log-entries';
import { saveUserPlan } from '@/lib/db-user-plan';
import { generateSuggestions, type Suggestion } from '@/lib/suggestions';
import type { TaperSettings, UserPlan } from '@/lib/models';
import * as Haptics from 'expo-haptics';

export default function HomeScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<TaperSettings | null>(null);
  const [plan, setPlan] = useState<UserPlan | null>(null);
  const [dailyAllowance, setDailyAllowance] = useState(0);
  const [usedToday, setUsedToday] = useState(0);
  const [resistedToday, setResistedToday] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLogging, setIsLogging] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const loadData = async () => {
    try {
      const currentSettings = await getTaperSettings();
      const currentPlan = await getUserPlan();

      if (!currentSettings) {
        // No settings means onboarding not completed
        router.replace('/(onboarding)');
        return;
      }

      setSettings(currentSettings);

      // Calculate current daily allowance
      const today = new Date();
      const allowance = calculateDailyAllowance(currentSettings, today);
      setDailyAllowance(allowance);

      // Update plan if needed (recalculate daily)
      if (currentPlan) {
        const planDate = new Date(currentPlan.lastCalculatedDate);
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const planDateStart = new Date(planDate.getFullYear(), planDate.getMonth(), planDate.getDate());

        if (planDateStart.getTime() !== todayStart.getTime()) {
          // Recalculate for new day
          await saveUserPlan({
            settingsId: currentSettings.id,
            currentDailyAllowance: allowance,
            lastCalculatedDate: Date.now(),
          });
          const updatedPlan = await getUserPlan();
          setPlan(updatedPlan);
        } else {
          setPlan(currentPlan);
        }
      }

      // Get today's logs
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
      
      const used = await countLogEntriesByType('pouch_used', todayStart.getTime(), todayEnd.getTime());
      const resisted = await countLogEntriesByType('craving_resisted', todayStart.getTime(), todayEnd.getTime());
      
      setUsedToday(used);
      setResistedToday(resisted);

      // Generate suggestions
      const currentSuggestions = await generateSuggestions(currentSettings);
      setSuggestions(currentSuggestions);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleLogPouch = async () => {
    if (isLogging) return;
    
    setIsLogging(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await createLogEntry('pouch_used');
      await loadData();
    } catch (error) {
      console.error('Error logging pouch:', error);
      alert('Failed to log. Please try again.');
    } finally {
      setIsLogging(false);
    }
  };

  const handleLogResisted = async () => {
    if (isLogging) return;
    
    setIsLogging(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await createLogEntry('craving_resisted');
      await loadData();
    } catch (error) {
      console.error('Error logging resisted:', error);
      alert('Failed to log. Please try again.');
    } finally {
      setIsLogging(false);
    }
  };

  const remaining = Math.max(0, dailyAllowance - usedToday);
  const exceeded = usedToday > dailyAllowance;
  const progress = dailyAllowance > 0 ? Math.min(1, usedToday / dailyAllowance) : 0;

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadData} />}>
        <View style={styles.content}>
          <Text style={styles.title}>Today</Text>

          {/* Daily Allowance Card with Progress Ring */}
          <Card variant="elevated" style={styles.allowanceCard} padding="lg">
            <Text style={styles.cardLabel}>Daily Allowance</Text>
            <View style={styles.progressContainer}>
              <ProgressRing
                progress={progress}
                size={140}
                strokeWidth={10}
                label={dailyAllowance.toFixed(1)}
                sublabel="pouches"
                color={exceeded ? colors.semantic.warning.main : colors.accent.primary}
                backgroundColor={colors.neutral[200]}
              />
            </View>
            {exceeded && (
              <View style={styles.exceededBadge}>
                <Text style={styles.exceededText}>
                  You've exceeded your limit today. That's okay — progress isn't always perfect.
                </Text>
              </View>
            )}
          </Card>

          {/* Usage Stats */}
          <View style={styles.statsContainer}>
            <StatCard value={usedToday} label="Used" />
            <StatCard
              value={remaining.toFixed(1)}
              label="Remaining"
              variant={exceeded ? 'warning' : 'default'}
            />
            <StatCard value={resistedToday} label="Resisted" variant="highlight" />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <Button
              title="Used a Pouch"
              onPress={handleLogPouch}
              variant="primary"
              loading={isLogging}
              accessibilityLabel="Log that you used a pouch"
              accessibilityHint="Records a pouch usage for today"
            />
            <Button
              title="Craving Resisted"
              onPress={handleLogResisted}
              variant="secondary"
              loading={isLogging}
              accessibilityLabel="Log that you resisted a craving"
              accessibilityHint="Records that you successfully resisted a craving"
            />
          </View>

          {/* Smart Suggestions */}
          {suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Suggestions</Text>
              {suggestions.map((suggestion) => (
                <Card key={suggestion.id} variant="flat" style={styles.suggestionCard}>
                  <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                  <Text style={styles.suggestionMessage}>{suggestion.message}</Text>
                  {suggestion.actionLabel && suggestion.actionRoute && (
                    <Button
                      title={suggestion.actionLabel}
                      onPress={() => router.push(suggestion.actionRoute as any)}
                      variant="ghost"
                      style={styles.suggestionButton}
                    />
                  )}
                </Card>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.base,
    color: colors.text.secondary,
  },
  title: {
    ...typography['3xl'],
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  allowanceCard: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  cardLabel: {
    ...typography.sm,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  progressContainer: {
    marginVertical: spacing.sm,
  },
  exceededBadge: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.semantic.warning.light,
    borderRadius: 8,
    width: '100%',
  },
  exceededText: {
    ...typography.sm,
    color: colors.semantic.warning.dark,
    textAlign: 'center',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  actionsContainer: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  suggestionsContainer: {
    marginTop: spacing.xl,
  },
  suggestionsTitle: {
    ...typography.xl,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  suggestionCard: {
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.semantic.info.main,
  },
  suggestionTitle: {
    ...typography.lg,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  suggestionMessage: {
    ...typography.base,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  suggestionButton: {
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
});
