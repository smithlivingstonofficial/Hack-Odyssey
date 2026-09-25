"""
ML Risk Models for flood, heat, and cyclone prediction.

For the hackathon MVP, these use rule-based scoring with weighted features
that simulate trained XGBoost model behavior. The architecture is designed
so that real trained models can be loaded from .json/.joblib files as
drop-in replacements.

Each model returns a score (0-100) and explainability drivers.
"""
import numpy as np
from typing import List, Tuple
from app.schemas.property import ClimateFeatures, RiskScore, RiskDriver


def _categorize_risk(score: float) -> str:
    """Convert numeric score to risk category."""
    if score >= 75:
        return "VERY HIGH"
    elif score >= 50:
        return "HIGH"
    elif score >= 25:
        return "MODERATE"
    else:
        return "LOW"


def _impact_level(contribution: float) -> str:
    """Determine impact level of a risk driver."""
    if contribution >= 0.3:
        return "high"
    elif contribution >= 0.15:
        return "medium"
    else:
        return "low"


# ──────────────────────────────────────────────────────────────────────
# FLOOD RISK MODEL
# ──────────────────────────────────────────────────────────────────────

def predict_flood_risk(features: ClimateFeatures, lat: float, lon: float) -> RiskScore:
    """
    Predict flood risk score based on environmental features.

    Key factors:
    - Low elevation increases flood risk
    - High rainfall intensity increases flood risk
    - Proximity to water bodies increases flood risk
    - High water occurrence indicates historical flooding
    - Low vegetation (more impervious surface) increases runoff
    """
    drivers: List[RiskDriver] = []
    scores = []

    # 1. Elevation factor (lower = more risk)
    if features.elevation_m < 10:
        elev_score = 90
    elif features.elevation_m < 30:
        elev_score = 70
    elif features.elevation_m < 100:
        elev_score = 40
    elif features.elevation_m < 300:
        elev_score = 20
    else:
        elev_score = 5

    scores.append(("elevation", elev_score, 0.20))
    drivers.append(RiskDriver(
        factor="Elevation",
        value=f"{features.elevation_m:.0f}m above sea level",
        impact=_impact_level(elev_score / 100 * 0.20),
        description="Low-lying areas are more susceptible to flooding" if elev_score > 50
        else "Higher elevation reduces flood risk"
    ))

    # 2. Rainfall intensity
    if features.max_1day_rainfall_mm > 200:
        rain_score = 90
    elif features.max_1day_rainfall_mm > 150:
        rain_score = 70
    elif features.max_1day_rainfall_mm > 100:
        rain_score = 50
    elif features.max_1day_rainfall_mm > 50:
        rain_score = 30
    else:
        rain_score = 10

    scores.append(("rainfall", rain_score, 0.25))
    drivers.append(RiskDriver(
        factor="Rainfall Intensity",
        value=f"{features.max_1day_rainfall_mm:.0f}mm max single-day rainfall",
        impact=_impact_level(rain_score / 100 * 0.25),
        description="High-intensity rainfall events increase flash flood risk"
        if rain_score > 50 else "Moderate rainfall reduces sudden flooding risk"
    ))

    # 3. Water proximity
    dist_water_km = features.distance_to_water_m / 1000
    if dist_water_km < 0.5:
        water_score = 90
    elif dist_water_km < 2:
        water_score = 70
    elif dist_water_km < 5:
        water_score = 45
    elif dist_water_km < 15:
        water_score = 20
    else:
        water_score = 5

    scores.append(("water_proximity", water_score, 0.20))
    drivers.append(RiskDriver(
        factor="Water Proximity",
        value=f"{dist_water_km:.1f}km to nearest water body",
        impact=_impact_level(water_score / 100 * 0.20),
        description="Close proximity to water bodies increases flood exposure"
        if water_score > 50 else "Distance from water reduces direct flood exposure"
    ))

    # 4. Historical water occurrence
    if features.water_occurrence > 60:
        wocc_score = 90
    elif features.water_occurrence > 40:
        wocc_score = 65
    elif features.water_occurrence > 20:
        wocc_score = 40
    elif features.water_occurrence > 5:
        wocc_score = 20
    else:
        wocc_score = 5

    scores.append(("water_occurrence", wocc_score, 0.20))
    drivers.append(RiskDriver(
        factor="Historical Water Presence",
        value=f"{features.water_occurrence:.0f}% occurrence",
        impact=_impact_level(wocc_score / 100 * 0.20),
        description="High historical water presence indicates recurring flood events"
        if wocc_score > 50 else "Low historical water presence at this location"
    ))

    # 5. Slope (flat terrain pools water)
    if features.slope_deg < 1:
        slope_score = 80
    elif features.slope_deg < 3:
        slope_score = 50
    elif features.slope_deg < 5:
        slope_score = 30
    else:
        slope_score = 10

    scores.append(("slope", slope_score, 0.15))
    drivers.append(RiskDriver(
        factor="Terrain Slope",
        value=f"{features.slope_deg:.1f}° slope",
        impact=_impact_level(slope_score / 100 * 0.15),
        description="Flat terrain impedes drainage and pools water"
        if slope_score > 50 else "Sloped terrain allows better natural drainage"
    ))

    # Weighted score
    total_score = sum(s * w for _, s, w in scores)
    total_score = min(100, max(0, total_score))

    # Sort drivers by impact
    drivers.sort(key=lambda d: {"high": 3, "medium": 2, "low": 1}[d.impact], reverse=True)

    return RiskScore(
        hazard="flood",
        score=round(total_score, 1),
        category=_categorize_risk(total_score),
        confidence=0.72,  # Prototype model confidence
        drivers=drivers
    )


