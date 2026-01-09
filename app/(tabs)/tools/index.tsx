import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { spacing, colors, typography, borderRadius, animations } from '@/lib/theme';

const TOOLS = [
  {
    id: 'breathing',
    title: 'Breathing Exercise',
    description: 'A guided breathing exercise to help you pause and refocus',
    icon: 'wind' as const,
  },
  {
    id: 'urge-surfing',
    title: 'Urge Surfing',
    description: 'Learn how to ride out cravings like a wave',
    icon: 'waves' as const,
  },
  {
    id: 'reflection',
    title: 'Reflection Prompts',
    description: 'Thoughtful questions to help you understand your patterns',
    icon: 'brain' as const,
  },
];

export default function ToolsScreen() {
  const router = useRouter();

  return (
    <Screen variant="gradient" title="Support Tools">
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.subtitle}>
            Tools to help you through cravings and difficult moments. Use them whenever you need
            support.
          </Text>

          <View style={styles.toolsContainer}>
            {TOOLS.map((tool, index) => (
              <Animated.View
                key={tool.id}
                entering={FadeInDown.delay(index * 100).duration(animations.normal).springify()}>
                <TouchableOpacity
                  onPress={() => router.push(`/(tabs)/tools/${tool.id}` as any)}>
                  <Card variant="elevated" style={styles.toolCard} padding="lg">
                    <View style={styles.iconContainer}>
                      <Icon name={tool.icon} size={48} color={colors.accentStart} weight="duotone" />
                    </View>
                    <Text style={styles.toolTitle}>{tool.title}</Text>
                    <Text style={styles.toolDescription}>{tool.description}</Text>
                  </Card>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          <Card variant="flat" style={styles.infoBox} padding="md">
            <Text style={styles.infoText}>
              Remember: setbacks are part of the journey. These tools are here to support you,
              not to judge you.
            </Text>
          </Card>
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
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  toolsContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  toolCard: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolTitle: {
    ...typography.xl,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  toolDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: colors.semantic.success.light,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  infoText: {
    ...typography.caption,
    color: colors.semantic.success.dark,
    textAlign: 'center',
  },
});
