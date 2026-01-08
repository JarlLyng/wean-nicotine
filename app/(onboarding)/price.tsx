import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/Screen';
import { spacing } from '@/lib/theme';

export default function PriceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const baseline = params.baseline ? parseInt(params.baseline as string, 10) : 10;
  
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');

  const handleNext = () => {
    if (price && price.trim() !== '') {
      const value = parseFloat(price);
      if (isNaN(value) || value < 0) {
        setError('Please enter a valid price');
        return;
      }
    }

    setError('');
    router.push({
      pathname: '/(onboarding)/triggers',
      params: {
        baseline: baseline.toString(),
        price: price || '0',
      },
    });
  };

  const handleSkip = () => {
    router.push({
      pathname: '/(onboarding)/triggers',
      params: {
        baseline: baseline.toString(),
        price: '0',
      },
    });
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Price Per Can (Optional)</Text>
          <Text style={styles.description}>
            If you'd like to track money saved, enter the price you pay per can.
          </Text>
          <Text style={styles.hint}>
            You can skip this and add it later in settings.
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={(text) => {
                setPrice(text);
                setError('');
              }}
              placeholder="e.g., 50.00"
              keyboardType="decimal-pad"
            />
            <Text style={styles.inputLabel}>price per can</Text>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip</Text>
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
