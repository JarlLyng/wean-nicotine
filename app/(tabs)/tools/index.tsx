import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { spacing, typography, borderRadius, animations } from '@/lib/theme';
import { useDesignTokens } from '@/lib/design';

const TOOLS = [
  {
    id: 'breathing',
    title: 'Breathing Exercise',
    description: 'A guided breathing exercise to help you pause and refocus',
    icon: 'wind' as const,
  },
  {
    id: 'reflection',
    title: 'Reflection Prompts',
    description: 'Thoughtful questions to help you understand your patterns',
    icon: 'brain' as const,
  },
  {
    id: 'urge-surfing',
    title: 'Urge Surfing',
    description: 'Learn how to ride out cravings like a wave',
    icon: 'waves' as const,
  },
];

export default function ToolsScreen() {
  const { colors } = useDesignTokens();
  const router = useRouter();
  const toolsStyles = createToolsStyles(colors);

  return (
    <Screen title="Support Tools">
      <ScrollView contentContainerStyle={toolsStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={toolsStyles.content}>
          <Text style={toolsStyles.subtitle}>
            Tools to help you through cravings and difficult moments. Use them whenever you need
            support.
          </Text>

          <View style={toolsStyles.toolsContainer}>
            {TOOLS.map((tool, index) => (
              <Animated.View
                key={tool.id}
                entering={FadeInDown.delay(index * 100).duration(animations.normal).springify()}>
                <TouchableOpacity
                  onPress={() => router.push(`/(tabs)/tools/${tool.id}` as any)}>
                  <Card variant="elevated" style={toolsStyles.toolCard} padding="lg">
                    <View style={toolsStyles.iconContainer}>
                      <Icon name={tool.icon} size={48} color={colors.primary} weight="duotone" />
                    </View>
                    <Text style={toolsStyles.toolTitle}>{tool.title}</Text>
                    <Text style={toolsStyles.toolDescription}>{tool.description}</Text>
                  </Card>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          <Card variant="flat" style={toolsStyles.infoBox} padding="md">
            <Text style={toolsStyles.infoText}>
              Remember: setbacks are part of the journey. These tools are here to support you,
              not to judge you.
            </Text>
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}

const createToolsStyles = (colors: ReturnType<typeof useDesignTokens>['colors']) => StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingTop: spacing.lg,
    // Match preview: remove left/right padding, keep top padding
    paddingHorizontal: 0,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
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
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  toolDescription: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  infoText: {
    ...typography.caption,
    color: colors.success,
    textAlign: 'center',
  },
});
