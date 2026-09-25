# Historical Geospatial & Climate Data Acquisition Guide
## Climate Property Intelligence — Hackathon Reference

This guide provides practical, executable methods to acquire real historical climate, hazard, and geospatial data for training machine learning models (XGBoost/Scikit-learn) and offline feature precomputation.

---

## 1. Summary of Free & Open Historical Data Sources

| Hazard / Domain | Primary Source | Access Method | Cost / Auth | Historical Range |
|---|---|---|---|---|
| **Precipitation & Rainfall Extremes** | **Open-Meteo Archive (CHIRPS / ERA5-Land)** | REST API (JSON) | 100% Free, No API key | 1940 – Present (80+ Years) |
| **Ambient & Surface Temperature** | **Open-Meteo Archive / ERA5-Land** | REST API (JSON) | 100% Free, No API key | 1940 – Present |
| **Topography (Elevation & Slope)** | **NASA / USGS SRTM 90m DEM** | Open-Meteo Elevation API / OpenTopography | 100% Free, No API key | Global 90m resolution |
| **Cyclone Historical Tracks** | **NOAA IBTrACS (v04r01)** | Direct CSV / NetCDF download | 100% Free, Open Data | 1848 – Present |
| **Waterways & Urban Infrastructure** | **OpenStreetMap (Overpass API)** | Overpass QL / Overpass Turbo | 100% Free, Open Data | Real-time Cadastral |
| **Indian Flood Inundation Layers** | **ISRO Bhuvan / NRSC** | WMS/WFS & Bhuvan Geo-Portal | Free (Open Access) | Annual Monsoon Flood Maps |
| **Real Estate Benchmark Rates** | **NHB RESIDEX (National Housing Bank)** | NHB Public Portal / TN Registration Dept | Public Benchmark | Quarterly City Indices |

---

## 2. Acquiring Historical Climate Data (Open-Meteo ERA5 / CHIRPS)

### API Endpoint
```http
GET https://archive-api.open-meteo.com/v1/archive
```

### Essential Historical Parameters
- `latitude`, `longitude`: Coordinate of target parcel.
- `start_date`, `end_date`: Date range (e.g. `2015-01-01` to `2023-12-31`).
- `daily`:
  - `precipitation_sum` → Total daily rainfall in mm
  - `temperature_2m_max` → Daily peak temperature (°C)
  - `temperature_2m_min` → Daily minimum temperature (°C)
  - `temperature_2m_mean` → Daily mean temperature (°C)
  - `windspeed_10m_max` → Peak wind gusts / speed (km/h)
  - `relative_humidity_2m_mean` → Daily relative humidity (%)
- `timezone`: `Asia/Kolkata`

### Python Batch Extraction Script
Below is a working script to extract historical climate features for multiple locations and save them to CSV for ML model training:

```python
import httpx
import pandas as pd
import asyncio
import numpy as np

SAMPLE_LOCATIONS = [
    {"name": "Chennai Marina", "lat": 13.0827, "lon": 80.2800},
    {"name": "Chennai Velachery", "lat": 12.9759, "lon": 80.2212},
    {"name": "Cuddalore Port", "lat": 11.7500, "lon": 79.7700},
    {"name": "Nagapattinam", "lat": 10.7600, "lon": 79.8400},
    {"name": "Coimbatore RS Puram", "lat": 11.0168, "lon": 76.9558},
    {"name": "Madurai Anna Nagar", "lat": 9.9252, "lon": 78.1198},
    {"name": "Trichy Srirangam", "lat": 10.8624, "lon": 78.6912},
    {"name": "Salem", "lat": 11.6643, "lon": 78.1460},
]

async def fetch_location_history(client, loc):
    url = (
        f"https://archive-api.open-meteo.com/v1/archive?"
        f"latitude={loc['lat']}&longitude={loc['lon']}&"
        f"start_date=2015-01-01&end_date=2023-12-31&"
        f"daily=precipitation_sum,temperature_2m_max,temperature_2m_min,temperature_2m_mean,windspeed_10m_max,relative_humidity_2m_mean&"
        f"timezone=Asia%2FKolkata"
    )
    r = await client.get(url, timeout=20.0)
    if r.status_code == 200:
        data = r.json().get("daily", {})
        precip = [p for p in data.get("precipitation_sum", []) if p is not None]
        t_max = [t for t in data.get("temperature_2m_max", []) if t is not None]
        t_mean = [t for t in data.get("temperature_2m_mean", []) if t is not None]
        winds = [w for w in data.get("windspeed_10m_max", []) if w is not None]
        rh = [h for h in data.get("relative_humidity_2m_mean", []) if h is not None]

        # 9 years of data -> annual average
        annual_rainfall = sum(precip) / 9.0 if precip else 0.0
        max_1day = max(precip) if precip else 0.0

        # Rolling 3-day max deluge
        max_3day = max_1day
        if len(precip) >= 3:
            rolling_3d = [sum(precip[i:i+3]) for i in range(len(precip)-2)]
            max_3day = max(rolling_3d)

        return {
            "name": loc["name"],
            "latitude": loc["lat"],
            "longitude": loc["lon"],
            "annual_rainfall_mm": round(annual_rainfall, 1),
            "max_1day_rainfall_mm": round(max_1day, 1),
            "max_3day_rainfall_mm": round(max_3day, 1),
            "mean_temperature_c": round(np.mean(t_mean), 1) if t_mean else 28.0,
            "max_temperature_c": round(max(t_max), 1) if t_max else 38.0,
            "humidity": round(np.mean(rh), 1) if rh else 65.0,
            "max_nearby_wind": round(max(winds), 1) if winds else 60.0,
        }
    return None

async def main():
    async with httpx.AsyncClient() as client:
        tasks = [fetch_location_history(client, loc) for loc in SAMPLE_LOCATIONS]
        results = await asyncio.gather(*tasks)
        df = pd.DataFrame([r for r in results if r is not None])
        df.to_csv("historical_climate_dataset.csv", index=False)
        print("Generated historical_climate_dataset.csv successfully:")
        print(df)

if __name__ == "__main__":
    asyncio.run(main())
```

