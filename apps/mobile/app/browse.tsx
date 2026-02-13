import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { FoodCard } from '../components/FoodCard';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../lib/theme';
import { fetchRecommendations } from '../lib/api';
import type { FoodCardData, FoodCategory } from '@seasonscope/shared';

const CATEGORIES: { id: string; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'produce', label: 'Produce' },
  { id: 'meat', label: 'Meat' },
  { id: 'dairy', label: 'Dairy' },
  { id: 'grains', label: 'Grains' },
  { id: 'legumes', label: 'Legumes' },
  { id: 'oils_sweeteners', label: 'Oils' },
];

export default function BrowseScreen() {
  const [category, setCategory] = useState('all');
  const [foods, setFoods] = useState<FoodCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const month = new Date().getMonth() + 1;
    fetchRecommendations('US', month)
      .then((data) => {
        const all: FoodCardData[] = [
          ...(data.inSeason || []),
          ...(data.lowestCo2e || []),
          ...(data.proteinChoices || []),
          ...(data.staples || []),
        ];
        const seen = new Set<string>();
        const deduped = all.filter((item) => {
          if (seen.has(item.food.id)) return false;
          seen.add(item.food.id);
          if (category !== 'all' && item.food.category !== category) return false;
          return true;
        });
        setFoods(deduped);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [category]);

  return (
    <ScrollView style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
        <View style={styles.categoriesInner}>
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => setCategory(cat.id)}
              style={[styles.categoryPill, category === cat.id && styles.categoryPillActive]}
            >
              <Text style={[styles.categoryText, category === cat.id && styles.categoryTextActive]}>
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary[600]} style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.list}>
          <Text style={styles.count}>{foods.length} items</Text>
          {foods.map((item) => (
            <FoodCard key={item.food.id} data={item} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  categories: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  categoriesInner: { flexDirection: 'row', gap: spacing.sm },
  categoryPill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.surface,
  },
  categoryPillActive: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[200],
  },
  categoryText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textSecondary },
  categoryTextActive: { color: colors.primary[700] },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing['5xl'] },
  count: { fontSize: fontSize.xs, color: colors.textMuted, marginBottom: spacing.md },
});
