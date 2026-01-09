import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { spacing, colors, typography, borderRadius } from '@/lib/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <Screen variant="gradient" title="Welcome">
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Card variant="flat" style={styles.card} padding="lg">
            <Text style={styles.title}>Welcome to Taper</Text>
            
            <View style={styles.section}>
              <Text style={styles.heading}>What is tapering?</Text>
              <Text style={styles.text}>
                Tapering means gradually reducing your snus usage over time, rather than quitting all at once.
              </Text>
              <Text style={styles.text}>
                This approach is gentler, more sustainable, and gives you control over your pace.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.heading}>How it works</Text>
              <Text style={styles.text}>
                • Set your baseline (current daily usage){'\n'}
                • Follow a gradual reduction plan{'\n'}
                • Track your progress without pressure{'\n'}
                • Adjust as needed — no judgment
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.text}>
                Let's get started. This will only take a minute.
              </Text>
            </View>
          </Card>

          <Button
            title="Get Started"
            onPress={() => router.push('/(onboarding)/baseline')}
            style={styles.button}
          />
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
  card: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography['3xl'],
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.lg,
  },
  heading: {
    ...typography.xl,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  text: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  button: {
    marginTop: spacing.md,
  },
});
