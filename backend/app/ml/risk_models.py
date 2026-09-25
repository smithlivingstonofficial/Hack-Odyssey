"""
ML Risk Models for flood, heat, and cyclone prediction.

For the hackathon MVP, these use rule-based scoring with weighted features
that simulate trained XGBoost model behavior. The architecture is designed
so that real trained models can be loaded from .json/.joblib files as
drop-in replacements.

Each model returns a score (0-100) and explainability drivers.
"""
import numpy as np
from typing import List, Tuple, Optional
from app.schemas.property import ClimateFeatures, RiskScore, RiskDriver, PropertyInput


def _categorize_risk(score: float) -> str:
    """Convert numeric score to standardized risk category."""
    if score >= 75:
        return "VERY HIGH"
    elif score >= 55:
        return "HIGH"
    elif score >= 35:
        return "MODERATE"
    else:
        return "LOW"


def _impact_level(contribution: float) -> str:
    """Determine impact level of a risk driver."""
    if contribution >= 0.25:
        return "high"
    elif contribution >= 0.12:
        return "medium"
    else:
        return "low"


# ──────────────────────────────────────────────────────────────────────
# FLOOD RISK MODEL
# ──────────────────────────────────────────────────────────────────────

def predict_flood_risk(
    features: ClimateFeatures,
    lat: float,
    lon: float,
    property_input: Optional[PropertyInput] = None
) -> RiskScore:
    """
    Predict flood risk score based on environmental features and property vulnerability.
    Uses continuous mathematical curves calibrated for Tamil Nadu hydrology (zero step-cliffs).
    """
    drivers: List[RiskDriver] = []
    scores = []

    # 1. Elevation factor (Continuous sigmoid response)
    # Low-lying (<10m) coastal basins experience heavy runoff pooling
    elev_score = float(np.clip(96.0 / (1.0 + (features.elevation_m / 16.0) ** 1.8), 3.0, 98.0))
    scores.append(("elevation", elev_score, 0.22))
    drivers.append(RiskDriver(
        factor="Elevation MSL",
        value=f"{features.elevation_m:.1f}m above sea level",
        impact=_impact_level(elev_score / 100 * 0.22),
        description="Low-elevation basin (<15m) accelerates stormwater ponding and tidal backup"
        if features.elevation_m < 15.0 else "Elevated terrain provides effective natural gravitational drainage"
    ))

    # 2. Rainfall intensity (Continuous non-linear power curve for 24h deluge)
    rain_score = float(np.clip(8.0 + (features.max_1day_rainfall_mm / 210.0) ** 1.4 * 88.0, 5.0, 98.0))
    scores.append(("rainfall", rain_score, 0.25))
    drivers.append(RiskDriver(
        factor="Rainfall Intensity",
        value=f"{features.max_1day_rainfall_mm:.0f}mm max 24h deluge",
        impact=_impact_level(rain_score / 100 * 0.25),
        description="Intense monsoonal single-day cloudbursts overwhelm municipal storm channels"
        if features.max_1day_rainfall_mm > 120 else "Moderate rainfall within manageable drainage capacity"
    ))

    # 3. Water proximity (Continuous exponential decay from nearest river/channel/coast)
    dist_water_km = features.distance_to_water_m / 1000.0
    water_score = float(np.clip(95.0 * np.exp(-dist_water_km / 3.8), 4.0, 98.0))
    scores.append(("water_proximity", water_score, 0.20))
    drivers.append(RiskDriver(
        factor="Waterway Proximity",
        value=f"{dist_water_km:.1f}km to nearest drainage/water body",
        impact=_impact_level(water_score / 100 * 0.20),
        description="Close proximity to natural drainage line increases fluvial flood exposure"
        if dist_water_km < 2.5 else "Buffer distance from waterways insulates from riverine overtopping"
    ))

    # 4. Historical water occurrence
    wocc_score = float(np.clip(features.water_occurrence * 1.35, 5.0, 98.0))
    scores.append(("water_occurrence", wocc_score, 0.18))
    drivers.append(RiskDriver(
        factor="Historical Water Presence",
        value=f"{features.water_occurrence:.0f}% historical inundation frequency",
        impact=_impact_level(wocc_score / 100 * 0.18),
        description="Multi-year satellite record confirms recurrent surface water accumulation"
        if features.water_occurrence > 25 else "Minimal historical surface water persistence"
    ))

    # 5. Terrain slope & runoff gradient
    if features.elevation_m > 35.0:
        slope_score = float(np.clip((1.0 / (1.0 + features.slope_deg * 0.6)) * 25.0, 3.0, 35.0))
    else:
        slope_score = float(np.clip((1.0 / (1.0 + features.slope_deg * 0.45)) * 85.0, 8.0, 90.0))

    scores.append(("slope", slope_score, 0.15))
    drivers.append(RiskDriver(
        factor="Terrain Slope",
        value=f"{features.slope_deg:.1f}° gradient",
        impact=_impact_level(slope_score / 100 * 0.15),
        description="Flat terrain (<1.5°) impedes stormwater runoff, promoting localized pooling"
        if features.slope_deg < 2.0 else "Sufficient gradient accelerates natural runoff clearance"
    ))

    # Weighted environmental hazard score
    base_score = sum(s * w for _, s, w in scores)

    # Property vulnerability & mitigation adjustments
    adjusted_score = base_score
    if property_input:
        if property_input.flood_protection:
            adjusted_score *= 0.76  # -24% risk from barriers, sump pumps, elevated plinth
            drivers.append(RiskDriver(
                factor="Flood Defenses",
                value="Installed plinth / barrier mitigation",
                impact="medium",
                description="Active flood barriers and elevated threshold reduce structure water ingress"
            ))
        if property_input.has_basement:
            adjusted_score = min(100.0, adjusted_score * 1.16)  # +16% risk from below-ground level
            drivers.append(RiskDriver(
                factor="Subterranean Basement",
                value="Below-ground floor present",
                impact="high",
                description="Basements substantially increase structural vulnerability to hydrostatic infiltration"
            ))
        if property_input.building_age and property_input.building_age > 25:
            adjusted_score = min(100.0, adjusted_score * 1.06)

    total_score = float(np.clip(adjusted_score, 1.0, 99.0))
    drivers.sort(key=lambda d: {"high": 3, "medium": 2, "low": 1}[d.impact], reverse=True)

    return RiskScore(
        hazard="flood",
        score=round(total_score, 1),
        category=_categorize_risk(total_score),
        confidence=0.84,
        drivers=drivers[:5]
    )


