"""
Tamil Nadu Climate Engine & ML Valuation Integration Service.

Integrates:
1. High-resolution ISRO/Bhuvan Flood Hazard Satellite Mask (GeoTIFF)
2. IMD Block-level Heat Exposure & Warming Trends Dataset (CSV)
3. IBTrACS Historical Cyclone Tracks within 100km buffer (CSV)
4. Trained XGBoost Property Valuation Pipeline (Joblib)
"""
import csv
import logging
from math import atan2, cos, radians, sin, sqrt
from pathlib import Path
from typing import Dict, Any, Optional, List, Tuple
import numpy as np
import pandas as pd
from PIL import Image

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"

FLOOD_RASTER = DATA_DIR / "flood" / "tamil_nadu_flood_mask_tn_2003_2020.tif"
HEAT_FILE = DATA_DIR / "heat" / "heat_risk_dataset.csv"
CYCLONE_FILE = DATA_DIR / "cyclone" / "tamil_nadu_cyclone_tracks_1980_2025.csv"
MODEL_PATH = BASE_DIR / "app" / "ml" / "models" / "property_valuation_xgb.joblib"

# Valuation & Risk weights
FLOOD_WEIGHT = 0.50
HEAT_WEIGHT = 0.30
CYCLONE_WEIGHT = 0.20
MAX_DISCOUNT = 0.20

CYCLONE_RADIUS_KM = 100.0
CYCLONE_MIN_WIND = 20.0
CYCLONE_MAX_WIND = 90.0
EARTH_RADIUS_KM = 6371.0

# GeoTIFF metadata for tamil_nadu_flood_mask_tn_2003_2020.tif
# Tiepoint: (0, 0, 0, 76.2282756875, 13.557928333333333, 0)
# Pixel scale: (0.0025756875, 0.004571666666666667, 0)
TIFF_ORIGIN_LON = 76.2282756875
TIFF_ORIGIN_LAT = 13.557928333333333
TIFF_SCALE_LON = 0.0025756875
TIFF_SCALE_LAT = 0.004571666666666667

_cached_heat_data: Optional[Dict] = None
_cached_cyclone_tracks: Optional[List[Dict]] = None
_cached_flood_image: Optional[Image.Image] = None
_cached_xgb_model: Any = None


def get_flood_image() -> Optional[Image.Image]:
    """Load and cache the flood hazard GeoTIFF image."""
    global _cached_flood_image
    if _cached_flood_image is None and FLOOD_RASTER.exists():
        try:
            _cached_flood_image = Image.open(FLOOD_RASTER)
        except Exception as e:
            logger.warning(f"Failed to open flood raster: {e}")
    return _cached_flood_image


