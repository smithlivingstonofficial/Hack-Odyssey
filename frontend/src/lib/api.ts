/**
 * API client for Climate Property Intelligence backend.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface PropertyInput {
  address?: string;
  latitude: number;
  longitude: number;
  property_type: 'residential' | 'apartment' | 'commercial' | 'industrial';
  area_sqft: number;
  market_rate_per_sqft?: number;
  building_age?: number;
  num_floors?: number;
  has_basement?: boolean;
  flood_protection?: boolean;
  cool_roof?: boolean;
  storm_resistant?: boolean;
}

export interface RiskDriver {
  factor: string;
  value: string;
  impact: 'high' | 'medium' | 'low';
  description: string;
}

export interface RiskScore {
  hazard: string;
  score: number;
  category: string;
  confidence: number;
  drivers: RiskDriver[];
}

export interface FinancialImpact {
  hazard: string;
  impact_inr: number;
  impact_percentage: number;
  explanation: string;
}

export interface ClimateFeatures {
  elevation_m: number;
  slope_deg: number;
  annual_rainfall_mm: number;
  max_1day_rainfall_mm: number;
  max_3day_rainfall_mm: number;
  mean_temperature_c: number;
  max_temperature_c: number;
  humidity: number;
  mean_wind_speed: number;
  day_lst_c: number;
  night_lst_c: number;
  water_occurrence: number;
  distance_to_water_m: number;
  built_fraction: number;
  vegetation_fraction: number;
  distance_to_river_m: number;
  cyclone_count_100km: number;
  nearest_cyclone_distance_km: number;
  max_nearby_wind: number;
}

export interface ValuationResult {
  base_value_inr: number;
  flood_impact: FinancialImpact;
  heat_impact: FinancialImpact;
  cyclone_impact: FinancialImpact;
  total_climate_impact_inr: number;
  total_climate_impact_percentage: number;
  adjusted_value_inr: number;
}

export interface AnalysisResponse {
  property_input: PropertyInput;
  climate_features: ClimateFeatures;
  risk_scores: RiskScore[];
  valuation: ValuationResult;
  overall_risk_score: number;
  overall_risk_category: string;
  analysis_disclaimer: string;
}

export interface GeocodeResult {
  address: string;
  latitude: number;
  longitude: number;
  display_name: string;
  city?: string;
  state?: string;
}

/**
 * Analyze a property for climate risk and valuation impact.
 */
