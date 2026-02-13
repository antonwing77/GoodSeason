import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable,
  ActivityIndicator, TextInput, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FoodCard } from '../components/FoodCard';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../lib/theme';
import { fetchRecommendations, searchFoods } from '../lib/api';
import { getMonthName } from '@seasonscope/shared';
import type { FoodCardData } from '@seasonscope/shared';

type TabId = 'in_season' | 'lowest_co2e' | 'protein' | 'staples';

const TABS: { id: TabId; label: string }[] = [
  { id: 'in_season', label: 'In Season' },
  { id: 'lowest_co2e', label: 'Lowest CO₂e' },
  { id: 'protein', label: 'Protein' },
  { id: 'staples', label: 'Staples' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('in_season');
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [location] = useState('US');
  const month = new Date().getMonth() + 1;

  const loadData = useCallback(async () => {
    try {
      const data = await fetchRecommendations(location, month);
      setRecommendations(data);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [location, month]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const data = await searchFoods(searchQuery, 8);
        setSearchResults(data.results || []);
      } catch {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const getActiveItems = (): FoodCardData[] => {
    if (!recommendations) return [];
    const map: Record<TabId, FoodCardData[]> = {
      in_season: recommendations.inSeason || [],
      lowest_co2e: recommendations.lowestCo2e || [],
      protein: recommendations.proteinChoices || [],
      staples: recommendations.staples || [],
    };
    return map[activeTab];
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[600]} />
      }
    >
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroLocation}>{location} · {getMonthName(month)}</Text>
        <Text style={styles.heroTitle}>What's best to buy this month?</Text>
        <Text style={styles.heroSubtitle}>
          Seasonal food guidance backed by cited data.
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search foods..."
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          accessibilityLabel="Search foods"
          returnKeyType="search"
        />
      </View>

      {/* Search results */}
      {searchResults.length > 0 && (
        <View style={styles.searchResults}>
          {searchResults.map((r: any) => (
            <Pressable
              key={r.food_id}
              onPress={() => {
                setSearchQuery('');
                setSearchResults([]);
                router.push(`/food/${r.food_id}` as any);
              }}
              style={styles.searchResultItem}
            >
              <Text style={styles.searchResultName}>
                {r.canonical_name.replace(/_/g, ' ')}
              </Text>
              <Text style={styles.searchResultCategory}>
                {r.category?.replace(/_/g, ' ')}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
        <View style={styles.tabs}>
          {TABS.map((tab) => (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === tab.id }}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Nav links */}
      <View style={styles.navLinks}>
        <Pressable onPress={() => router.push('/browse' as any)} style={styles.navLink}>
          <Text style={styles.navLinkText}>Browse All</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/compare' as any)} style={styles.navLink}>
          <Text style={styles.navLinkText}>Compare</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/data-sources' as any)} style={styles.navLink}>
          <Text style={styles.navLinkText}>Data</Text>
        </Pressable>
      </View>

      {/* Food list */}
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary[600]} style={styles.loader} />
      ) : (
        <View style={styles.foodList}>
          {getActiveItems().length > 0 ? (
            getActiveItems().map((item) => (
              <FoodCard key={item.food.id} data={item} />
            ))
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No items found for this selection.</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing['5xl'],
  },
  hero: {
    padding: spacing.xl,
    paddingTop: spacing['2xl'],
    backgroundColor: colors.primary[50],
    borderBottomWidth: 1,
    borderBottomColor: colors.primary[100],
  },
  heroLocation: {
    fontSize: fontSize.sm,
    color: colors.primary[700],
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
  },
  heroTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  searchInput: {
    height: 44,
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    fontSize: fontSize.base,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  searchResults: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  searchResultName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.text,
    textTransform: 'capitalize',
  },
  searchResultCategory: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
  tabsScroll: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  tabs: {
    flexDirection: 'row',
    gap: spacing.xs,
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.xl,
    padding: 4,
  },
  tab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  tabActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.text,
  },
  navLinks: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  navLink: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary[200],
    backgroundColor: colors.primary[50],
  },
  navLinkText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.primary[700],
  },
  loader: {
    marginTop: spacing['4xl'],
  },
  foodList: {
    paddingHorizontal: spacing.lg,
  },
  empty: {
    paddingVertical: spacing['4xl'],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
