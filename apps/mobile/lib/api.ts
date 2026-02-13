/**
 * API client for the SeasonScope mobile app.
 * Points to the deployed web service (Render).
 */

// In production, this would be your Render URL
const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://seasonscope-web.onrender.com';

export async function fetchRecommendations(
  region: string,
  month: number
): Promise<any> {
  const res = await fetch(
    `${API_BASE}/api/recommendations?region=${encodeURIComponent(region)}&month=${month}`
  );
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchFoodDetail(
  foodId: string,
  region: string,
  month: number
): Promise<any> {
  const res = await fetch(
    `${API_BASE}/api/foods/${encodeURIComponent(foodId)}?region=${encodeURIComponent(region)}&month=${month}`
  );
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function searchFoods(
  query: string,
  limit: number = 10
): Promise<any> {
  const res = await fetch(
    `${API_BASE}/api/search?q=${encodeURIComponent(query)}&limit=${limit}`
  );
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