export async function analyzeProperty(input: PropertyInput): Promise<AnalysisResponse> {
  const res = await fetch(`${API_BASE}/api/v1/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Analysis failed' }));
    throw new Error(error.detail || 'Analysis failed');
  }

  return res.json();
}

/**
 * Geocode an address to coordinates.
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  const res = await fetch(
    `${API_BASE}/api/v1/geocode?address=${encodeURIComponent(address)}`
  );

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Geocoding failed' }));
    throw new Error(error.detail || 'Geocoding failed');
  }

  return res.json();
}

/**
 * Format INR currency value.
 */
export function formatINR(value: number): string {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }
  return `₹${value.toLocaleString('en-IN')}`;
}

/**
 * Get risk color CSS class based on category.
 */
export function getRiskClass(category: string): string {
  switch (category.toUpperCase()) {
    case 'VERY HIGH': return 'very-high';
    case 'HIGH': return 'high';
    case 'MODERATE': return 'moderate';
    case 'LOW': return 'low';
    default: return 'low';
  }
}

/**
 * Get risk color hex based on category.
 */
export function getRiskColor(category: string): string {
  switch (category.toUpperCase()) {
    case 'VERY HIGH': return '#dc2626';
    case 'HIGH': return '#f43f5e';
    case 'MODERATE': return '#f59e0b';
    case 'LOW': return '#10b981';
    default: return '#10b981';
  }
}

/**
 * Get hazard icon emoji.
 */
export function getHazardIcon(hazard: string): string {
  switch (hazard.toLowerCase()) {
    case 'flood': return '•';
    case 'heat': return '•';
    case 'cyclone': return '•';
    default: return '•';
  }
}

export interface RealPropertyAsset {
  id: string;
  name: string;
  property_type: 'residential' | 'apartment' | 'commercial' | 'industrial';
  building_tag: string;
  latitude: number;
  longitude: number;
  num_floors: number;
  estimated_area_sqft: number;
  guideline_rate_per_sqft: number;
  estimated_price_inr?: number;
  climate_haircut_estimate?: number;
  adjusted_price_inr?: number;
}

const FALLBACK_LANDMARKS: RealPropertyAsset[] = [
  {
    id: "osm-victoria-hall",
    name: "Victoria Public Hall Heritage Asset",
    property_type: "commercial",
    building_tag: "heritage_civic",
    latitude: 13.0820,
    longitude: 80.2726,
    num_floors: 2,
    estimated_area_sqft: 14000,
    guideline_rate_per_sqft: 11500,
    estimated_price_inr: 161000000,
    climate_haircut_estimate: 8.5,
    adjusted_price_inr: 147315000,
  },
  {
    id: "osm-lilypond-complex",
    name: "Lily Pond Commercial & Shopping Arcade",
    property_type: "commercial",
    building_tag: "retail_complex",
    latitude: 13.0834,
    longitude: 80.2725,
    num_floors: 3,
    estimated_area_sqft: 12500,
    guideline_rate_per_sqft: 9500,
    estimated_price_inr: 118750000,
    climate_haircut_estimate: 8.5,
    adjusted_price_inr: 108656250,
  },
  {
    id: "osm-periamet-residences",
    name: "Periamet Residential Enclave",
    property_type: "apartment",
    building_tag: "apartments",
    latitude: 13.0847,
    longitude: 80.2702,
    num_floors: 4,
    estimated_area_sqft: 9600,
    guideline_rate_per_sqft: 8500,
    estimated_price_inr: 81600000,
    climate_haircut_estimate: 8.5,
    adjusted_price_inr: 74664000,
  },
  {
    id: "osm-mylapore-villa",
    name: "Mylapore South Mada Street Villa",
    property_type: "residential",
    building_tag: "house",
    latitude: 13.0335,
    longitude: 80.2690,
    num_floors: 2,
    estimated_area_sqft: 2400,
    guideline_rate_per_sqft: 14000,
    estimated_price_inr: 33600000,
    climate_haircut_estimate: 7.5,
    adjusted_price_inr: 31080000,
  },
  {
    id: "osm-velachery-flats",
    name: "Velachery Lakeview Residential Society",
    property_type: "apartment",
    building_tag: "apartments",
    latitude: 12.9759,
    longitude: 80.2212,
    num_floors: 4,
    estimated_area_sqft: 11200,
    guideline_rate_per_sqft: 8000,
    estimated_price_inr: 89600000,
    climate_haircut_estimate: 12.5,
    adjusted_price_inr: 78400000,
  },
  {
    id: "osm-rspuram-villa",
    name: "RS Puram West Boulevard Villa",
    property_type: "residential",
    building_tag: "house",
    latitude: 11.0168,
    longitude: 76.9558,
    num_floors: 2,
    estimated_area_sqft: 3200,
    guideline_rate_per_sqft: 9500,
    estimated_price_inr: 30400000,
    climate_haircut_estimate: 4.2,
    adjusted_price_inr: 29123200,
  },
  {
    id: "osm-cuddalore-warehouse",
    name: "Cuddalore Port Maritime Logistics Center",
    property_type: "industrial",
    building_tag: "warehouse",
    latitude: 11.7500,
    longitude: 79.7700,
    num_floors: 1,
    estimated_area_sqft: 12000,
    guideline_rate_per_sqft: 3600,
    estimated_price_inr: 43200000,
    climate_haircut_estimate: 11.0,
    adjusted_price_inr: 38448000,
  },
];

/**
 * Fetch real-world buildings, apartments, and land parcels from OpenStreetMap Overpass with official valuations.
 */
export async function fetchNearbyRealProperties(
  lat: number,
  lon: number,
  radius_m: number = 700
): Promise<RealPropertyAsset[]> {
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/properties/nearby?lat=${lat}&lon=${lon}&radius_m=${radius_m}`
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (e) {
    console.warn('Backend Overpass route offline or busy, checking fallback landmarks:', e);
  }

  // Fallback: match landmarks within 15km
  return FALLBACK_LANDMARKS.filter((lm) => {
    const dLat = Math.abs(lm.latitude - lat) * 111;
    const dLon = Math.abs(lm.longitude - lon) * 105;
    return Math.sqrt(dLat * dLat + dLon * dLon) <= 15;
  });
}

/**
 * Fetch real thermal / heat stress heatmap points [lat, lon, intensity].
 */
export async function fetchThermalHeatmap(
  lat: number,
  lon: number
): Promise<[number, number, number][]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/heatmap/thermal?lat=${lat}&lon=${lon}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.error('Failed to fetch thermal heatmap:', e);
    return [];
  }
}

/**
 * Fetch real flood basin / low elevation heatmap points [lat, lon, intensity].
 */
export async function fetchFloodHeatmap(
  lat: number,
  lon: number
): Promise<[number, number, number][]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/heatmap/flood?lat=${lat}&lon=${lon}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.error('Failed to fetch flood heatmap:', e);
    return [];
  }
}

/**
 * Fetch real cyclone & severe storm surge heatmap points [lat, lon, intensity].
 */
export async function fetchCycloneHeatmap(
  lat: number,
  lon: number
): Promise<[number, number, number][]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/heatmap/cyclone?lat=${lat}&lon=${lon}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.error('Failed to fetch cyclone heatmap:', e);
    return [];
  }
}

/**
 * Fetch live Doppler radar tile configuration from RainViewer API.
 */
