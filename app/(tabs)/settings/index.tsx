import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { spacing } from '@/lib/theme';
import { getTaperSettings } from '@/lib/db-settings';
import type { TaperSettings } from '@/lib/models';

export default function SettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<TaperSettings | null>(null);

  const loadData = async () => {
    try {
      const currentSettings = await getTaperSettings();
      setSettings(currentSettings);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Settings</Text>

          {/* Reset Taper Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Taper Plan</Text>
            <Text style={styles.sectionDescription}>
              If you've had a setback or want to start fresh, you can reset your taper plan.
            </Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => router.push('/(tabs)/settings/reset-taper')}>
              <Text style={styles.resetButtonText}>Reset Taper Plan</Text>
            </TouchableOpacity>
          </View>

          {/* Notifications Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            <Text style={styles.sectionDescription}>
              Manage your notification preferences for daily check-ins and reminders.
            </Text>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => router.push('/(tabs)/settings/notifications')}>
              <Text style={styles.settingsButtonText}>Notification Settings</Text>
            </TouchableOpacity>
          </View>

          {/* Current Settings Info */}
          {settings && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Current Settings</Text>
              <Text style={styles.info}>Baseline: {settings.baselinePouchesPerDay} pouches/day</Text>
              <Text style={styles.info}>
                Weekly Reduction: {settings.weeklyReductionPercent}%
              </Text>
              {settings.pricePerCan && (
                <Text style={styles.info}>
                  Price per can: ${(settings.pricePerCan / 100).toFixed(2)}
                </Text>
              )}
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: spacing.sm,
    color: '#333',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  info: {
    fontSize: 14,
    marginBottom: spacing.xs,
    color: '#333',
  },
  resetButton: {
    backgroundColor: '#d32f2f',
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsButton: {
    backgroundColor: '#0a7ea4',
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  settingsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
