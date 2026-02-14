/**
 * ETL Connector: Köppen–Geiger Climate Zones
 *
 * Provides a function to map lat/lon -> climate_zone_code using a lookup
 * table derived from the Beck et al. (2018) global Köppen-Geiger classification.
 *
 * Full resolution uses the GeoTIFF raster from:
 *   https://www.gloh2o.org/koppen/
 *
 * For the ETL, we store representative climate zones for major food-producing
 * regions and cities, enabling seasonality fallback logic.
 *
 * Source: Beck, H.E., et al. (2018) "Present and future Köppen-Geiger climate
 *         classification maps at 1-km resolution." Scientific Data, 5:180214.
 */
import { getPool } from './db-pool';

const SOURCE_ID = 'koppen_beck_2018';

/**
 * Köppen climate zone descriptions for reference.
 */
export const KOPPEN_DESCRIPTIONS: Record<string, string> = {
  Af: 'Tropical rainforest',
  Am: 'Tropical monsoon',
  Aw: 'Tropical savanna (dry winter)',
  As: 'Tropical savanna (dry summer)',
  BWh: 'Hot desert',
  BWk: 'Cold desert',
  BSh: 'Hot semi-arid (steppe)',
  BSk: 'Cold semi-arid (steppe)',
  Csa: 'Mediterranean (hot summer)',
  Csb: 'Mediterranean (warm summer)',
  Cwa: 'Humid subtropical (dry winter)',
  Cwb: 'Subtropical highland (dry winter)',
  Cfa: 'Humid subtropical',
  Cfb: 'Oceanic',
  Cfc: 'Subpolar oceanic',
  Dsa: 'Continental (hot, dry summer)',
  Dsb: 'Continental (warm, dry summer)',
  Dsc: 'Continental (cool, dry summer)',
  Dwa: 'Continental (hot, dry winter)',
  Dwb: 'Continental (warm, dry winter)',
  Dwc: 'Continental (cool, dry winter)',
  Dfa: 'Continental (hot summer, no dry season)',
  Dfb: 'Continental (warm summer, no dry season)',
  Dfc: 'Subarctic',
  Dfd: 'Extreme subarctic',
  ET: 'Tundra',
  EF: 'Ice cap',
};

/**
 * Representative climate zones for major cities and agricultural regions.
 * Used to improve the simplified lat/lon estimator.
 *
 * These are indexed as "LAT,LON" rounded to nearest degree.
 */