---

## 3. Acquiring NOAA IBTrACS Historical Cyclone Tracks

NOAA's **International Best Track Archive for Climate Stewardship (IBTrACS)** provides full records of tropical cyclones in the North Indian Ocean (Bay of Bengal and Arabian Sea).

- **Direct CSV Download**:  
  `https://www.ncei.noaa.gov/data/international-best-track-archive-for-climate-stewardship-ibtracs/v04r01/access/csv/ibtracs.NI.list.v04r01.csv`  
  *(NI = North Indian Ocean basin, ~45MB)*
- **Key Columns**:
  - `SID`: Storm identification number
  - `NAME`: Cyclone name (e.g., `MICHAUNG`, `GAJA`, `VARDAH`, `THANE`, `OGHNI`)
  - `ISO_TIME`: Date and time (UTC)
  - `LAT`, `LON`: Track coordinate
  - `WMO_WIND`: Maximum sustained wind speed in knots
  - `WMO_PRES`: Central atmospheric pressure in hPa
  - `DIST2LAND`: Distance to land in km

### Calculating Cyclone Proximity Features
For any property coordinate $(lat, lon)$:
1. Filter cyclone points within latitude $7.0^\circ - 22.0^\circ$ and longitude $75.0^\circ - 85.0^\circ$.
2. Compute distance $D_i$ to each track point using Haversine formula.
3. Count storms where $\min(D_i) \le 100\text{ km}$ (`cyclone_count_100km`).
4. Find the closest storm track distance (`nearest_cyclone_distance_km`).
5. Extract maximum wind recorded among nearby points (`max_nearby_wind`).

---

## 4. Acquiring NASA / USGS SRTM 90m Elevation & Slope

### Direct Elevation Query
- Open-Meteo provides immediate SRTM 90m elevation lookups without downloading hundreds of gigabytes of GeoTIFF files:
  ```http
  GET https://api.open-meteo.com/v1/elevation?latitude=13.0827&longitude=80.2707
  ```
- **Slope Computation Formula**:
  Sample elevation at $(lat, lon)$, $(lat + 0.001, lon)$, and $(lat, lon + 0.001)$:
  $$\Delta z_{lat} = |Z_{lat+0.001} - Z|, \quad \Delta z_{lon} = |Z_{lon+0.001} - Z|, \quad \Delta x \approx 111.0\text{ m}$$
  $$\text{Slope (degrees)} = \arctan\left(\frac{\sqrt{\Delta z_{lat}^2 + \Delta z_{lon}^2}}{\Delta x}\right) \times \frac{180}{\pi}$$

---

## 5. OpenStreetMap (OSM) Cadastral & Water Features

Query real rivers, drainage canals, lakes, and buildings using Overpass API:

```text
[out:json][timeout:10];
(
  way["waterway"~"river|canal|stream"](around:3000, 13.0827, 80.2707);
  way["natural"="water"](around:3000, 13.0827, 80.2707);
  way["building"](around:700, 13.0827, 80.2707);
);
out tags center 50;
```

---

## 6. How to Use Historical Data in XGBoost Models

1. **Feature Vector Assembly**:
   Combine historical rainfall, elevation, slope, water distance, and cyclone frequency into a standardized numeric vector.
2. **Ground Truth Calibration**:
   Use official disaster records (e.g., TNSDMA flood records from Dec 2015, Cyclone Vardah 2016, Cyclone Gaja 2018, Cyclone Michaung 2023) as ground-truth labels (0 to 100).
3. **Training & Export**:
   Train an `XGBRegressor` or `RandomForestRegressor`, save model weights to `.json` or `.joblib` in `backend/app/ml/models/`.
4. **Runtime Inference**:
   The FastAPI `Feature Orchestrator` queries the coordinates, constructs the vector, and runs `model.predict()`.
