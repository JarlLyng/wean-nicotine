import { View, Text, StyleSheet } from 'react-native';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/ui/Card';
import { spacing, colors, typography } from '@/lib/theme';

export default function HomeScreen() {
  return (
    <Screen variant="gradient" title="Today">
      <View style={styles.content}>
        {/* Surface card with placeholder content */}
        <Card variant="elevated" style={styles.placeholderCard} padding="lg">
          <Text style={styles.placeholderText}>
            Daily allowance will appear here
          </Text>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: spacing.lg,
  },
  placeholderCard: {
    marginTop: spacing.md,
  },
  placeholderText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