const CITY_CLIMATE_ZONES: Record<string, string> = {
  // North America
  '41,-74': 'Cfa',     // New York
  '34,-118': 'Csb',    // Los Angeles
  '42,-88': 'Dfa',     // Chicago
  '30,-98': 'Cfa',     // Austin/Central Texas
  '26,-80': 'Af',      // Miami/South Florida
  '37,-122': 'Csb',    // San Francisco
  '47,-122': 'Cfb',    // Seattle
  '33,-112': 'BWh',    // Phoenix
  '40,-105': 'BSk',    // Denver
  '45,-93': 'Dfb',     // Minneapolis
  '36,-79': 'Cfa',     // North Carolina
  '43,-79': 'Dfb',     // Toronto
  '45,-74': 'Dfb',     // Montreal
  '49,-123': 'Cfb',    // Vancouver
  '19,-99': 'Cwb',     // Mexico City
  '21,-87': 'Aw',      // Cancun

  // South America
  '-23,-47': 'Cfa',    // São Paulo
  '-23,-43': 'Aw',     // Rio de Janeiro
  '-34,-58': 'Cfa',    // Buenos Aires
  '-33,-71': 'Csb',    // Santiago
  '5,-74': 'Af',       // Bogotá
  '-12,-77': 'BWh',    // Lima
  '0,-78': 'Cfb',      // Quito

  // Europe
  '52,0': 'Cfb',       // London
  '49,2': 'Cfb',       // Paris
  '52,13': 'Cfb',      // Berlin
  '41,12': 'Csa',      // Rome
  '40,-4': 'Csa',      // Madrid
  '38,-9': 'Csa',      // Lisbon
  '52,5': 'Cfb',       // Amsterdam
  '59,18': 'Dfb',      // Stockholm
  '60,25': 'Dfb',      // Helsinki
  '48,17': 'Dfb',      // Vienna/Bratislava
  '38,24': 'Csa',      // Athens
  '44,26': 'Dfa',      // Bucharest
  '47,19': 'Dfb',      // Budapest

  // Asia
  '36,140': 'Cfa',     // Tokyo
  '37,127': 'Dwa',     // Seoul
  '31,121': 'Cfa',     // Shanghai
  '40,116': 'Dwa',     // Beijing
  '29,77': 'Cwa',      // Delhi
  '19,73': 'Aw',       // Mumbai
  '14,101': 'Aw',      // Bangkok
  '21,106': 'Cwa',     // Hanoi
  '-6,107': 'Af',      // Jakarta
  '14,121': 'Aw',      // Manila
  '25,121': 'Cfa',     // Taipei
  '1,104': 'Af',       // Singapore

  // Middle East
  '25,55': 'BWh',      // Dubai
  '32,35': 'Csa',      // Tel Aviv
  '33,44': 'BWh',      // Baghdad

  // Africa
  '-34,18': 'Csb',     // Cape Town
  '-26,28': 'Cwb',     // Johannesburg
  '6,3': 'Aw',         // Lagos
  '30,31': 'BWh',      // Cairo
  '-1,37': 'BSh',      // Nairobi
  '9,39': 'Cwb',       // Addis Ababa
  '34,-7': 'Csa',      // Casablanca
  '6,-2': 'Aw',        // Accra

  // Oceania
  '-34,151': 'Cfa',    // Sydney
  '-38,145': 'Cfb',    // Melbourne
  '-28,153': 'Cfa',    // Brisbane
  '-42,147': 'Cfb',    // Hobart
  '-37,175': 'Cfb',    // Auckland (NZ)
};

/**
 * Enhanced climate zone estimation using the city lookup table
 * plus the simplified latitude/longitude heuristic.
 */
export function estimateClimateZoneEnhanced(lat: number, lon: number): string {
  // Check nearest city (within ~2 degrees)
  const roundedLat = Math.round(lat);
  const roundedLon = Math.round(lon);

  const key = `${roundedLat},${roundedLon}`;
  if (CITY_CLIMATE_ZONES[key]) {
    return CITY_CLIMATE_ZONES[key];
  }

  // Try nearby keys (±1 degree)
  for (const dLat of [-1, 0, 1]) {
    for (const dLon of [-1, 0, 1]) {
      const nearKey = `${roundedLat + dLat},${roundedLon + dLon}`;
      if (CITY_CLIMATE_ZONES[nearKey]) {
        return CITY_CLIMATE_ZONES[nearKey];
      }
    }
  }

  // Fallback: simplified heuristic based on latitude
  const absLat = Math.abs(lat);

  if (absLat >= 66.5) return 'EF';
  if (absLat >= 55) return 'Dfc';
  if (absLat >= 45) return 'Dfb';
  if (absLat >= 35) {
    // Mediterranean vs oceanic heuristic
    if (lon > -10 && lon < 40 && lat > 30 && lat < 45) return 'Csa';
    return 'Cfb';
  }
  if (absLat >= 23.5) return 'Cfa';
  if (absLat >= 10) return 'Aw';
  return 'Af';
}

