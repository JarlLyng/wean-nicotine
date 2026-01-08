import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { spacing } from '@/lib/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
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

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/(onboarding)/baseline')}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
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
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.lg,
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: spacing.sm,
  },
  button: {
    backgroundColor: '#0a7ea4',
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
