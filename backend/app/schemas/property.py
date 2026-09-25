"""
Pydantic schemas for property analysis API.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


class PropertyType(str, Enum):
    RESIDENTIAL = "residential"
    APARTMENT = "apartment"
    COMMERCIAL = "commercial"
    INDUSTRIAL = "industrial"


class PropertyInput(BaseModel):
    """Input schema for property analysis."""
    address: Optional[str] = None
    latitude: float = Field(..., ge=6.0, le=37.0, description="Latitude (India range)")
    longitude: float = Field(..., ge=68.0, le=97.5, description="Longitude (India range)")
    property_type: PropertyType = PropertyType.RESIDENTIAL
    area_sqft: float = Field(..., gt=0, description="Property area in square feet")
    market_rate_per_sqft: Optional[float] = Field(
        None, gt=0, description="Market rate per sq.ft in INR"
    )
    building_age: Optional[int] = Field(None, ge=0, description="Building age in years")
    num_floors: Optional[int] = Field(None, ge=1)
    has_basement: Optional[bool] = False
    flood_protection: Optional[bool] = False
    cool_roof: Optional[bool] = False
    storm_resistant: Optional[bool] = False


class ClimateFeatures(BaseModel):
    """Environmental/climate feature vector for a location."""
    elevation_m: float = 0.0
    slope_deg: float = 0.0
    annual_rainfall_mm: float = 0.0
    max_1day_rainfall_mm: float = 0.0
    max_3day_rainfall_mm: float = 0.0
    mean_temperature_c: float = 0.0
    max_temperature_c: float = 0.0
    humidity: float = 0.0
    mean_wind_speed: float = 0.0
    day_lst_c: float = 0.0
    night_lst_c: float = 0.0
    water_occurrence: float = 0.0
    distance_to_water_m: float = 0.0
    built_fraction: float = 0.0
    vegetation_fraction: float = 0.0
    distance_to_river_m: float = 0.0
    cyclone_count_100km: int = 0
    nearest_cyclone_distance_km: float = 0.0
    max_nearby_wind: float = 0.0


class RiskDriver(BaseModel):
    """A single factor contributing to a risk score."""
    factor: str
    value: str
    impact: str  # "high", "medium", "low"
    description: str


class RiskScore(BaseModel):
    """Risk assessment for a single hazard."""
    hazard: str  # "flood", "heat", "cyclone"
    score: float = Field(..., ge=0, le=100)
    category: str  # "LOW", "MODERATE", "HIGH", "VERY HIGH"
    confidence: float = Field(..., ge=0, le=1)
    drivers: List[RiskDriver] = []


class FinancialImpact(BaseModel):
    """Financial impact for a single hazard."""
    hazard: str
    impact_inr: float
    impact_percentage: float
    explanation: str


class ValuationResult(BaseModel):
    """Complete valuation result."""
    base_value_inr: float
    flood_impact: FinancialImpact
    heat_impact: FinancialImpact
    cyclone_impact: FinancialImpact
    total_climate_impact_inr: float
    total_climate_impact_percentage: float
    adjusted_value_inr: float


class ScenarioProjection(BaseModel):
    """Climate risk and valuation under specific IPCC horizons."""
    scenario_id: str
    label: str
    warming_delta_c: float
    horizon_year: int
    overall_risk_score: float
    overall_risk_category: str
    flood_risk_score: float
    heat_risk_score: float
    cyclone_risk_score: float
    projected_haircut_pct: float
    projected_haircut_inr: float
    projected_adjusted_value_inr: float
    key_vulnerability: str


class AdaptationMeasure(BaseModel):
    """Specific engineering resilience adaptation."""
    id: str
    title: str
    hazard: str
    estimated_cost_inr: float
    value_restored_inr: float
    net_roi_percentage: float
    resilience_gain_pct: float
    description: str
    recommended: bool = True


class PropertyAnalysisResponse(BaseModel):
    """Complete property analysis response."""
    property_input: PropertyInput
    climate_features: ClimateFeatures
    risk_scores: List[RiskScore]
    valuation: ValuationResult
    overall_risk_score: float
    overall_risk_category: str
    scenario_projections: List[ScenarioProjection] = []
    adaptation_measures: List[AdaptationMeasure] = []
    analysis_disclaimer: str = (
        "This is a prototype climate risk assessment. "
        "Values are model estimates and should not be treated as "
        "certified property appraisals."
    )


class GeocodeResult(BaseModel):
    """Geocoding result."""
    address: str
    latitude: float
    longitude: float
    display_name: str
    city: Optional[str] = None
    state: Optional[str] = None


class MarketRateSuggestion(BaseModel):
    """Suggested market rate for a city/region."""
    city: str
    state: str
    avg_rate_per_sqft: float
    source: str = "NHB RESIDEX benchmark (approximate)"