# ──────────────────────────────────────────────────────────────────────
# HEAT RISK MODEL
# ──────────────────────────────────────────────────────────────────────

def predict_heat_risk(
    features: ClimateFeatures,
    lat: float,
    lon: float,
    property_input: Optional[PropertyInput] = None
) -> RiskScore:
    """
    Predict extreme heat stress based on ERA5 temperature normals,
    MODIS Land Surface Temperature (LST), and Urban Heat Island (UHI) density.
    """
    drivers: List[RiskDriver] = []
    scores = []

    # 1. Maximum temperature (Logistic sigmoid centered at 37.5°C wet-bulb stress threshold)
    temp_score = float(np.clip(100.0 / (1.0 + np.exp(-0.35 * (features.max_temperature_c - 37.5))), 5.0, 98.0))
    scores.append(("temperature", temp_score, 0.28))
    drivers.append(RiskDriver(
        factor="Maximum Temperature",
        value=f"{features.max_temperature_c:.1f}°C climatological peak",
        impact=_impact_level(temp_score / 100 * 0.28),
        description="Peak ambient temperature exceeds physiological human comfort & HVAC operational efficiency"
        if features.max_temperature_c > 38.0 else "Temperatures remain within standard acclimatized range"
    ))

    # 2. Land Surface Temperature (daytime LST)
    lst_score = float(np.clip((features.day_lst_c - 20.0) * 3.4, 8.0, 96.0))
    scores.append(("lst", lst_score, 0.24))
    drivers.append(RiskDriver(
        factor="Daytime Surface Temp (LST)",
        value=f"{features.day_lst_c:.1f}°C ground surface temperature",
        impact=_impact_level(lst_score / 100 * 0.24),
        description="Elevated ground emissivity creates localized microclimate thermal trapping"
        if features.day_lst_c > 34.0 else "Moderate surface temperatures due to natural surface cooling"
    ))

    # 3. Built-up fraction (Urban Heat Island effect)
    uhi_score = float(np.clip(features.built_fraction * 105.0, 5.0, 95.0))
    scores.append(("uhi", uhi_score, 0.20))
    drivers.append(RiskDriver(
        factor="Urban Heat Island (UHI)",
        value=f"{features.built_fraction * 100:.0f}% impervious built density",
        impact=_impact_level(uhi_score / 100 * 0.20),
        description="High thermal mass of asphalt and masonry intensifies heat retention"
        if features.built_fraction > 0.50 else "Suburban/rural density allows natural nocturnal ventilation"
    ))

    # 4. Vegetation cooling buffer
    veg_score = float(np.clip((1.0 - features.vegetation_fraction) * 88.0, 6.0, 92.0))
    scores.append(("vegetation", veg_score, 0.15))
    drivers.append(RiskDriver(
        factor="Vegetation Canopy",
        value=f"{features.vegetation_fraction * 100:.0f}% green cover",
        impact=_impact_level(veg_score / 100 * 0.15),
        description="Deficient tree canopy limits natural evapotranspiration cooling"
        if features.vegetation_fraction < 0.20 else "Healthy canopy provides natural microclimatic shading"
    ))

    # 5. Nighttime LST retention (preventing cooling)
    night_score = float(np.clip((features.night_lst_c - 18.0) * 5.8, 6.0, 95.0))
    scores.append(("night_temp", night_score, 0.13))
    drivers.append(RiskDriver(
        factor="Nocturnal Thermal Retention",
        value=f"{features.night_lst_c:.1f}°C night surface temperature",
        impact=_impact_level(night_score / 100 * 0.13),
        description="Elevated nighttime temperatures prevent building envelope cool-down"
        if features.night_lst_c > 26.0 else "Adequate diurnal cooling cycle allows heat dissipation"
    ))

    base_score = sum(s * w for _, s, w in scores)

    # Property vulnerability adjustments
    adjusted_score = base_score
    if property_input:
        if property_input.cool_roof:
            adjusted_score *= 0.80  # -20% thermal stress from high-albedo solar roof
            drivers.append(RiskDriver(
                factor="Cool Roof Coating",
                value="High-SRI reflective coating applied",
                impact="medium",
                description="High solar reflectance index lowers indoor cooling loads and surface thermal absorption"
            ))
        if property_input.property_type == "industrial":
            adjusted_score = min(100.0, adjusted_score * 1.08)
        if property_input.building_age and property_input.building_age > 25:
            adjusted_score = min(100.0, adjusted_score * 1.05)

    total_score = float(np.clip(adjusted_score, 1.0, 99.0))
    drivers.sort(key=lambda d: {"high": 3, "medium": 2, "low": 1}[d.impact], reverse=True)

    return RiskScore(
        hazard="heat",
        score=round(total_score, 1),
        category=_categorize_risk(total_score),
        confidence=0.86,
        drivers=drivers[:5]
    )


