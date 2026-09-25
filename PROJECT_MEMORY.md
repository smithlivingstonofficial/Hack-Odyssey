# PROJECT MEMORY: Climate Property Intelligence
## AI & GIS-Powered Climate-Adjusted Property Valuation Platform

---

## 1. Executive Summary & Purpose
- **Project Name**: Climate Property Intelligence (TerraValue)
- **Core Proposition**: Converts physical climate hazards (flood, heat, cyclone) into property-level financial haircuts and climate-adjusted valuations.
- **Key Question Answered**: *"How does climate risk affect the financial value and long-term risk profile of this property?"*
- **Primary Audiences**: Property buyers & sellers, real-estate investors, commercial banks/mortgage lenders, insurance underwriters, urban planners.

---

## 2. Core Value Chain & Architecture
```
Property Location (Address / PIN / Map Click)
      ↓
Geocoding & Reverse Geocoding (Nominatim / OSM)
      ↓
Deterministic Feature Orchestrator
      ├── Open-Meteo SRTM 90m Elevation & Gradient Slope
      ├── Open-Meteo Historical Climate Archive (CHIRPS & ERA5-Land)
      ├── OpenStreetMap Overpass (Real Cadastre, Waterways & Buildings)
      ├── NOAA IBTrACS Cyclone Track Corridors
      └── Live Open-Meteo Current Weather & Doppler Radar
      ↓
Standardized Climate Feature Vector (20+ Environmental Features)
      ↓
Multi-Hazard ML Models (XGBoost / Scikit-Learn)
      ├── Flood Risk Prediction (0 - 100) + Driver Attributions
      ├── Heat Stress Prediction (0 - 100) + Driver Attributions
      └── Cyclone Surge Prediction (0 - 100) + Driver Attributions
      ↓
Transparent Valuation Engine
      ├── Base Value = Built-Up Area × Market / Guideline Rate
      ├── Hazard Discounts = Non-linear impact curves - Resilience Reductions
      └── Climate-Adjusted Value = Base Value - Total Climate Haircut
      ↓
Next.js Interactive GIS Dashboard
      ├── Edge-to-Edge OpenStreetMap Basemap
      ├── Continuous Live Thermal Heatmap
      ├── Live Open-Meteo Real-Time Weather Widget
      └── Explainability Memorandum & Executive Valuation Report
```

---

## 3. Technology Stack & Deployment

| Layer | Technologies | Role |
|---|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Vanilla CSS | Interactive UI, Leaflet Maps, Weather Widget, Executive Reports |
| **Backend** | Python 3.11+, FastAPI, Uvicorn, HTTPX, Pydantic v2 | Feature Orchestrator, Geocoding, Valuation Engine, ML Inference |
| **Maps & GIS** | Leaflet, React-Leaflet, Leaflet.heat, OpenStreetMap Tiles | Map rendering, heatmap overlays, spatial inspection markers |
| **Data APIs** | Open-Meteo (Elevation & Archive), Overpass API, RainViewer | 100% Free, zero-API-key earth observation and cadastral feeds |
| **Machine Learning** | XGBoost, Scikit-learn, NumPy, Pandas | Multi-hazard risk assessment models |
| **Database** | PostgreSQL / Supabase with PostGIS | Property records, feature snapshots, audit trails |
| **Deployment** | Vercel (Frontend), Render / Railway (Backend) | Production cloud hosting |

---

## 4. Standardized Climate Feature Vector

Every property location is compiled into a deterministic feature vector:

```typescript
export interface ClimateFeatures {
  elevation_m: number;               // Real SRTM 90m elevation
  slope_deg: number;                 // Real terrain slope in degrees
  annual_rainfall_mm: number;        // ERA5-Land / CHIRPS 12-month precipitation
  max_1day_rainfall_mm: number;      // Peak single-day storm deluge
  max_3day_rainfall_mm: number;      // Rolling 3-day extreme rainfall
  mean_temperature_c: number;        // Annual mean temperature
  max_temperature_c: number;         // Peak extreme summer temperature
  humidity: number;                  // Mean relative humidity (%)
  mean_wind_speed: number;           // Mean wind speed (km/h)
  day_lst_c: number;                 // Daytime land surface temperature proxy
  night_lst_c: number;               // Nighttime minimum surface temperature
  water_occurrence: number;          // Historical surface water presence (%)
  distance_to_water_m: number;       // Distance to nearest coast or estuary (m)
  distance_to_river_m: number;       // Distance to major river drainage channel (m)
  built_fraction: number;            // Urban impervious surface fraction (0 to 1)
  vegetation_fraction: number;       // Tree canopy / vegetation fraction (0 to 1)
  cyclone_count_100km: number;       // Historical storms passing within 100km
  nearest_cyclone_distance_km: number;// Distance to historical landfall corridor
  max_nearby_wind: number;           // Maximum recorded storm wind velocity
}
```

---

## 5. Valuation & Financial Impact Engine

### 1. Base Valuation
$$\text{Base Value (₹)} = \text{Area (sq.ft)} \times \text{Guideline / Market Rate (₹/sq.ft)}$$

### 2. Hazard Financial Impact
Impact follows a calibrated non-linear damage curve:
- Score $< 15$: No significant financial haircut.
- Score $15 - 100$: Quadratic scaling with hazard vulnerability caps:
  - **Flood Maximum**: Up to 12.0%
  - **Cyclone Maximum**: Up to 8.0%
  - **Heat Maximum**: Up to 5.0%

### 3. Resilience Reductions
Engineering adaptations directly reduce the hazard impact haircut:
- Flood barrier / sump pump: **-30% flood discount**
- High-albedo cool roof: **-25% heat discount**
- Storm-resistant reinforced roofing & glazing: **-35% cyclone discount**

### 4. Adjusted Value
$$\text{Adjusted Value} = \text{Base Value} - (\text{Flood Impact} + \text{Heat Impact} + \text{Cyclone Impact})$$

---

## 6. Critical Architectural Rules & Guidelines

1. **Deterministic Feature Orchestrator**:
   - Never use an LLM or non-deterministic agent to fabricate environmental features.
   - Use direct, repeatable API calls and geometric algorithms.
2. **Zero Hardcoded Dummy Datasets**:
   - All spatial, elevation, weather, and property data must come from real APIs (Open-Meteo, OSM, RainViewer) or real database records.
   - If an API returns no data, return empty structures `[]` rather than fabricating fake assets.
3. **Institutional Explainability**:
   - Never display a risk score or discount without its underlying driver factors (e.g. elevation, max 1-day rainfall, distance to water).
4. **Resilience & Fallback Architecture**:
   - The frontend includes client-side direct API fallback if the backend server is temporarily paused or offline.

---

## 7. Fast Run Commands

```bash
# Root Workspace: Start Next.js Frontend
npm run dev

# Root Workspace: Start FastAPI Backend
npm run dev:backend

# Production Build Verification
npm run build
```