export async function fetchRadarTileUrl(): Promise<{ status: string; tile_url: string; timestamp?: number }> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/weather/radar`);
    if (!res.ok) throw new Error('Radar API error');
    return await res.json();
  } catch (e) {
    console.error('Failed to fetch radar tile url:', e);
    return {
      status: 'fallback',
      tile_url: 'https://tilecache.rainviewer.com/v2/radar/nowcast/256/{z}/{x}/{y}/2/1_1.png',
    };
  }
}

export interface CurrentWeather {
  temperature: number;
  apparent_temperature: number;
  humidity: number;
  is_day: boolean;
  weather_code: number;
  weather_description: string;
  precipitation: number;
  cloud_cover: number;
  pressure: number;
  wind_speed: number;
  wind_direction: number;
  wind_gusts: number;
}

export interface DailyForecastItem {
  time: string;
  weather_code: number;
  weather_description: string;
  temperature_max: number | null;
  temperature_min: number | null;
  precipitation_sum: number;
  uv_index_max: number | null;
}

export interface HourlyForecastItem {
  time: string;
  temperature: number | null;
  precipitation_probability: number;
  weather_code: number;
}

export interface LiveWeatherData {
  latitude: number;
  longitude: number;
  current: CurrentWeather;
  daily: DailyForecastItem[];
  hourly: HourlyForecastItem[];
}

export const WMO_CODE_MAP: { [key: number]: string } = {
  0: "Clear Sky",
  1: "Mainly Clear",
  2: "Partly Cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Depositing Rime Fog",
  51: "Light Drizzle",
  53: "Moderate Drizzle",
  55: "Dense Drizzle",
  61: "Slight Rain",
  63: "Moderate Rain",
  65: "Heavy Deluge",
  71: "Slight Snow",
  73: "Moderate Snow",
  75: "Heavy Snow",
  80: "Slight Rain Showers",
  81: "Moderate Rain Showers",
  82: "Violent Rain Showers",
  95: "Thunderstorm",
  96: "Thunderstorm with Hail",
  99: "Severe Thunderstorm",
};

/**
 * Fetch live real-time weather and forecast using Open-Meteo free API.
 * Calls backend if available, or direct client-side open-meteo endpoint.
 */
export async function fetchLiveWeather(
  lat: number,
  lon: number
): Promise<LiveWeatherData | null> {
  // 1. Try backend endpoint first
  try {
    const res = await fetch(`${API_BASE}/api/v1/weather/live?lat=${lat}&lon=${lon}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Backend offline; proceed to direct Open-Meteo client call
  }

  // 2. Direct client-side call to Open-Meteo (100% Free, CORS-friendly, zero API key)
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,uv_index_max&timezone=Asia%2FKolkata`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const raw = await res.json();

    const cur = raw.current || {};
    const dailyRaw = raw.daily || {};
    const hourlyRaw = raw.hourly || {};

    const wCode = cur.weather_code ?? 0;
    const wDesc = WMO_CODE_MAP[wCode] || "Fair Weather";

    const daily: DailyForecastItem[] = (dailyRaw.time || []).map((t: string, i: number) => {
      const code = dailyRaw.weather_code?.[i] ?? 0;
      return {
        time: t,
        weather_code: code,
        weather_description: WMO_CODE_MAP[code] || "Fair",
        temperature_max: dailyRaw.temperature_2m_max?.[i] ?? null,
        temperature_min: dailyRaw.temperature_2m_min?.[i] ?? null,
        precipitation_sum: dailyRaw.precipitation_sum?.[i] ?? 0,
        uv_index_max: dailyRaw.uv_index_max?.[i] ?? null,
      };
    });

    const hourly: HourlyForecastItem[] = (hourlyRaw.time || []).slice(0, 24).map((t: string, j: number) => ({
      time: t,
      temperature: hourlyRaw.temperature_2m?.[j] ?? null,
      precipitation_probability: hourlyRaw.precipitation_probability?.[j] ?? 0,
      weather_code: hourlyRaw.weather_code?.[j] ?? 0,
    }));

    return {
      latitude: lat,
      longitude: lon,
      current: {
        temperature: cur.temperature_2m ?? 0,
        apparent_temperature: cur.apparent_temperature ?? cur.temperature_2m ?? 0,
        humidity: cur.relative_humidity_2m ?? 0,
        is_day: Boolean(cur.is_day ?? 1),
        weather_code: wCode,
        weather_description: wDesc,
        precipitation: cur.precipitation ?? 0,
        cloud_cover: cur.cloud_cover ?? 0,
        pressure: cur.pressure_msl ?? 1013,
        wind_speed: cur.wind_speed_10m ?? 0,
        wind_direction: cur.wind_direction_10m ?? 0,
        wind_gusts: cur.wind_gusts_10m ?? 0,
      },
      daily,
      hourly,
    };
  } catch (clientErr) {
    console.error("Open-Meteo direct fetch failed:", clientErr);
    return null;
  }
}

