"""
Property analysis API routes — the core endpoint that orchestrates
the entire climate risk assessment pipeline.
"""
from fastapi import APIRouter, HTTPException
from app.schemas.property import (
    PropertyInput,
    PropertyAnalysisResponse,
    GeocodeResult,
    MarketRateSuggestion,
)
from app.services.feature_orchestrator import get_climate_features
from app.services.geocoding import (
    geocode_address,
    reverse_geocode,
    get_market_rate,
)
from app.ml.risk_models import (
    predict_flood_risk,
    predict_heat_risk,
    predict_cyclone_risk,
    aggregate_risk,
)
from app.valuation.engine import calculate_valuation
from app.services.overpass_service import get_nearby_real_properties
from app.services.open_meteo_service import (
    get_real_elevation,
    get_real_historical_climate,
    get_live_weather,
)
from app.services.heatmap_service import (
    get_live_radar_tile_url,
    get_thermal_heatmap_data,
    get_flood_heatmap_data,
    get_cyclone_heatmap_data,
)
from typing import Optional, List, Dict, Any

router = APIRouter(prefix="/api/v1", tags=["analysis"])


@router.post("/analyze", response_model=PropertyAnalysisResponse)
async def analyze_property(property_input: PropertyInput):
    """
    Full property climate risk analysis pipeline.

    Flow:
    1. Reverse geocode to get city/state
    2. Collect climate features for location
    3. Run flood, heat, cyclone risk models
    4. Calculate financial impact and adjusted valuation
    5. Return complete analysis with explainability
    """
    lat = property_input.latitude
    lon = property_input.longitude

    # Step 1: Get location context
    location = await reverse_geocode(lat, lon)
    city = location.get("city") if location else None

    # Step 2: Get market rate (user-provided or benchmark)
    market_rate = property_input.market_rate_per_sqft or get_market_rate(city)

    # Step 3: Collect environmental features
    try:
        climate_features = await get_climate_features(lat, lon)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to collect climate features: {str(e)}"
        )

    # Step 4: Run risk prediction models
    flood_risk = predict_flood_risk(climate_features, lat, lon)
    heat_risk = predict_heat_risk(climate_features, lat, lon)
    cyclone_risk = predict_cyclone_risk(climate_features, lat, lon)

    risk_scores = [flood_risk, heat_risk, cyclone_risk]
    overall_score, overall_category = aggregate_risk(flood_risk, heat_risk, cyclone_risk)

    # Step 5: Calculate financial impact and valuation
    valuation = calculate_valuation(
        property_input,
        climate_features,
        risk_scores,
        market_rate,
    )

    return PropertyAnalysisResponse(
        property_input=property_input,
        climate_features=climate_features,
        risk_scores=risk_scores,
        valuation=valuation,
        overall_risk_score=overall_score,
        overall_risk_category=overall_category,
    )


@router.get("/geocode", response_model=Optional[GeocodeResult])
async def geocode(address: str):
    """Geocode an address to coordinates."""
    if not address or len(address.strip()) < 3:
        raise HTTPException(status_code=400, detail="Address too short")

    result = await geocode_address(address)
    if not result:
        raise HTTPException(status_code=404, detail="Address not found")

    return GeocodeResult(**result)


@router.get("/reverse-geocode")
async def reverse_geocode_endpoint(lat: float, lon: float):
    """Reverse geocode coordinates to address."""
    if not (6.0 <= lat <= 37.0 and 68.0 <= lon <= 97.5):
        raise HTTPException(
            status_code=400,
            detail="Coordinates outside India bounds"
        )
    result = await reverse_geocode(lat, lon)
    return result


@router.get("/market-rate", response_model=MarketRateSuggestion)
async def get_market_rate_endpoint(city: str):
    """Get approximate market rate for a city."""
    rate = get_market_rate(city)
    return MarketRateSuggestion(
        city=city,
        state="",
        avg_rate_per_sqft=rate,
    )


@router.get("/properties/nearby")
async def get_nearby_properties_endpoint(
    lat: float, lon: float, radius_m: int = 700
) -> List[Dict[str, Any]]:
    """
    Fetch real-world buildings, apartments, flats, commercial structures,
    and land parcels within radius from OpenStreetMap Overpass API.
    """
    return await get_nearby_real_properties(lat, lon, radius_m)


@router.get("/climate/real")
async def get_real_climate_endpoint(lat: float, lon: float):
    """
    Fetch live Open-Meteo elevation and historical climate extremes.
    """
    elev = await get_real_elevation(lat, lon)
    clim = await get_real_historical_climate(lat, lon)
    return {
        "elevation_m": elev,
        "climate_extremes": clim,
    }


@router.get("/heatmap/thermal")
async def get_thermal_heatmap_endpoint(lat: float, lon: float):
    """
    Returns [lat, lon, intensity] heatmap points for real surface temperature & heat stress.
    """
    return await get_thermal_heatmap_data(lat, lon)


@router.get("/heatmap/flood")
async def get_flood_heatmap_endpoint(lat: float, lon: float):
    """
    Returns [lat, lon, intensity] heatmap points for river basins and low-elevation flood inundation.
    """
    return await get_flood_heatmap_data(lat, lon)


@router.get("/heatmap/cyclone")
async def get_cyclone_heatmap_endpoint(lat: float, lon: float):
    """
    Returns [lat, lon, intensity] heatmap points for historical IBTrACS cyclone corridors and coastal surge.
    """
    return await get_cyclone_heatmap_data(lat, lon)


@router.get("/weather/live")
async def get_live_weather_endpoint(lat: float, lon: float):
    """
    Returns live weather conditions, apparent temperature, humidity, wind, and forecast
    from free Open-Meteo weather API.
    """
    weather = await get_live_weather(lat, lon)
    if not weather:
        raise HTTPException(status_code=502, detail="Failed to fetch live weather data")
    return weather


@router.get("/weather/radar")
async def get_weather_radar_endpoint():
    """
    Returns live Doppler radar tile URL and timestamp from RainViewer API.
    """
    return await get_live_radar_tile_url()


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "Climate Property Intelligence API",
        "version": "1.0.0-mvp",
    }
