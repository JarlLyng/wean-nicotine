import { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useFocusEffect } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Icon } from '@/components/ui/Icon';
import { spacing, borderRadius } from '@/lib/theme';
import { useDesignTokens, typography } from '@/lib/design';
import { getReflections, deleteReflection } from '@/lib/db-reflections';
import { captureError } from '@/lib/sentry';
import type { Reflection } from '@/lib/models';

function formatDate(ts: number): string {
  const d = new Date(ts);
  const day = d.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default function ReflectionJournalScreen() {
  const { colors } = useDesignTokens();
  const [entries, setEntries] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const s = useMemo(() => createStyles(colors), [colors]);

  const loadEntries = useCallback(async () => {
    try {
      const data = await getReflections({ limit: 100 });
      setEntries(data);
    } catch (e) {
      if (e instanceof Error) captureError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [loadEntries]),
  );

  const handleDelete = (entry: Reflection) => {
    Alert.alert('Delete Reflection', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteReflection(entry.id);
            setEntries((prev) => prev.filter((e) => e.id !== entry.id));
          } catch (e) {
            if (e instanceof Error) captureError(e);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item, index }: { item: Reflection; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(200)}>
      <View style={s.card}>
        <View style={s.cardHeader}>
          <Text style={s.date}>{formatDate(item.createdAt)}</Text>
          <View style={s.categoryChip}>
            <Text style={s.categoryText}>{item.category}</Text>
          </View>
        </View>
        <Text style={s.prompt}>{item.promptText}</Text>
        <Text style={s.note}>{item.note}</Text>
        <TouchableOpacity style={s.deleteButton} onPress={() => handleDelete(item)}>
          <Icon name="trash" size={16} color={colors.text.tertiary} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  if (!loading && entries.length === 0) {
    return (
      <Screen>
        <View style={s.emptyContainer}>
          <Icon name="notebook" size={48} color={colors.text.tertiary} />
          <Text style={s.emptyTitle}>No reflections yet</Text>
          <Text style={s.emptyText}>
            Start by answering a prompt and saving your thoughts.
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        data={entries}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const createStyles = (colors: ReturnType<typeof useDesignTokens>['colors']) =>
  StyleSheet.create({
    listContent: {
      paddingTop: spacing.md,
      paddingBottom: spacing.lg,
    },
    card: {
      backgroundColor: colors.background.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    date: {
      fontSize: typography.sizes.sm,
      color: colors.text.secondary,
    },
    categoryChip: {
      backgroundColor: colors.primary + '18',
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: 9999,
    },
    categoryText: {
      fontSize: typography.sizes.xs,
      fontWeight: '500' as const,
      color: colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    prompt: {
      fontSize: typography.sizes.base,
      fontWeight: '500' as const,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    note: {
      fontSize: typography.sizes.base,
      color: colors.text.secondary,
      lineHeight: typography.lineHeights.normal,
    },
    deleteButton: {
      alignSelf: 'flex-end',
      padding: spacing.xs,
      marginTop: spacing.xs,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
    },
    emptyTitle: {
      fontSize: typography.sizes.lg,
      fontWeight: `${typography.weights.semibold}`,
      color: colors.text.primary,
      marginTop: spacing.md,
      marginBottom: spacing.xs,
    },
    emptyText: {
      fontSize: typography.sizes.base,
      color: colors.text.secondary,
      textAlign: 'center',
    },
  });
