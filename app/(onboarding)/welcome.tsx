import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useDesignTokens } from '@/lib/design';
import { spacing, typography } from '@/lib/theme';
import { ScrollView, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors } = useDesignTokens();
  const styles = createStyles(colors);

  return (
    <Screen title="Welcome">
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Card variant="flat" style={styles.card} padding="lg">
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
                • Start over anytime — no judgment
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.text}>
                Let&apos;s get started. This will only take a minute.
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

const createStyles = (colors: ReturnType<typeof useDesignTokens>['colors']) => {
  const styles = {
    scrollContent: {
      flexGrow: 1,
    } as ViewStyle,
    content: {
      flex: 1,
      paddingTop: spacing.lg,
      // Screen-komponenten giver allerede horizontal padding
      paddingHorizontal: 0,
      paddingBottom: spacing.lg,
    } as ViewStyle,
    card: {
      marginBottom: spacing.lg,
    } as ViewStyle,
    section: {
      marginBottom: spacing.lg,
    } as ViewStyle,
    heading: {
      ...typography.xl,
      fontWeight: '600' as const,
      color: colors.text.primary,
      marginBottom: spacing.sm,
    } as TextStyle,
    text: {
      ...typography.body,
      color: colors.text.secondary,
      marginBottom: spacing.sm,
    } as TextStyle,
    button: {
      marginTop: spacing.md,
    } as ViewStyle,
  };
  return StyleSheet.create(styles);
};
