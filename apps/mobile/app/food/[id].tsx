import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Badge, getCo2eBadgeVariant } from '../../components/Badge';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../lib/theme';
import { fetchFoodDetail } from '../../lib/api';
import { getMonthName } from '@seasonscope/shared';

export default function FoodDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchFoodDetail(id, 'US', new Date().getMonth() + 1)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  if (!data?.card) {
    return (
      <View style={styles.loader}>
        <Text style={styles.emptyText}>Food not found.</Text>
      </View>
    );
  }

  const { card, seasonality, sources } = data;
  const displayName = card.food.canonical_name.replace(/_/g, ' ');
  const currentMonth = new Date().getMonth() + 1;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.category}>
          {card.food.category.replace(/_/g, ' ')} · {card.food.typical_serving_g}g serving
        </Text>
      </View>

      {/* CO2e Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Carbon Footprint</Text>
        <View style={styles.co2eRow}>
          <Text style={styles.co2eValue}>{card.ghg.value_mid.toFixed(1)}</Text>
          <Text style={styles.co2eUnit}>{card.ghg.unit}</Text>
        </View>
        <Text style={styles.range}>
          Range: {card.ghg.value_min.toFixed(1)} – {card.ghg.value_max.toFixed(1)} {card.ghg.unit}
        </Text>
        <View style={styles.badges}>
          <Badge variant={getCo2eBadgeVariant(card.ghg.value_mid)} />
          <Badge variant={`quality_${card.ghg.quality_score}` as any} />
          {card.seasonality?.in_season_probability >= 0.5 && <Badge variant="in_season" />}
          {card.heated_greenhouse_likely && <Badge variant="greenhouse" />}
        </View>

        {card.food.typical_serving_g > 0 && card.ghg.value_mid > 0 && (
          <Text style={styles.perServing}>
            Per serving ({card.food.typical_serving_g}g):{' '}
            {((card.ghg.value_mid * card.food.typical_serving_g) / 1000).toFixed(2)} kg CO₂e
          </Text>
        )}
      </View>

      {/* Season Calendar */}
      {seasonality && seasonality.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Best months to buy locally</Text>
          <View style={styles.calendarGrid}>
            {Array.from({ length: 12 }, (_, i) => {
              const month = i + 1;
              const entry = seasonality.find((s: any) => s.month === month);
              const probability = entry?.probability ?? 0;
              const isCurrent = month === currentMonth;
              const level = probability >= 0.9 ? 5 : probability >= 0.7 ? 4 : probability >= 0.5 ? 3 : probability >= 0.3 ? 2 : probability > 0 ? 1 : 0;
              const heatColors = ['#f5f5f4', '#d9f0e3', '#b5e1c9', '#84cba8', '#52b183', '#319768'];

              return (
                <View
                  key={month}
                  style={[
                    styles.calendarCell,
                    isCurrent && styles.calendarCellCurrent,
                  ]}
                >
                  <View
                    style={[
                      styles.calendarDot,
                      { backgroundColor: heatColors[level] },
                    ]}
                  />
                  <Text style={styles.calendarLabel}>
                    {getMonthName(month).slice(0, 3)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Explanation */}
      <Pressable
        onPress={() => setShowExplanation(!showExplanation)}
        style={styles.card}
      >
        <Text style={styles.cardTitle}>
          {showExplanation ? '▲' : '▼'} Why this recommendation?
        </Text>
        {showExplanation && (
          <View style={styles.explanation}>
            <Text style={styles.explanationHeading}>Production Emissions</Text>
            <Text style={styles.explanationText}>
              CO₂e values represent lifecycle emissions from Poore & Nemecek 2018 meta-analysis
              unless region-specific data is available.
            </Text>

            <Text style={styles.explanationHeading}>Transport</Text>
            <Text style={styles.explanationText}>
              Transport typically contributes &lt;10% of total food emissions,
              except for air-freighted goods.
            </Text>

            <Text style={styles.explanationHeading}>Assumptions & Uncertainty</Text>
            <Text style={styles.explanationText}>
              • Global averages may not reflect local conditions{'\n'}
              • Ranges capture known variability across studies{'\n'}
              • Water-risk badges reflect regional stress, not crop-specific use{'\n'}
              • Seasonality probabilities are approximations
            </Text>
          </View>
        )}
      </Pressable>

      {/* Citations */}
      {sources && sources.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sources & Citations ({sources.length})</Text>
          {sources.map((s: any) => (
            <View key={s.id} style={styles.citationItem}>
              <Text style={styles.citationTitle}>{s.title}</Text>
              <Text style={styles.citationPublisher}>{s.publisher}</Text>
              <Text style={styles.citationMeta}>
                Accessed: {s.accessed_date} · License: {s.license}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Compare button */}
      <Pressable
        onPress={() => router.push(`/compare?a=${id}` as any)}
        style={styles.compareButton}
      >
        <Text style={styles.compareButtonText}>Compare with another food</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing['5xl'] },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  emptyText: { color: colors.textMuted, fontSize: fontSize.base },
  header: { padding: spacing.xl },
  name: { fontSize: fontSize['2xl'], fontWeight: fontWeight.bold, color: colors.text, textTransform: 'capitalize' },
  category: { fontSize: fontSize.sm, color: colors.textMuted, textTransform: 'capitalize', marginTop: 4 },
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing.lg,
  },
  cardTitle: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: spacing.md },
  co2eRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm, marginBottom: spacing.xs },
  co2eValue: { fontSize: fontSize['3xl'], fontWeight: fontWeight.bold, color: colors.text },
  co2eUnit: { fontSize: fontSize.sm, color: colors.textSecondary },
  range: { fontSize: fontSize.xs, color: colors.textMuted, marginBottom: spacing.md },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  perServing: { fontSize: fontSize.sm, color: colors.textSecondary },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  calendarCell: { alignItems: 'center', width: '14%', paddingVertical: spacing.xs },
  calendarCellCurrent: { borderWidth: 2, borderColor: colors.primary[400], borderRadius: borderRadius.lg },
  calendarDot: { width: 28, height: 28, borderRadius: borderRadius.md, marginBottom: 2 },
  calendarLabel: { fontSize: 10, color: colors.textMuted, fontWeight: fontWeight.medium },
  explanation: { marginTop: spacing.sm },
  explanationHeading: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.neutral[800], marginTop: spacing.md, marginBottom: spacing.xs },
  explanationText: { fontSize: fontSize.xs, color: colors.textSecondary, lineHeight: 18 },
  citationItem: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.neutral[100] },
  citationTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.neutral[800] },
  citationPublisher: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  citationMeta: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  compareButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: colors.primary[700],
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  compareButtonText: { color: '#fff', fontSize: fontSize.base, fontWeight: fontWeight.semibold },
});
