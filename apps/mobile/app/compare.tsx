import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Badge, getCo2eBadgeVariant } from '../components/Badge';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../lib/theme';
import { fetchFoodDetail, searchFoods } from '../lib/api';
import type { FoodCardData } from '@seasonscope/shared';

export default function CompareScreen() {
  const { a: initialA } = useLocalSearchParams<{ a?: string }>();
  const [foodA, setFoodA] = useState<FoodCardData | null>(null);
  const [foodB, setFoodB] = useState<FoodCardData | null>(null);
  const [searchA, setSearchA] = useState('');
  const [searchB, setSearchB] = useState('');
  const [resultsA, setResultsA] = useState<any[]>([]);
  const [resultsB, setResultsB] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const month = new Date().getMonth() + 1;

  const loadFood = async (id: string): Promise<FoodCardData | null> => {
    try {
      const data = await fetchFoodDetail(id, 'US', month);
      return data.card || null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (initialA) loadFood(initialA).then(setFoodA);
  }, [initialA]);

  const doSearch = async (term: string, setter: (r: any[]) => void) => {
    if (!term.trim()) { setter([]); return; }
    try {
      const data = await searchFoods(term, 6);
      setter(data.results || []);
    } catch { setter([]); }
  };

  const selectFood = async (id: string, side: 'a' | 'b') => {
    setLoading(true);
    const food = await loadFood(id);
    if (side === 'a') { setFoodA(food); setSearchA(''); setResultsA([]); }
    else { setFoodB(food); setSearchB(''); setResultsB([]); }
    setLoading(false);
  };

  const winner = foodA && foodB
    ? foodA.ghg.value_mid <= foodB.ghg.value_mid ? 'a' : 'b'
    : null;

  const renderSelector = (
    food: FoodCardData | null,
    side: 'a' | 'b',
    search: string,
    setSearch: (s: string) => void,
    results: any[],
    setResults: (r: any[]) => void
  ) => (
    <View style={styles.column}>
      <TextInput
        value={search}
        onChangeText={(t) => { setSearch(t); doSearch(t, setResults); }}
        placeholder="Search a food..."
        placeholderTextColor={colors.textMuted}
        style={styles.searchInput}
      />
      {results.length > 0 && (
        <View style={styles.dropdown}>
          {results.map((r: any) => (
            <Pressable key={r.food_id} onPress={() => selectFood(r.food_id, side)} style={styles.dropdownItem}>
              <Text style={styles.dropdownText}>{r.canonical_name.replace(/_/g, ' ')}</Text>
            </Pressable>
          ))}
        </View>
      )}
      {food ? (
        <View style={[styles.foodCard, winner === side && styles.foodCardWinner]}>
          <Text style={styles.foodName}>{food.food.canonical_name.replace(/_/g, ' ')}</Text>
          <View style={styles.co2eRow}>
            <Text style={styles.co2eValue}>{food.ghg.value_mid.toFixed(1)}</Text>
            <Text style={styles.co2eUnit}>kg CO₂e/kg</Text>
          </View>
          <View style={styles.badges}>
            <Badge variant={getCo2eBadgeVariant(food.ghg.value_mid)} />
            {food.seasonality?.in_season_probability >= 0.5 && <Badge variant="in_season" />}
          </View>
        </View>
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Select a food</Text>
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Compare Foods</Text>
      <Text style={styles.subtitle}>Compare environmental impact side by side.</Text>

      <View style={styles.columns}>
        {renderSelector(foodA, 'a', searchA, setSearchA, resultsA, setResultsA)}
        <View style={styles.vsCircle}><Text style={styles.vsText}>vs</Text></View>
        {renderSelector(foodB, 'b', searchB, setSearchB, resultsB, setResultsB)}
      </View>

      {loading && <ActivityIndicator color={colors.primary[600]} style={{ marginTop: 20 }} />}

      {foodA && foodB && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Result</Text>
          <Text style={styles.resultText}>
            {(winner === 'a' ? foodA : foodB).food.canonical_name.replace(/_/g, ' ')} has lower estimated CO₂e at{' '}
            {(winner === 'a' ? foodA : foodB).ghg.value_mid.toFixed(1)} vs{' '}
            {(winner === 'a' ? foodB : foodA).ghg.value_mid.toFixed(1)} kg CO₂e/kg.
          </Text>
          <Text style={styles.caveat}>
            Based on global average data. Actual impact depends on sourcing, transport, and production system.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing['5xl'] },
  title: { fontSize: fontSize['2xl'], fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.xs },
  subtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xl },
  columns: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  column: { flex: 1 },
  searchInput: {
    height: 40,
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.sm,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    marginBottom: spacing.sm,
  },
  dropdown: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  dropdownText: { fontSize: fontSize.sm, color: colors.text, textTransform: 'capitalize' },
  foodCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.neutral[200],
    padding: spacing.md,
  },
  foodCardWinner: { borderColor: colors.primary[300], backgroundColor: colors.primary[50] },
  foodName: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.text, textTransform: 'capitalize', marginBottom: spacing.sm },
  co2eRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginBottom: spacing.sm },
  co2eValue: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text },
  co2eUnit: { fontSize: fontSize.xs, color: colors.textSecondary },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  placeholder: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.neutral[200],
    borderStyle: 'dashed',
    padding: spacing['3xl'],
    alignItems: 'center',
  },
  placeholderText: { color: colors.textMuted, fontSize: fontSize.sm },
  vsCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 48,
  },
  vsText: { fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textMuted },
  resultCard: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.primary[100],
    padding: spacing.lg,
  },
  resultTitle: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: spacing.sm },
  resultText: { fontSize: fontSize.sm, color: colors.neutral[700], lineHeight: 20 },
  caveat: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: spacing.md, fontStyle: 'italic' },
});
