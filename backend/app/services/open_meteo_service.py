"""
Open-Meteo Service — 100% Free real climate, elevation, and weather API.
No API key required.
Fetches real SRTM 90m digital elevation and historical climate extremes (CHIRPS / ERA5-Land).
"""
import httpx
import hashlib
import math
import time
from typing import Dict, Any, Optional, List, Tuple

# In-memory cache to guarantee fast response and avoid rate limits
_climate_cache: Dict[str, Any] = {}
_elevation_cache: Dict[str, float] = {}
_station_temp_cache: Dict[str, Any] = {"data": {}, "timestamp": 0}

USER_AGENT = "TerraValueTamilNadu/1.0 (Hackathon Educational Research; contact@smith.edu)"


async def get_real_elevation(lat: float, lon: float) -> Optional[float]:
    """
    Fetch exact SRTM 90m elevation in meters for coordinates.
    """
    cache_key = f"{lat:.4f}_{lon:.4f}"
    if cache_key in _elevation_cache:
        return _elevation_cache[cache_key]

    url = f"https://api.open-meteo.com/v1/elevation?latitude={lat}&longitude={lon}"
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            r = await client.get(url, headers={"User-Agent": USER_AGENT})
            if r.status_code == 200:
                data = r.json()
                elevation_list = data.get("elevation", [])
                if elevation_list and elevation_list[0] is not None:
                    elev = float(elevation_list[0])
                    _elevation_cache[cache_key] = elev
                    return elev
    except Exception as e:
        print(f"[Open-Meteo Elevation Error] {e}")

    return None


async def get_real_slope(lat: float, lon: float) -> float:
    """
    Compute real terrain slope in degrees using SRTM 90m elevation gradients.
    """
    try:
        # Sample center and 0.001 deg offsets (~111 meters)
        lats = [lat, round(lat + 0.001, 5), lat]
        lons = [lon, lon, round(lon + 0.001, 5)]
        url = f"https://api.open-meteo.com/v1/elevation?latitude={','.join(map(str, lats))}&longitude={','.join(map(str, lons))}"
        async with httpx.AsyncClient(timeout=8.0) as client:
            r = await client.get(url, headers={"User-Agent": USER_AGENT})
            if r.status_code == 200:
                elevs = r.json().get("elevation", [])
                if len(elevs) >= 3 and all(e is not None for e in elevs):
                    dz_lat = abs(elevs[1] - elevs[0])
                    dz_lon = abs(elevs[2] - elevs[0])
                    dx = 111.0
                    slope = math.degrees(math.atan(math.sqrt(dz_lat**2 + dz_lon**2) / dx))
                    return round(slope, 1)
    except Exception as e:
        print(f"[Open-Meteo Slope Error] {e}")

    return 1.5


async def get_real_historical_climate(lat: float, lon: float) -> Optional[Dict[str, float]]:
    """
    Fetch real historical rainfall, single-day deluge,
    temperature extremes, and peak wind speed from Open-Meteo Climate Archive (ERA5-Land / CHIRPS).
    """
    cache_key = f"{lat:.4f}_{lon:.4f}"
    if cache_key in _climate_cache:
        return _climate_cache[cache_key]

    url = (
        f"https://archive-api.open-meteo.com/v1/archive?"
        f"latitude={lat}&longitude={lon}&"
        f"start_date=2023-01-01&end_date=2023-12-31&"
        f"daily=precipitation_sum,temperature_2m_max,temperature_2m_min,temperature_2m_mean,windspeed_10m_max,relative_humidity_2m_mean&"
        f"timezone=Asia%2FKolkata"
    )

    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            r = await client.get(url, headers={"User-Agent": USER_AGENT})
            if r.status_code == 200:
                data = r.json().get("daily", {})
                precip = [p for p in data.get("precipitation_sum", []) if p is not None]
                temp_max = [t for t in data.get("temperature_2m_max", []) if t is not None]
                temp_min = [t for t in data.get("temperature_2m_min", []) if t is not None]
                temp_mean = [t for t in data.get("temperature_2m_mean", []) if t is not None]
                winds = [w for w in data.get("windspeed_10m_max", []) if w is not None]
                rh = [h for h in data.get("relative_humidity_2m_mean", []) if h is not None]

                annual_rainfall = sum(precip) if precip else 1100.0
                max_1day = max(precip) if precip else 0.0

                # Calculate rolling 3-day rainfall
                max_3day = max_1day
                if len(precip) >= 3:
                    rolling_3day = [
                        sum(precip[i : i + 3]) for i in range(len(precip) - 2)
                    ]
                    max_3day = max(rolling_3day)

                mean_humidity = round(sum(rh) / len(rh), 1) if rh else 65.0
                day_lst = round(sum(temp_max) / len(temp_max), 1) if temp_max else 32.0
                night_lst = round(sum(temp_min) / len(temp_min), 1) if temp_min else 24.0

                result = {
                    "annual_rainfall_mm": round(annual_rainfall, 1),
                    "max_1day_rainfall_mm": round(max_1day, 1),
                    "max_3day_rainfall_mm": round(max_3day, 1),
                    "max_temperature_c": round(max(temp_max), 1) if temp_max else 38.0,
                    "mean_temperature_c": round(sum(temp_mean) / len(temp_mean), 1) if temp_mean else 28.5,
                    "day_lst_c": day_lst,
                    "night_lst_c": night_lst,
                    "humidity": mean_humidity,
                    "max_nearby_wind": round(max(winds), 1) if winds else 55.0,
                }

                _climate_cache[cache_key] = result
                return result
    except Exception as e:
        print(f"[Open-Meteo Historical Climate Error] {e}")

    return None


