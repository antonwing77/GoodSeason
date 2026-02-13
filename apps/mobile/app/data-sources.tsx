import React from 'react';
import { View, Text, ScrollView, StyleSheet, Linking, Pressable } from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../lib/theme';

const SOURCES = [
  {
    title: 'Poore & Nemecek (2018)',
    description: 'Comprehensive meta-analysis of food\'s environmental impacts. Primary source for GHG emission factors.',
    url: 'https://doi.org/10.1126/science.aaq0216',
  },
  {
    title: 'Our World in Data',
    description: 'Tabulated environmental data from Poore & Nemecek. CC BY 4.0 license.',
    url: 'https://ourworldindata.org/environmental-impacts-of-food',
  },
  {
    title: 'AGRIBALYSE 3.x',
    description: 'French/EU life cycle assessment database by ADEME. Region-specific emission factors.',
    url: 'https://agribalyse.ademe.fr/',
  },
  {
    title: 'FAO Crop Calendar',
    description: 'Global crop planting and harvest calendars used for seasonality data.',
    url: 'https://www.fao.org/agriculture/seed/cropcalendar/welcome.do',
  },
  {
    title: 'WRI Aqueduct',
    description: 'Global water stress indicators used for water-risk badges.',
    url: 'https://www.wri.org/aqueduct',
  },
  {
    title: 'Theurl et al. (2014)',
    description: 'Research on greenhouse heating vs imported produce emissions.',
    url: 'https://doi.org/10.1007/s13593-013-0171-8',
  },
];

const LIMITATIONS = [
  'Global averages may not reflect local production conditions.',
  'Seasonality is approximate based on crop calendars.',
  'Water-risk is regional, not crop-specific.',
  'Transport impact is simplified.',
  'Primary data is from 2018 meta-analysis.',
  'LCA covers farm-to-retail; consumer impact not included.',
];

export default function DataSourcesScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Data Sources & Methodology</Text>
      <Text style={styles.subtitle}>
        Every data point in SeasonScope is backed by cited sources.
      </Text>

      {/* Principles */}
      <View style={styles.principlesCard}>
        <Text style={styles.sectionTitle}>Our Principles</Text>
        <Text style={styles.principle}>• Cite everything</Text>
        <Text style={styles.principle}>• Show uncertainty</Text>
        <Text style={styles.principle}>• Don't overclaim</Text>
        <Text style={styles.principle}>• Guide, not judge</Text>
        <Text style={styles.principle}>• Full transparency</Text>
      </View>

      {/* Sources */}
      <Text style={styles.sectionTitle}>Sources</Text>
      {SOURCES.map((source, i) => (
        <Pressable
          key={i}
          onPress={() => Linking.openURL(source.url)}
          style={styles.sourceCard}
        >
          <Text style={styles.sourceTitle}>{source.title}</Text>
          <Text style={styles.sourceDescription}>{source.description}</Text>
          <Text style={styles.sourceLink}>Open source →</Text>
        </Pressable>
      ))}

      {/* Data Quality */}
      <Text style={styles.sectionTitle}>Data Quality Badges</Text>
      <View style={styles.qualityGrid}>
        <View style={[styles.qualityItem, { borderColor: colors.primary[200] }]}>
          <Text style={[styles.qualityLabel, { color: colors.primary[700] }]}>High</Text>
          <Text style={styles.qualityDesc}>Region-specific LCA</Text>
        </View>
        <View style={[styles.qualityItem, { borderColor: '#fde68a' }]}>
          <Text style={[styles.qualityLabel, { color: '#a16207' }]}>Medium</Text>
          <Text style={styles.qualityDesc}>Global average</Text>
        </View>
        <View style={[styles.qualityItem, { borderColor: colors.neutral[200] }]}>
          <Text style={[styles.qualityLabel, { color: colors.textMuted }]}>Low</Text>
          <Text style={styles.qualityDesc}>Estimated</Text>
        </View>
      </View>

      {/* Limitations */}
      <Text style={styles.sectionTitle}>Known Limitations</Text>
      <View style={styles.limitationsCard}>
        {LIMITATIONS.map((lim, i) => (
          <Text key={i} style={styles.limitation}>• {lim}</Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing['5xl'] },
  title: { fontSize: fontSize['2xl'], fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.xs },
  subtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xl, lineHeight: 20 },
  principlesCard: {
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.primary[100],
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  principle: { fontSize: fontSize.sm, color: colors.neutral[700], marginBottom: spacing.xs },
  sourceCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  sourceTitle: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: spacing.xs },
  sourceDescription: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20 },
  sourceLink: { fontSize: fontSize.xs, color: colors.primary[600], marginTop: spacing.sm, fontWeight: fontWeight.medium },
  qualityGrid: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
  qualityItem: {
    flex: 1,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  qualityLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, marginBottom: 2 },
  qualityDesc: { fontSize: fontSize.xs, color: colors.textSecondary },
  limitationsCard: {
    backgroundColor: '#fffbeb',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: '#fde68a',
    padding: spacing.lg,
  },
  limitation: { fontSize: fontSize.xs, color: colors.neutral[700], marginBottom: spacing.sm, lineHeight: 18 },
});
