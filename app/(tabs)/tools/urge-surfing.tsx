import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Screen } from '@/components/Screen';
import { spacing, colors } from '@/lib/theme';

export default function UrgeSurfingScreen() {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Urge Surfing</Text>
          <Text style={styles.subtitle}>
            A technique to help you ride out cravings without giving in
          </Text>

          <View style={styles.section}>
            <Text style={styles.heading}>What is Urge Surfing?</Text>
            <Text style={styles.text}>
              Urge surfing is a mindfulness technique where you observe your craving like a wave —
              noticing it rise, peak, and fall — without acting on it.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.heading}>How to Practice</Text>
            <View style={styles.stepContainer}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>
                <Text style={styles.stepTitle}>Notice the urge.</Text> When a craving appears, don&apos;t
                fight it. Simply acknowledge it: &quot;I&apos;m having a craving right now.&quot;
              </Text>
            </View>

            <View style={styles.stepContainer}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>
                <Text style={styles.stepTitle}>Observe without judgment.</Text> Notice where you
                feel it in your body. Is it tension? Restlessness? Just observe, without judging
                yourself.
              </Text>
            </View>

            <View style={styles.stepContainer}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>
                <Text style={styles.stepTitle}>Ride the wave.</Text> Cravings are temporary. Like a
                wave, they build, peak, and then subside. Remind yourself: &quot;This will pass.&quot;
              </Text>
            </View>

            <View style={styles.stepContainer}>
              <Text style={styles.stepNumber}>4</Text>
              <Text style={styles.stepText}>
                <Text style={styles.stepTitle}>Breathe through it.</Text> Take slow, deep breaths.
                Focus on your breathing as the craving peaks and begins to fade.
              </Text>
            </View>

            <View style={styles.stepContainer}>
              <Text style={styles.stepNumber}>5</Text>
              <Text style={styles.stepText}>
                <Text style={styles.stepTitle}>Notice it passing.</Text> As the urge subsides,
                acknowledge that you rode it out. Each time you do this, it gets easier.
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.heading}>Remember</Text>
            <Text style={styles.text}>
              Cravings typically peak within 5-15 minutes and then fade. You don&apos;t have to act on
              them. Each time you successfully ride out a craving, you&apos;re strengthening your ability
              to handle them.
            </Text>
          </View>

          <View style={styles.encouragementBox}>
            <Text style={styles.encouragementText}>
              You&apos;ve got this. Every wave passes, and you&apos;re learning to surf.
            </Text>
          </View>
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  section: {
    marginBottom: spacing.xl,
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: spacing.md,
    color: '#333',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: spacing.sm,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  stepNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.accentStart,
    width: 40,
    marginRight: spacing.md,
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  stepTitle: {
    fontWeight: '600',
    color: colors.accentStart,
  },
  encouragementBox: {
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  encouragementText: {
    fontSize: 16,
    color: '#2e7d32',
    lineHeight: 24,
    textAlign: 'center',
    fontWeight: '500',
  },
});
