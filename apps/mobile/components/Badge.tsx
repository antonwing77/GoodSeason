import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, fontSize } from '../lib/theme';

export type BadgeVariant =
  | 'in_season'
  | 'co2e_low'
  | 'co2e_medium'
  | 'co2e_high'
  | 'quality_high'
  | 'quality_medium'
  | 'quality_low'
  | 'water_risk_low'
  | 'water_risk_medium'
  | 'water_risk_high'
  | 'greenhouse';

const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  in_season:         { bg: '#f0f9f4', text: '#237a53', border: '#b5e1c9' },
  co2e_low:          { bg: '#f0f9f4', text: '#237a53', border: '#b5e1c9' },
  co2e_medium:       { bg: '#fefce8', text: '#a16207', border: '#fde68a' },
  co2e_high:         { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  quality_high:      { bg: '#f0f9f4', text: '#237a53', border: '#b5e1c9' },
  quality_medium:    { bg: '#fefce8', text: '#a16207', border: '#fde68a' },
  quality_low:       { bg: '#f5f5f4', text: '#78716c', border: '#d6d3d1' },
  water_risk_low:    { bg: '#f0f9f4', text: '#237a53', border: '#b5e1c9' },
  water_risk_medium: { bg: '#fefce8', text: '#a16207', border: '#fde68a' },
  water_risk_high:   { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
  greenhouse:        { bg: '#fefce8', text: '#a16207', border: '#fde68a' },
};

const variantLabels: Record<BadgeVariant, string> = {
  in_season:         'In Season',
  co2e_low:          'Low CO₂e',
  co2e_medium:       'Medium CO₂e',
  co2e_high:         'High CO₂e',
  quality_high:      'High Quality',
  quality_medium:    'Medium Quality',
  quality_low:       'Low Quality',
  water_risk_low:    'Low Water Risk',
  water_risk_medium: 'Med Water Risk',
  water_risk_high:   'High Water Risk',
  greenhouse:        'Heated Greenhouse',
};

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
}

export function Badge({ variant, label }: BadgeProps) {
  const style = variantStyles[variant];
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: style.bg,
          borderColor: style.border,
        },
      ]}
      accessibilityRole="text"
      accessibilityLabel={label ?? variantLabels[variant]}
    >
      <Text style={[styles.badgeText, { color: style.text }]}>
        {label ?? variantLabels[variant]}
      </Text>
    </View>
  );
}

export function getCo2eBadgeVariant(co2eMid: number): BadgeVariant {
  if (co2eMid < 2) return 'co2e_low';
  if (co2eMid < 10) return 'co2e_medium';
  return 'co2e_high';
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
});
