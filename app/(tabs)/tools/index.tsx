import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { spacing } from '@/lib/theme';

const TOOLS = [
  {
    id: 'breathing',
    title: 'Breathing Exercise',
    description: 'A guided breathing exercise to help you pause and refocus',
    icon: '🫁',
  },
  {
    id: 'urge-surfing',
    title: 'Urge Surfing',
    description: 'Learn how to ride out cravings like a wave',
    icon: '🌊',
  },
  {
    id: 'reflection',
    title: 'Reflection Prompts',
    description: 'Thoughtful questions to help you understand your patterns',
    icon: '💭',
  },
];

export default function ToolsScreen() {
  const router = useRouter();

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Support Tools</Text>
          <Text style={styles.subtitle}>
            Tools to help you through cravings and difficult moments. Use them whenever you need
            support.
          </Text>

          <View style={styles.toolsContainer}>
            {TOOLS.map((tool) => (
              <TouchableOpacity
                key={tool.id}
                style={styles.toolCard}
                onPress={() => router.push(`/(tabs)/tools/${tool.id}` as any)}>
                <Text style={styles.toolIcon}>{tool.icon}</Text>
                <Text style={styles.toolTitle}>{tool.title}</Text>
                <Text style={styles.toolDescription}>{tool.description}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Remember: setbacks are part of the journey. These tools are here to support you,
              not to judge you.
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
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  toolsContainer: {
    gap: spacing.md,
  },
  toolCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  toolIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  toolTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  toolDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  infoBox: {
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  infoText: {
    fontSize: 14,
    color: '#2e7d32',
    lineHeight: 20,
    textAlign: 'center',
  },
});