# ──────────────────────────────────────────────────────────────────────
# CYCLONE & SEVERE WIND MODEL
# ──────────────────────────────────────────────────────────────────────

def predict_cyclone_risk(
    features: ClimateFeatures,
    lat: float,
    lon: float,
    property_input: Optional[PropertyInput] = None
) -> RiskScore:
    """
    Predict cyclonic wind hazard and storm surge exposure based on
    Bay of Bengal historical tracks and aerodynamic pressure physics (q ~ v^2).
    """
    drivers: List[RiskDriver] = []
    scores = []

    # 1. Historical cyclone frequency
    count_score = float(np.clip((1.0 - np.exp(-features.cyclone_count_100km / 6.5)) * 96.0, 4.0, 96.0))
    scores.append(("count", count_score, 0.28))
    drivers.append(RiskDriver(
        factor="Historical Cyclone Track Frequency",
        value=f"{features.cyclone_count_100km} tracks recorded within 100km",
        impact=_impact_level(count_score / 100 * 0.28),
        description="Location falls directly inside active Bay of Bengal post-monsoon cyclonic strike corridor"
        if features.cyclone_count_100km > 6 else "Moderate historical cyclone track exposure"
    ))

    # 2. Maximum historical wind velocity (Kinetic wind pressure q = 0.5 * rho * v^2)
    wind_score = float(np.clip((features.max_nearby_wind / 155.0) ** 1.8 * 95.0, 5.0, 98.0))
    scores.append(("wind", wind_score, 0.28))
    drivers.append(RiskDriver(
        factor="Peak Historical Gust",
        value=f"{features.max_nearby_wind:.0f} km/h maximum gust",
        impact=_impact_level(wind_score / 100 * 0.28),
        description="Extreme cyclonic wind velocity creates substantial aerodynamic uplift on roof framing"
        if features.max_nearby_wind > 80.0 else "Wind speeds within standard IS-875 Part 3 design envelope"
    ))

    # 3. Cyclone track proximity (Radial decay)
    dist_score = float(np.clip(95.0 * np.exp(-features.nearest_cyclone_distance_km / 60.0), 4.0, 96.0))
    scores.append(("distance", dist_score, 0.24))
    drivers.append(RiskDriver(
        factor="Track Corridor Distance",
        value=f"{features.nearest_cyclone_distance_km:.0f}km to historical eye landfall",
        impact=_impact_level(dist_score / 100 * 0.24),
        description="Proximity to primary coastal landfall zones increases gale and eyewall exposure"
        if features.nearest_cyclone_distance_km < 50.0 else "Inland position provides progressive frictional weakening"
    ))

    # 4. Coastal proximity & ocean air mass exposure
    coast_dist_km = features.distance_to_water_m / 1000.0
    surge_score = float(np.clip(
        95.0 * np.exp(-features.elevation_m / 10.0) * np.exp(-coast_dist_km / 22.0),
        3.0, 95.0
    ))
    scores.append(("surge", surge_score, 0.20))
    drivers.append(RiskDriver(
        factor="Coastal Surge Vulnerability",
        value=f"{features.elevation_m:.0f}m elev, {coast_dist_km:.1f}km to coast",
        impact=_impact_level(surge_score / 100 * 0.20),
        description="Low coastal elevation exposes asset to maritime storm surge penetration"
        if surge_score > 40.0 else "Inland distance or topography provides barrier against tidal surge"
    ))

    base_score = sum(s * w for _, s, w in scores)

    # Property vulnerability adjustments
    adjusted_score = base_score
    if property_input:
        if property_input.storm_resistant:
            adjusted_score *= 0.76  # -24% from storm resistant glazing & ties
            drivers.append(RiskDriver(
                factor="Storm Resilient Construction",
                value="Impact glass / structural anchor ties",
                impact="high",
                description="Engineered storm ties and impact glazing minimize aerodynamic roof failure risk"
            ))
        if property_input.num_floors and property_input.num_floors > 4:
            adjusted_score = min(100.0, adjusted_score * 1.08)
        if property_input.building_age and property_input.building_age > 30:
            adjusted_score = min(100.0, adjusted_score * 1.08)

    total_score = float(np.clip(adjusted_score, 1.0, 99.0))
    drivers.sort(key=lambda d: {"high": 3, "medium": 2, "low": 1}[d.impact], reverse=True)

    return RiskScore(
        hazard="cyclone",
        score=round(total_score, 1),
        category=_categorize_risk(total_score),
        confidence=0.82,
        drivers=drivers[:5]
    )