# ──────────────────────────────────────────────────────────────────────
# HEAT RISK MODEL
# ──────────────────────────────────────────────────────────────────────

def predict_heat_risk(features: ClimateFeatures, lat: float, lon: float) -> RiskScore:
    """
    Predict heat risk score based on environmental features.

    Key factors:
    - High temperatures (mean and max)
    - Urban heat island effect (high built fraction, low vegetation)
    - High land surface temperature
    - Low humidity can worsen heat stress in some contexts
    """
    drivers: List[RiskDriver] = []
    scores = []

    # 1. Maximum temperature
    if features.max_temperature_c > 45:
        temp_score = 95
    elif features.max_temperature_c > 42:
        temp_score = 80
    elif features.max_temperature_c > 38:
        temp_score = 60
    elif features.max_temperature_c > 35:
        temp_score = 40
    elif features.max_temperature_c > 30:
        temp_score = 20
    else:
        temp_score = 5

    scores.append(("temperature", temp_score, 0.30))
    drivers.append(RiskDriver(
        factor="Maximum Temperature",
        value=f"{features.max_temperature_c:.1f}°C recorded maximum",
        impact=_impact_level(temp_score / 100 * 0.30),
        description="Extreme heat events pose significant health and structural risks"
        if temp_score > 50 else "Temperature within manageable range"
    ))

    # 2. Land Surface Temperature (day)
    if features.day_lst_c > 45:
        lst_score = 90
    elif features.day_lst_c > 40:
        lst_score = 70
    elif features.day_lst_c > 35:
        lst_score = 50
    elif features.day_lst_c > 30:
        lst_score = 25
    else:
        lst_score = 10

    scores.append(("lst", lst_score, 0.25))
    drivers.append(RiskDriver(
        factor="Land Surface Temperature",
        value=f"{features.day_lst_c:.1f}°C daytime surface temperature",
        impact=_impact_level(lst_score / 100 * 0.25),
        description="High surface temperature indicates urban heat island effect"
        if lst_score > 50 else "Surface temperature within normal range"
    ))

    # 3. Urban heat island (built-up fraction)
    if features.built_fraction > 0.7:
        uhi_score = 85
    elif features.built_fraction > 0.5:
        uhi_score = 65
    elif features.built_fraction > 0.3:
        uhi_score = 40
    elif features.built_fraction > 0.1:
        uhi_score = 20
    else:
        uhi_score = 5

    scores.append(("uhi", uhi_score, 0.20))
    drivers.append(RiskDriver(
        factor="Urban Heat Island",
        value=f"{features.built_fraction * 100:.0f}% built-up area",
        impact=_impact_level(uhi_score / 100 * 0.20),
        description="Dense urban areas trap heat and increase local temperature"
        if uhi_score > 50 else "Lower urban density reduces heat island effect"
    ))

    # 4. Vegetation cover (cooling effect)
    if features.vegetation_fraction < 0.05:
        veg_score = 80
    elif features.vegetation_fraction < 0.15:
        veg_score = 60
    elif features.vegetation_fraction < 0.3:
        veg_score = 35
    elif features.vegetation_fraction < 0.5:
        veg_score = 15
    else:
        veg_score = 5

    scores.append(("vegetation", veg_score, 0.15))
    drivers.append(RiskDriver(
        factor="Vegetation Cover",
        value=f"{features.vegetation_fraction * 100:.0f}% green cover",
        impact=_impact_level(veg_score / 100 * 0.15),
        description="Low vegetation reduces natural cooling and increases heat"
        if veg_score > 50 else "Good vegetation cover provides natural cooling"
    ))

    # 5. Nighttime LST (recovery)
    if features.night_lst_c > 30:
        night_score = 85
    elif features.night_lst_c > 26:
        night_score = 55
    elif features.night_lst_c > 22:
        night_score = 30
    else:
        night_score = 10

    scores.append(("night_temp", night_score, 0.10))
    drivers.append(RiskDriver(
        factor="Nighttime Temperature",
        value=f"{features.night_lst_c:.1f}°C nighttime surface temperature",
        impact=_impact_level(night_score / 100 * 0.10),
        description="High nighttime temperatures prevent heat recovery"
        if night_score > 50 else "Adequate nighttime cooling"
    ))

    total_score = sum(s * w for _, s, w in scores)
    total_score = min(100, max(0, total_score))

    drivers.sort(key=lambda d: {"high": 3, "medium": 2, "low": 1}[d.impact], reverse=True)

    return RiskScore(
        hazard="heat",
        score=round(total_score, 1),
        category=_categorize_risk(total_score),
        confidence=0.75,
        drivers=drivers
    )


