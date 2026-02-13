import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Badge, getCo2eBadgeVariant } from './Badge';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../lib/theme';
import type { FoodCardData } from '@seasonscope/shared';

interface FoodCardProps {
  data: FoodCardData;
  showCategory?: boolean;
}

export function FoodCard({ data, showCategory = true }: FoodCardProps) {
  const router = useRouter();
  const { food, ghg, seasonality, water_risk, heated_greenhouse_likely } = data;
  const displayName = food.canonical_name.replace(/_/g, ' ');

  return (
    <Pressable
      onPress={() => router.push(`/food/${food.id}` as any)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel={`${displayName}, ${ghg.value_mid.toFixed(1)} kg CO2e per kg`}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.name}>{displayName}</Text>
          {showCategory && (
            <Text style={styles.category}>
              {food.category.replace(/_/g, ' ')}
            </Text>
          )}
        </View>
        {seasonality && seasonality.in_season_probability >= 0.5 && (
          <Badge variant="in_season" />
        )}
      </View>

      {/* CO2e */}
      <View style={styles.co2eRow}>
        <Text style={styles.co2eValue}>{ghg.value_mid.toFixed(1)}</Text>
        <Text style={styles.co2eUnit}>kg CO₂e/kg</Text>
        <Badge variant={getCo2eBadgeVariant(ghg.value_mid)} />
      </View>

      {/* Range */}
      <Text style={styles.range}>
        Range: {ghg.value_min.toFixed(1)}–{ghg.value_max.toFixed(1)} kg CO₂e/kg
      </Text>

      {/* Badges */}
      <View style={styles.badges}>
        <Badge variant={`quality_${ghg.quality_score}` as any} />
        {water_risk && (water_risk.bucket === 'high' || water_risk.bucket === 'extremely_high') && (
          <Badge variant="water_risk_high" />
        )}
        {heated_greenhouse_likely && <Badge variant="greenhouse" />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.98 }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    textTransform: 'capitalize',
  },
  category: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  co2eRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  co2eValue: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.neutral[700],
  },
  co2eUnit: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  range: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
});