export async function runKoppenEtl(): Promise<void> {
  console.log('\n=== Köppen–Geiger Climate Zone ETL ===\n');
  const pool = getPool();
  const client = await pool.connect();

  try {
    // Ensure source record
    await client.query(
      `INSERT INTO sources (id, title, publisher, url, published_date, accessed_date, license, notes)
       VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, $6, $7)
       ON CONFLICT (id) DO UPDATE SET accessed_date = CURRENT_DATE`,
      [
        SOURCE_ID,
        'Present and future Köppen-Geiger climate classification maps at 1-km resolution',
        'Scientific Data (Nature)',
        'https://www.gloh2o.org/koppen/',
        '2018-10-30',
        'CC BY 4.0',
        'Beck et al. (2018). Global 1-km resolution climate classification. Used for seasonality fallback when country-specific calendars are unavailable.',
      ]
    );

    // Store climate zone data for major agricultural regions as seasonality context.
    // This enables the seasonality fallback: CLIMATE:{zone}:{month} records.
    const climateZones = ['Af', 'Am', 'Aw', 'BWh', 'BSk', 'Csa', 'Csb', 'Cfa', 'Cfb', 'Dfa', 'Dfb', 'Dfc'];

    // Generic growing season patterns per climate zone
    const ZONE_SEASON_PATTERNS: Record<string, number[]> = {
      // Tropical: year-round growing
      Af: [0.80, 0.80, 0.80, 0.80, 0.80, 0.80, 0.80, 0.80, 0.80, 0.80, 0.80, 0.80],
      Am: [0.60, 0.70, 0.80, 0.85, 0.85, 0.75, 0.65, 0.60, 0.65, 0.75, 0.80, 0.65],
      Aw: [0.40, 0.50, 0.65, 0.75, 0.80, 0.70, 0.55, 0.50, 0.60, 0.70, 0.60, 0.45],
      // Arid: limited growing, irrigated
      BWh: [0.20, 0.25, 0.35, 0.40, 0.35, 0.25, 0.20, 0.20, 0.25, 0.30, 0.25, 0.20],
      BSk: [0.10, 0.15, 0.30, 0.50, 0.65, 0.70, 0.65, 0.55, 0.45, 0.30, 0.15, 0.10],
      // Mediterranean: summer dry
      Csa: [0.40, 0.50, 0.70, 0.80, 0.75, 0.55, 0.35, 0.30, 0.45, 0.65, 0.55, 0.40],
      Csb: [0.35, 0.45, 0.60, 0.75, 0.80, 0.70, 0.50, 0.40, 0.50, 0.60, 0.45, 0.35],
      // Humid subtropical & oceanic
      Cfa: [0.15, 0.20, 0.40, 0.60, 0.80, 0.90, 0.90, 0.85, 0.70, 0.50, 0.25, 0.15],
      Cfb: [0.10, 0.15, 0.35, 0.55, 0.75, 0.85, 0.85, 0.80, 0.65, 0.40, 0.20, 0.10],
      // Continental
      Dfa: [0.05, 0.05, 0.15, 0.40, 0.70, 0.85, 0.90, 0.85, 0.65, 0.35, 0.10, 0.05],
      Dfb: [0.05, 0.05, 0.10, 0.30, 0.60, 0.80, 0.85, 0.80, 0.55, 0.25, 0.10, 0.05],
      Dfc: [0.05, 0.05, 0.05, 0.15, 0.40, 0.60, 0.70, 0.60, 0.35, 0.15, 0.05, 0.05],
    };

    // Get all produce items
    const produceResult = await client.query(
      "SELECT id FROM foods WHERE category = 'produce'"
    );
    const produceIds = produceResult.rows.map((r: { id: string }) => r.id);

    let upsertCount = 0;

    for (const zone of climateZones) {
      const pattern = ZONE_SEASON_PATTERNS[zone];
      if (!pattern) continue;

      for (const foodId of produceIds) {
        for (let month = 1; month <= 12; month++) {
          await client.query(
            `INSERT INTO seasonality (food_id, region_code, month, in_season_probability, confidence, source_id)
             VALUES ($1, $2, $3, $4, 0.40, $5)
             ON CONFLICT (food_id, region_code, month)
             DO UPDATE SET in_season_probability = EXCLUDED.in_season_probability`,
            [foodId, `CLIMATE:${zone}`, month, pattern[month - 1], SOURCE_ID]
          );
          upsertCount++;
        }
      }
    }

    console.log(`  Upserted ${upsertCount} climate-zone seasonality records.`);
    console.log(`  Enhanced climate zone function covers ${Object.keys(CITY_CLIMATE_ZONES).length} cities.`);
  } finally {
    client.release();
  }
}