# ──────────────────────────────────────────────────────────────────────
# CYCLONE RISK MODEL
# ──────────────────────────────────────────────────────────────────────

def predict_cyclone_risk(features: ClimateFeatures, lat: float, lon: float) -> RiskScore:
    """
    Predict cyclone risk based on historical exposure and geography.

    Key factors:
    - Historical cyclone count near location
    - Distance to nearest historical cyclone track
    - Maximum historical wind speed nearby
    - Distance to coast (cyclones weaken inland)
    - Wind speed at location
    """
    drivers: List[RiskDriver] = []
    scores = []

    # 1. Historical cyclone count
    if features.cyclone_count_100km > 15:
        count_score = 90
    elif features.cyclone_count_100km > 10:
        count_score = 70
    elif features.cyclone_count_100km > 5:
        count_score = 50
    elif features.cyclone_count_100km > 2:
        count_score = 30
    elif features.cyclone_count_100km > 0:
        count_score = 15
    else:
        count_score = 2

    scores.append(("count", count_score, 0.30))
    drivers.append(RiskDriver(
        factor="Historical Cyclone Frequency",
        value=f"{features.cyclone_count_100km} cyclones within 100km (historical)",
        impact=_impact_level(count_score / 100 * 0.30),
        description="High historical cyclone activity in this region"
        if count_score > 50 else "Lower historical cyclone activity"
    ))

    # 2. Maximum nearby wind speed
    if features.max_nearby_wind > 180:
        wind_score = 95
    elif features.max_nearby_wind > 140:
        wind_score = 80
    elif features.max_nearby_wind > 100:
        wind_score = 60
    elif features.max_nearby_wind > 70:
        wind_score = 35
    elif features.max_nearby_wind > 40:
        wind_score = 15
    else:
        wind_score = 5

    scores.append(("wind", wind_score, 0.25))
    drivers.append(RiskDriver(
        factor="Maximum Historical Wind Speed",
        value=f"{features.max_nearby_wind:.0f} km/h nearby",
        impact=_impact_level(wind_score / 100 * 0.25),
        description="Extreme wind speeds from historical cyclones pose structural risk"
        if wind_score > 50 else "Historical wind speeds within manageable range"
    ))

    # 3. Nearest cyclone distance
    if features.nearest_cyclone_distance_km < 20:
        dist_score = 90
    elif features.nearest_cyclone_distance_km < 50:
        dist_score = 70
    elif features.nearest_cyclone_distance_km < 100:
        dist_score = 50
    elif features.nearest_cyclone_distance_km < 200:
        dist_score = 25
    else:
        dist_score = 5

    scores.append(("distance", dist_score, 0.25))
    drivers.append(RiskDriver(
        factor="Cyclone Track Proximity",
        value=f"{features.nearest_cyclone_distance_km:.0f}km to nearest historical track",
        impact=_impact_level(dist_score / 100 * 0.25),
        description="Property lies close to historical cyclone tracks"
        if dist_score > 50 else "Distance from cyclone tracks reduces direct exposure"
    ))

    # 4. Mean wind speed (ambient)
    if features.mean_wind_speed > 6:
        amb_wind_score = 60
    elif features.mean_wind_speed > 4:
        amb_wind_score = 40
    elif features.mean_wind_speed > 2:
        amb_wind_score = 20
    else:
        amb_wind_score = 5

    scores.append(("ambient_wind", amb_wind_score, 0.10))
    drivers.append(RiskDriver(
        factor="Ambient Wind Conditions",
        value=f"{features.mean_wind_speed:.1f} m/s average wind",
        impact=_impact_level(amb_wind_score / 100 * 0.10),
        description="Higher ambient wind suggests exposed coastal location"
        if amb_wind_score > 30 else "Sheltered location with moderate winds"
    ))

    # 5. Elevation (storm surge risk)
    if features.elevation_m < 5:
        surge_score = 85
    elif features.elevation_m < 15:
        surge_score = 60
    elif features.elevation_m < 30:
        surge_score = 30
    else:
        surge_score = 5

    scores.append(("surge", surge_score, 0.10))
    drivers.append(RiskDriver(
        factor="Storm Surge Vulnerability",
        value=f"{features.elevation_m:.0f}m elevation",
        impact=_impact_level(surge_score / 100 * 0.10),
        description="Low elevation increases storm surge flooding risk during cyclones"
        if surge_score > 40 else "Higher elevation provides storm surge protection"
    ))

    total_score = sum(s * w for _, s, w in scores)
    total_score = min(100, max(0, total_score))

    drivers.sort(key=lambda d: {"high": 3, "medium": 2, "low": 1}[d.impact], reverse=True)

    return RiskScore(
        hazard="cyclone",
        score=round(total_score, 1),
        category=_categorize_risk(total_score),
        confidence=0.68,
        drivers=drivers
    )


# ──────────────────────────────────────────────────────────────────────
# RISK AGGREGATOR
# ──────────────────────────────────────────────────────────────────────

def aggregate_risk(
    flood: RiskScore, heat: RiskScore, cyclone: RiskScore
) -> Tuple[float, str]:
    """
    Aggregate individual hazard scores into an overall risk score.

    Uses weighted combination with emphasis on the dominant risk.
    Weights: Flood 40%, Heat 30%, Cyclone 30%
    """
    weights = {"flood": 0.40, "heat": 0.30, "cyclone": 0.30}

    overall = (
        flood.score * weights["flood"]
        + heat.score * weights["heat"]
        + cyclone.score * weights["cyclone"]
    )

    # Boost if any single risk is very high (>80)
    max_risk = max(flood.score, heat.score, cyclone.score)
    if max_risk > 80:
        overall = overall * 0.7 + max_risk * 0.3

    overall = min(100, max(0, overall))
    return round(overall, 1), _categorize_risk(overall)
