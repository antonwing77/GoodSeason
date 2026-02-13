import type { LocationContext } from '../types';

/**
 * Map latitude/longitude to a coarse Köppen climate zone.
 * This is a simplified heuristic; a production system would use a geospatial
 * dataset (e.g., Beck et al. 2018 global Köppen map).
 */
export function estimateClimateZone(lat: number, lon: number): string {
  const absLat = Math.abs(lat);

  // Polar
  if (absLat >= 66.5) return 'EF';

  // Subarctic / boreal
  if (absLat >= 55) return 'Dfc';

  // Continental
  if (absLat >= 45) {
    // Rough east/west split for humid vs dry continental
    return 'Dfb';
  }

  // Temperate
  if (absLat >= 35) {
    // Mediterranean vs oceanic heuristic
    if (lon > -10 && lon < 40 && lat > 30 && lat < 45) return 'Csa'; // Mediterranean
    return 'Cfb'; // Oceanic
  }

  // Subtropical
  if (absLat >= 23.5) {
    return 'Cfa'; // Humid subtropical
  }

  // Tropical
  if (absLat >= 10) return 'Aw'; // Tropical savanna
  return 'Af'; // Tropical rainforest
}

/**
 * Map country code to a default admin region code.
 * In production this would use a reverse-geocoding service.
 */
export function buildLocationContext(
  latitude: number,
  longitude: number,
  countryCode: string,
  adminRegion: string = ''
): LocationContext {
  return {
    country_code: countryCode.toUpperCase(),
    admin_region: adminRegion,
    climate_zone: estimateClimateZone(latitude, longitude),
    latitude,
    longitude,
  };
}

/**
 * Get current month (1–12).
 */
export function getCurrentMonth(): number {
  return new Date().getMonth() + 1;
}