# ──────────────────────────────────────────────────────────────────────
# TOPOGRAPHIC INUNDATION & SURGE MODEL (Replaces crude elevation risk)
# ──────────────────────────────────────────────────────────────────────

def predict_inundation_risk(
    features: ClimateFeatures,
    lat: float,
    lon: float,
    property_input: Optional[PropertyInput] = None
) -> RiskScore:
    """
    Predict topographic inundation & sea level surge risk combining SRTM 90m
    elevation, coastal proximity, terrain gradient, and extreme tidal projections.
    """
    drivers: List[RiskDriver] = []

    # 1. Elevation vulnerability (Continuous exponential decline)
    elev_score = float(np.clip(100.0 / (1.0 + (features.elevation_m / 14.0) ** 2.0), 4.0, 98.0))
    drivers.append(RiskDriver(
        factor="SRTM Topographic Elevation",
        value=f"{features.elevation_m:.1f}m MSL",
        impact=_impact_level(elev_score / 100 * 0.40),
        description="Elevation below 12m MSL falls within the 100-year coastal flood & storm surge plain"
        if features.elevation_m < 12.0 else "High ground above tidal ingress limit protects property from sea-level surges"
    ))

    # 2. Coastal & tidal waterway proximity
    dist_km = features.distance_to_water_m / 1000.0
    coast_score = float(np.clip(96.0 * np.exp(-dist_km / 6.0), 3.0, 98.0))
    drivers.append(RiskDriver(
        factor="Distance to Coastal Inundation Line",
        value=f"{dist_km:.1f}km to coastline/estuary",
        impact=_impact_level(coast_score / 100 * 0.35),
        description="Close maritime proximity subjects structure to high-tide and cyclonic water push"
        if dist_km < 5.0 else "Distance from coast insulates against extreme sea surge penetration"
    ))

    # 3. Slope gradient (drainage velocity)
    slope_score = float(np.clip(85.0 / (1.0 + features.slope_deg * 0.7), 5.0, 90.0))
    drivers.append(RiskDriver(
        factor="Terrain Relief & Drainage Slope",
        value=f"{features.slope_deg:.1f}° slope gradient",
        impact=_impact_level(slope_score / 100 * 0.25),
        description="Depressed, flat basin retains water with low gravity-assisted runoff speed"
        if features.slope_deg < 2.0 else "Terrain gradient facilitates rapid gravitational water dispersion"
    ))

    base_score = elev_score * 0.45 + coast_score * 0.35 + slope_score * 0.20

    adjusted_score = base_score
    if property_input:
        if property_input.flood_protection:
            adjusted_score *= 0.78
        if property_input.has_basement:
            adjusted_score = min(100.0, adjusted_score * 1.15)

    total_score = float(np.clip(adjusted_score, 1.0, 99.0))
    drivers.sort(key=lambda d: {"high": 3, "medium": 2, "low": 1}[d.impact], reverse=True)

    return RiskScore(
        hazard="inundation",
        score=round(total_score, 1),
        category=_categorize_risk(total_score),
        confidence=0.85,
        drivers=drivers[:5]
    )