async def get_batch_station_temperatures(centroids: List[Dict[str, Any]]) -> Dict[str, float]:
    """
    Fetch live real-time ambient temperatures for Tamil Nadu weather stations via Open-Meteo API.
    Cached for 15 minutes to preserve performance.
    """
    now = time.time()
    if _station_temp_cache["timestamp"] and (now - _station_temp_cache["timestamp"] < 900):
        if _station_temp_cache["data"]:
            return _station_temp_cache["data"]

    try:
        lats = [c["lat"] for c in centroids]
        lons = [c["lon"] for c in centroids]
        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={','.join(map(str, lats))}&"
            f"longitude={','.join(map(str, lons))}&"
            f"current=temperature_2m"
        )
        async with httpx.AsyncClient(timeout=8.0) as client:
            r = await client.get(url, headers={"User-Agent": USER_AGENT})
            if r.status_code == 200:
                results = r.json()
                temp_map: Dict[str, float] = {}
                for idx, item in enumerate(results):
                    st_name = centroids[idx]["name"]
                    current_temp = item.get("current", {}).get("temperature_2m")
                    if current_temp is not None:
                        temp_map[st_name] = float(current_temp)

                if temp_map:
                    _station_temp_cache["data"] = temp_map
                    _station_temp_cache["timestamp"] = now
                    return temp_map
    except Exception as e:
        print(f"[Open-Meteo Batch Temperature Error] {e}")

    return _station_temp_cache.get("data", {})


WMO_WEATHER_DESCRIPTIONS: Dict[int, str] = {
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
    65: "Heavy Deluge / Rain",
    71: "Slight Snow Fall",
    73: "Moderate Snow Fall",
    75: "Heavy Snow Fall",
    80: "Slight Rain Showers",
    81: "Moderate Rain Showers",
    82: "Violent Rain Showers",
    95: "Thunderstorm",
    96: "Thunderstorm with Slight Hail",
    99: "Severe Thunderstorm with Hail",
}


async def get_live_weather(lat: float, lon: float) -> Optional[Dict[str, Any]]:
    """
    Fetch comprehensive live weather conditions and forecast for coordinates using Open-Meteo free API.
    """
    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lon}&"
        f"current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m&"
        f"hourly=temperature_2m,precipitation_probability,weather_code&"
        f"daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,uv_index_max&"
        f"timezone=Asia%2FKolkata"
    )

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.get(url, headers={"User-Agent": USER_AGENT})
            if r.status_code == 200:
                raw = r.json()
                cur = raw.get("current", {})
                daily = raw.get("daily", {})
                hourly = raw.get("hourly", {})

                w_code = cur.get("weather_code", 0)
                weather_desc = WMO_WEATHER_DESCRIPTIONS.get(w_code, "Fair Weather")

                # Parse daily forecast (7 days)
                daily_forecasts = []
                days_times = daily.get("time", [])
                for i, d_time in enumerate(days_times):
                    dw_code = daily.get("weather_code", [])[i] if i < len(daily.get("weather_code", [])) else 0
                    daily_forecasts.append({
                        "time": d_time,
                        "weather_code": dw_code,
                        "weather_description": WMO_WEATHER_DESCRIPTIONS.get(dw_code, "Fair"),
                        "temperature_max": daily.get("temperature_2m_max", [])[i] if i < len(daily.get("temperature_2m_max", [])) else None,
                        "temperature_min": daily.get("temperature_2m_min", [])[i] if i < len(daily.get("temperature_2m_min", [])) else None,
                        "precipitation_sum": daily.get("precipitation_sum", [])[i] if i < len(daily.get("precipitation_sum", [])) else 0.0,
                        "uv_index_max": daily.get("uv_index_max", [])[i] if i < len(daily.get("uv_index_max", [])) else None,
                    })

                # Parse next 24 hours
                hourly_forecasts = []
                h_times = hourly.get("time", [])[:24]
                for j, h_time in enumerate(h_times):
                    hourly_forecasts.append({
                        "time": h_time,
                        "temperature": hourly.get("temperature_2m", [])[j] if j < len(hourly.get("temperature_2m", [])) else None,
                        "precipitation_probability": hourly.get("precipitation_probability", [])[j] if j < len(hourly.get("precipitation_probability", [])) else 0,
                        "weather_code": hourly.get("weather_code", [])[j] if j < len(hourly.get("weather_code", [])) else 0,
                    })

                return {
                    "latitude": lat,
                    "longitude": lon,
                    "current": {
                        "temperature": cur.get("temperature_2m", 0.0),
                        "apparent_temperature": cur.get("apparent_temperature", cur.get("temperature_2m", 0.0)),
                        "humidity": cur.get("relative_humidity_2m", 0),
                        "is_day": bool(cur.get("is_day", 1)),
                        "weather_code": w_code,
                        "weather_description": weather_desc,
                        "precipitation": cur.get("precipitation", 0.0),
                        "cloud_cover": cur.get("cloud_cover", 0),
                        "pressure": cur.get("pressure_msl", 1013.0),
                        "wind_speed": cur.get("wind_speed_10m", 0.0),
                        "wind_direction": cur.get("wind_direction_10m", 0),
                        "wind_gusts": cur.get("wind_gusts_10m", 0.0),
                    },
                    "daily": daily_forecasts,
                    "hourly": hourly_forecasts,
                }
    except Exception as e:
        print(f"[Open-Meteo Live Weather Error] {e}")

    return None