def load_heat_data() -> Dict:
    """Load and cache the block/district heat risk dataset."""
    global _cached_heat_data
    if _cached_heat_data is not None:
        return _cached_heat_data

    heat = {}
    if not HEAT_FILE.exists():
        logger.warning(f"Heat dataset not found at {HEAT_FILE}")
        _cached_heat_data = heat
        return heat

    with open(HEAT_FILE, newline="", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        for row in reader:
            district = row.get("district", "").strip().lower()
            block = row.get("block", "").strip().lower()
            heat[(district, block)] = row
            # Store district fallback
            if district not in heat:
                heat[district] = row

    _cached_heat_data = heat
    return heat


def load_cyclone_tracks() -> List[Dict]:
    """Load and cache IBTrACS Tamil Nadu storm tracks."""
    global _cached_cyclone_tracks
    if _cached_cyclone_tracks is not None:
        return _cached_cyclone_tracks

    tracks = []
    if not CYCLONE_FILE.exists():
        logger.warning(f"Cyclone file not found at {CYCLONE_FILE}")
        _cached_cyclone_tracks = tracks
        return tracks

    with open(CYCLONE_FILE, newline="", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        for row in reader:
            wind_str = row.get("wmo_wind_knots", "").strip()
            if not wind_str:
                continue
            try:
                tracks.append(
                    {
                        "name": row.get("name", "Unknown"),
                        "season": row.get("season", "Historical"),
                        "lat": float(row["lat"]),
                        "lon": float(row["lon"]),
                        "wind": float(wind_str),
                    }
                )
            except (ValueError, KeyError):
                continue

    _cached_cyclone_tracks = tracks
    return tracks


def distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Haversine great-circle distance between two geographic coordinates in km."""
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = (
        sin(dlat / 2.0) ** 2
        + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2.0) ** 2
    )
    return EARTH_RADIUS_KM * 2.0 * atan2(sqrt(a), sqrt(1.0 - a))


def calculate_flood_exposure(latitude: float, longitude: float) -> int:
    """
    Sample flood exposure mask from the Bhuvan satellite raster at (lat, lon).
    Returns 1 if in flood hazard zone, 0 otherwise.
    """
    im = get_flood_image()
    if im is None:
        return 0

    try:
        width, height = im.size
        px = int((longitude - TIFF_ORIGIN_LON) / TIFF_SCALE_LON)
        py = int((TIFF_ORIGIN_LAT - latitude) / TIFF_SCALE_LAT)

        if 0 <= px < width and 0 <= py < height:
            val = im.getpixel((px, py))
            if isinstance(val, tuple):
                val = val[0]
            return 1 if int(val) > 0 else 0
    except Exception as e:
        logger.warning(f"Error querying flood raster pixel at ({latitude}, {longitude}): {e}")

    return 0


def calculate_heat_exposure(district: Optional[str], city: Optional[str]) -> Dict[str, Any]:
    """
    Query heat risk and temperature change for given district and city/block.
    Falls back gracefully if exact block is not in the dataset.
    """
    heat_data = load_heat_data()
    dist_clean = (district or "").strip().lower().replace(" ", "_")
    city_clean = (city or "").strip().lower().replace(" ", "_")

    # 1. Exact match (district, city/block)
    match = heat_data.get((dist_clean, city_clean))
    source = "exact_block"

    # 2. Match by city alone in dictionary keys
    if not match and city_clean:
        for (d, b), row in heat_data.items():
            if isinstance(d, str) and (b == city_clean or city_clean in b):
                match = row
                source = "block_fuzzy"
                break

    # 3. Match by district alone
    if not match and dist_clean:
        match = heat_data.get(dist_clean)
        if match:
            source = "district_mean"

    # 4. If still not matched, find any key containing district name
    if not match and dist_clean:
        for k, row in heat_data.items():
            if isinstance(k, tuple) and dist_clean in k[0]:
                match = row
                source = "district_estimate"
                break

    if not match:
        # Default baseline for Tamil Nadu semi-arid / coastal tropical
        return {
            "heat_risk": 0.42,
            "tmax_change": 0.75,
            "heat_source": "regional_baseline",
        }

    try:
        return {
            "heat_risk": float(match.get("heat_risk", 0.4)),
            "tmax_change": float(match.get("tmax_change", 0.7)),
            "heat_source": source,
        }
    except (ValueError, TypeError):
        return {
            "heat_risk": 0.42,
            "tmax_change": 0.75,
            "heat_source": "fallback",
        }


def calculate_cyclone_exposure(latitude: float, longitude: float) -> Dict[str, Any]:
    """
    Query historical IBTrACS storm tracks within 100km buffer.
    Calculates maximum wind speed, nearest cyclone distance, and normalized intensity.
    """
    tracks = load_cyclone_tracks()
    if not tracks:
        return {
            "cyclone_intensity": 0.0,
            "nearest_cyclone_km": None,
            "max_nearby_wind_knots": None,
            "cyclone_source": "unavailable",
        }

    nearby = []
    min_dist = float("inf")
    nearest_track = None

    for track in tracks:
        dist = distance_km(latitude, longitude, track["lat"], track["lon"])
        if dist < min_dist:
            min_dist = dist
            nearest_track = track
        if dist <= CYCLONE_RADIUS_KM:
            nearby.append((track, dist))

    if not nearby:
        # Check closest storm overall for context
        return {
            "cyclone_intensity": 0.0,
            "nearest_cyclone_km": round(min_dist, 1) if nearest_track else None,
            "max_nearby_wind_knots": nearest_track["wind"] if nearest_track else None,
            "cyclone_source": "no_valid_track_within_100km",
        }

    strongest_track, _ = max(nearby, key=lambda item: item[0]["wind"])
    wind = strongest_track["wind"]

    intensity = (wind - CYCLONE_MIN_WIND) / (CYCLONE_MAX_WIND - CYCLONE_MIN_WIND)
    intensity = max(0.0, min(1.0, intensity))

    return {
        "cyclone_intensity": round(intensity, 3),
        "nearest_cyclone_km": round(min(d for _, d in nearby), 1),
        "max_nearby_wind_knots": wind,
        "cyclone_source": "historical_track_100km",
    }


def calculate_climate_risk(
    flood_exposure: Optional[float],
    heat_risk: Optional[float],
    cyclone_intensity: Optional[float],
) -> Dict[str, Any]:
    """Calculate aggregate climate risk and valuation adjustment percentage."""
    factors = []
    weighted_sum = 0.0
    available_weight = 0.0

    if flood_exposure is not None:
        weighted_sum += FLOOD_WEIGHT * flood_exposure
        available_weight += FLOOD_WEIGHT
        factors.append("Flood")

    if heat_risk is not None:
        weighted_sum += HEAT_WEIGHT * heat_risk
        available_weight += HEAT_WEIGHT
        factors.append("Heat")

    if cyclone_intensity is not None:
        weighted_sum += CYCLONE_WEIGHT * cyclone_intensity
        available_weight += CYCLONE_WEIGHT
        factors.append("Cyclone")

    if available_weight > 0:
        risk_score = weighted_sum / available_weight
    else:
        risk_score = 0.0

    adjustment = MAX_DISCOUNT * risk_score
    completeness = available_weight / (FLOOD_WEIGHT + HEAT_WEIGHT + CYCLONE_WEIGHT)

    return {
        "risk_score": round(risk_score, 3),
        "adjustment_percent": round(adjustment * 100.0, 2),
        "available_factors": factors,
        "data_completeness": round(completeness, 3),
    }


def get_xgb_model():
    """Load and cache the trained XGBoost property valuation pipeline."""
    global _cached_xgb_model
    if _cached_xgb_model is None and MODEL_PATH.exists():
        try:
            import joblib
            _cached_xgb_model = joblib.load(MODEL_PATH)
        except Exception as e:
            logger.warning(f"Could not load XGBoost model from {MODEL_PATH}: {e}")
    return _cached_xgb_model


def predict_ml_base_valuation_with_source(
    area_sqft: float,
    area_name: Optional[str] = None,
    property_type: str = "residential",
    bedrooms: int = 2,
    bathrooms: int = 2,
) -> Tuple[Optional[float], str]:
    """
    Predict property market valuation benchmark with transparent source attribution.
    - Uses trained XGBoost model for verified Chennai metropolitan areas.
    - Uses official Tamil Nadu NHB/Guideline database for other districts/cities
      (Madurai, Coimbatore, Trichy, Salem, etc.) so non-Chennai properties
      are not falsely benchmarked against Chennai prices.
    """
    clean_name = (area_name or "").lower().strip()

    # Chennai specific neighborhoods trained in XGBoost
    chennai_trained_areas = [
        "karapakkam", "anna nagar", "adyar", "velachery",
        "chrompet", "kk nagar", "t nagar"
    ]

    is_explicit_other_city = any(
        c in clean_name for c in [
            "madurai", "coimbatore", "trichy", "tiruchirappalli", "salem",
            "tirunelveli", "thoothukudi", "vellore", "erode", "thanjavur",
            "dindigul", "hosur", "kanchipuram", "cuddalore", "pudukkottai"
        ]
    )

    # 1. If it's Chennai and matches a known Chennai area, use XGBoost
    matched_chennai_area = None
    if not is_explicit_other_city:
        for ka in chennai_trained_areas:
            if ka in clean_name:
                matched_chennai_area = ka.title()
                break
        if not matched_chennai_area and ("chennai" in clean_name or "omr" in clean_name or "ecr" in clean_name):
            matched_chennai_area = "Velachery"

    if matched_chennai_area:
        model = get_xgb_model()
        if model is not None:
            btype = "House"
            if "commercial" in property_type.lower():
                btype = "Commercial"
            elif "apartment" in property_type.lower():
                btype = "House"

            row = {
                "AREA": matched_chennai_area,
                "INT_SQFT": float(area_sqft),
                "DIST_MAINROAD": 50,
                "N_BEDROOM": max(1, bedrooms),
                "N_BATHROOM": max(1, bathrooms),
                "N_ROOM": max(2, bedrooms + bathrooms + 1),
                "SALE_COND": "Normal Sale",
                "PARK_FACIL": "Yes",
                "BUILDTYPE": btype,
                "UTILITY_AVAIL": "AllPub",
                "STREET": "Paved",
                "MZZONE": "RH",
                "QS_ROOMS": 4.0,
                "QS_BATHROOM": 4.0,
                "QS_BEDROOM": 4.0,
                "QS_OVERALL": 4.0,
                "COMMIS": 0,
            }
            try:
                df = pd.DataFrame([row])
                pred = float(model.predict(df)[0])
                return round(pred, 2), f"Based on Chennai housing ML model ({matched_chennai_area})"
            except Exception as e:
                logger.warning(f"XGBoost prediction failed: {e}")

    # 2. For non-Chennai regions or fallback, use verified Tamil Nadu regional benchmark rates
    from app.services.geocoding import MARKET_RATES as TAMIL_NADU_GUIDELINE_RATES

    matched_city = None
    matched_rate = None

    # Check for exact locality or city matches
    for loc, rate in TAMIL_NADU_GUIDELINE_RATES.items():
        if loc in clean_name:
            matched_city = loc.title()
            matched_rate = rate
            break

    if not matched_rate:
        # Check district / major city names
        city_fallbacks = {
            "madurai": ("Madurai", 4800),
            "coimbatore": ("Coimbatore", 6500),
            "trichy": ("Tiruchirappalli", 4500),
            "tiruchirappalli": ("Tiruchirappalli", 4500),
            "salem": ("Salem", 4200),
            "tirunelveli": ("Tirunelveli", 3600),
            "vellore": ("Vellore", 4200),
            "erode": ("Erode", 4500),
            "thanjavur": ("Thanjavur", 3600),
            "cuddalore": ("Cuddalore", 3600),
            "thoothukudi": ("Thoothukudi", 3400),
            "dindigul": ("Dindigul", 3200),
            "pudukkottai": ("Pudukkottai", 2800),
        }
        for ckey, (cname, crate) in city_fallbacks.items():
            if ckey in clean_name:
                matched_city = cname
                matched_rate = crate
                break

    if not matched_rate:
        matched_city = "Tamil Nadu Regional"
        matched_rate = 4500

    type_multiplier = 1.25 if "commercial" in property_type.lower() else (1.05 if "apartment" in property_type.lower() else 1.0)
    calculated_benchmark = float(round(area_sqft * matched_rate * type_multiplier, 2))
    source_label = f"Based on {matched_city} regional property benchmark"
    return calculated_benchmark, source_label


def predict_ml_base_valuation(
    area_sqft: float,
    area_name: Optional[str] = None,
    property_type: str = "residential",
    bedrooms: int = 2,
    bathrooms: int = 2,
) -> Optional[float]:
    """
    Backwards-compatible wrapper returning float valuation benchmark.
    """
    val, _ = predict_ml_base_valuation_with_source(
        area_sqft=area_sqft,
        area_name=area_name,
        property_type=property_type,
        bedrooms=bedrooms,
        bathrooms=bathrooms,
    )
    return val


def calculate_property_valuation(
    district: str,
    city: str,
    latitude: float,
    longitude: float,
    area_sqft: float,
    market_rate_per_sqft: float,
    property_type: str = "residential",
    area_name: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Calculate full climate-adjusted property valuation.
    Compatible with both Harishraja's specification and the enterprise platform.
    """
    base_value = float(area_sqft * market_rate_per_sqft)

    # ML valuation estimate with source attribution
    ml_predicted_base, bench_source = predict_ml_base_valuation_with_source(
        area_sqft=area_sqft,
        area_name=area_name or city,
        property_type=property_type,
    )

    flood = calculate_flood_exposure(latitude, longitude)
    heat = calculate_heat_exposure(district, city)
    cyclone = calculate_cyclone_exposure(latitude, longitude)

    risk = calculate_climate_risk(
        flood_exposure=flood,
        heat_risk=heat.get("heat_risk"),
        cyclone_intensity=cyclone.get("cyclone_intensity"),
    )

    adj_pct = risk["adjustment_percent"] / 100.0
    adjusted_value = base_value * (1.0 - adj_pct)

    return {
        "base_value": round(base_value, 2),
        "ml_predicted_base_value": ml_predicted_base,
        "benchmark_source": bench_source,
        "flood_exposure": flood,
        "heat": heat,
        "cyclone": cyclone,
        "risk": risk,
        "adjusted_value": round(adjusted_value, 2),
    }