# ──────────────────────────────────────────────────────────────────────
# RISK AGGREGATOR
# ──────────────────────────────────────────────────────────────────────

def aggregate_risk(
    flood: RiskScore,
    heat: RiskScore,
    cyclone: RiskScore,
    inundation: Optional[RiskScore] = None
) -> Tuple[float, str]:
    """
    Aggregate hazard scores into an overall composite risk score (0-100).
    Accounts for multi-hazard compounding with dominant hazard emphasis.
    """
    if inundation is not None:
        weights = {"flood": 0.34, "inundation": 0.22, "heat": 0.24, "cyclone": 0.20}
        overall = (
            flood.score * weights["flood"]
            + inundation.score * weights["inundation"]
            + heat.score * weights["heat"]
            + cyclone.score * weights["cyclone"]
        )
        max_risk = max(flood.score, inundation.score, heat.score, cyclone.score)
    else:
        weights = {"flood": 0.40, "heat": 0.30, "cyclone": 0.30}
        overall = (
            flood.score * weights["flood"]
            + heat.score * weights["heat"]
            + cyclone.score * weights["cyclone"]
        )
        max_risk = max(flood.score, heat.score, cyclone.score)

    # Compounding risk amplification if any single hazard is acute (>72)
    if max_risk > 72.0:
        overall = overall * 0.75 + max_risk * 0.25

    overall = float(np.clip(overall, 1.0, 99.0))
    return round(overall, 1), _categorize_risk(overall)

