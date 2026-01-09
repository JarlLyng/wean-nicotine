import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { spacing, colors } from '@/lib/theme';

export default function BaselineScreen() {
  const router = useRouter();
  const [baseline, setBaseline] = useState('');
  const [error, setError] = useState('');

  const handleNext = () => {
    const value = parseInt(baseline, 10);
    
    if (!baseline || isNaN(value) || value < 1 || value > 100) {
      setError('Please enter a number between 1 and 100');
      return;
    }

    setError('');
    router.push({
      pathname: '/(onboarding)/price',
      params: { baseline: value.toString() },
    });
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Set Your Baseline</Text>
          <Text style={styles.description}>
            How many pouches do you typically use per day?
          </Text>
          <Text style={styles.hint}>
            Be honest — this helps us create a realistic plan for you.
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={baseline}
              onChangeText={(text) => {
                setBaseline(text);
                setError('');
              }}
              placeholder="e.g., 10"
              keyboardType="number-pad"
              autoFocus
            />
            <Text style={styles.inputLabel}>pouches per day</Text>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => router.push('/(onboarding)/price')}>
            <Text style={styles.skipButtonText}>Skip for now</Text>
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 18,
    color: '#333',
    marginBottom: spacing.xs,
  },
  hint: {
    fontSize: 14,
    color: '#666',
    marginBottom: spacing.xl,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 24,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  error: {
    color: '#d32f2f',
    fontSize: 14,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.accentStart,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  buttonText: {
    color: colors.text.inverse,
    fontSize: 18,
    fontWeight: '600',
  },
  skipButton: {
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  skipButtonText: {
    color: '#666',
    fontSize: 16,
  },
});
