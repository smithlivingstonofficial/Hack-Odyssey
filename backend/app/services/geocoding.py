"""
Geocoding service using Nominatim (OpenStreetMap) focused on Tamil Nadu, India.
Free, no API key required.
"""
import httpx
import hashlib
import json
import os
from typing import Optional, List
from app.core.config import settings

# In-memory cache for geocoding results
_geocode_cache: dict = {}

# Approximate market rates per sq.ft for Tamil Nadu cities and districts (INR)
# Source: TN Registration Dept Guideline Values & NHB RESIDEX benchmarks
MARKET_RATES = {
    # Chennai & Suburbs (CMDA region)
    "chennai": 8500,
    "mylapore": 14000,
    "anna nagar": 13500,
    "t nagar": 13000,
    "adyar": 13500,
    "velachery": 8000,
    "omr": 7000,
    "sholinganallur": 6500,
    "porur": 6500,
    "tambaram": 5800,
    "chengalpattu": 4500,
    "kanchipuram": 4200,
    "avadi": 4500,
    "ambattur": 5500,

    # Coimbatore Region (Tier 2 Tech/Industrial Hub)
    "coimbatore": 6500,
    "rs puram": 9500,
    "race course": 11000,
    "gandhipuram": 8000,
    "saravanampatti": 5800,
    "peelamedu": 6800,
    "pollachi": 4000,
    "tiruppur": 5000,

    # Madurai (Cultural & Commercial Capital of South TN)
    "madurai": 4800,
    "kk nagar": 6000,
    "anna nagar madurai": 6200,
    "mattuthavani": 5000,

    # Tiruchirappalli (Trichy - Central TN / Cauvery Basin)
    "tiruchirappalli": 4500,
    "trichy": 4500,
    "thillai nagar": 7000,
    "srirangam": 5500,

    # Western & Industrial Belt
    "salem": 4200,
    "erode": 4500,
    "hosur": 5500,
    "namakkal": 3600,
    "karur": 3800,

    # Northern TN
    "vellore": 4200,
    "tiruvannamalai": 3400,
    "ranipet": 3500,

    # Coastal & Cyclone-Prone Eastern Belt
    "cuddalore": 3600,
    "nagapattinam": 3200,
    "puducherry": 6000,
    "pondicherry": 6000,
    "thanjavur": 4000,
    "karaikal": 3500,
    "tiruvarur": 3000,
    "mayiladuthurai": 3400,

    # Southern TN
    "tirunelveli": 3800,
    "thoothukudi": 3600,
    "tuticorin": 3600,
    "nagercoil": 4500,
    "kanyakumari": 4000,
    "rameswaram": 3500,
    "dindigul": 3500,
    "sivakasi": 3200,

    # Hill Stations
    "ooty": 7500,
    "udhagamandalam": 7500,
    "kodaikanal": 6500,
    "coonoor": 6000,
}

# Default rate for Tamil Nadu towns not in the list
DEFAULT_MARKET_RATE = 4500

# Tamil Nadu bounding box for spatial search bias
# Min lon: 76.2, Min lat: 8.0, Max lon: 80.4, Max lat: 13.6
TN_VIEWBOX = "76.2,13.6,80.4,8.0"


async def geocode_address(address: str) -> Optional[dict]:
    """
    Geocode an address string to lat/lon using Nominatim with Tamil Nadu bias.
    Results are cached to avoid repeated API calls.
    """
    clean_addr = address.strip()
    query = clean_addr
    # Automatically anchor search to Tamil Nadu if not specified
    if "tamil nadu" not in clean_addr.lower() and "chennai" not in clean_addr.lower():
        query = f"{clean_addr}, Tamil Nadu, India"

    cache_key = hashlib.md5(query.lower().encode()).hexdigest()

    if cache_key in _geocode_cache:
        return _geocode_cache[cache_key]

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://nominatim.openstreetmap.org/search",
                params={
                    "q": query,
                    "format": "json",
                    "addressdetails": 1,
                    "limit": 5,
                    "countrycodes": "in",
                    "viewbox": TN_VIEWBOX,
                    "bounded": 0,
                },
                headers={
                    "User-Agent": "TerraValueTamilNadu/1.0 (hackathon-project)"
                },
                timeout=10.0,
            )
            response.raise_for_status()
            results = response.json()

            if not results:
                # Fallback to original address without appended state
                response = await client.get(
                    "https://nominatim.openstreetmap.org/search",
                    params={
                        "q": clean_addr,
                        "format": "json",
                        "addressdetails": 1,
                        "limit": 5,
                        "countrycodes": "in",
                    },
                    headers={
                        "User-Agent": "TerraValueTamilNadu/1.0 (hackathon-project)"
                    },
                    timeout=10.0,
                )
                results = response.json()

            if not results:
                return None

            result = results[0]
            addr_details = result.get("address", {})

            geocode_result = {
                "address": address,
                "latitude": float(result["lat"]),
                "longitude": float(result["lon"]),
                "display_name": result.get("display_name", address),
                "city": (
                    addr_details.get("city")
                    or addr_details.get("town")
                    or addr_details.get("village")
                    or addr_details.get("county")
                ),
                "state": addr_details.get("state", "Tamil Nadu"),
            }

            _geocode_cache[cache_key] = geocode_result
            return geocode_result

    except Exception as e:
        print(f"Geocoding error: {e}")
        return None


async def reverse_geocode(lat: float, lon: float) -> Optional[dict]:
    """Reverse geocode coordinates to address in Tamil Nadu."""
    cache_key = f"{lat:.6f}_{lon:.6f}"

    if cache_key in _geocode_cache:
        return _geocode_cache[cache_key]

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://nominatim.openstreetmap.org/reverse",
                params={
                    "lat": lat,
                    "lon": lon,
                    "format": "json",
                    "addressdetails": 1,
                },
                headers={
                    "User-Agent": "TerraValueTamilNadu/1.0 (hackathon-project)"
                },
                timeout=10.0,
            )
            response.raise_for_status()
            result = response.json()

            addr_details = result.get("address", {})
            geocode_result = {
                "address": result.get("display_name", f"{lat}, {lon}"),
                "latitude": lat,
                "longitude": lon,
                "display_name": result.get("display_name", f"{lat}, {lon}"),
                "city": (
                    addr_details.get("city")
                    or addr_details.get("town")
                    or addr_details.get("village")
                    or addr_details.get("county")
                ),
                "state": addr_details.get("state", "Tamil Nadu"),
            }

            _geocode_cache[cache_key] = geocode_result
            return geocode_result

    except Exception as e:
        print(f"Reverse geocoding error: {e}")
        return {
            "address": f"{lat:.4f}°N, {lon:.4f}°E",
            "latitude": lat,
            "longitude": lon,
            "display_name": f"{lat:.4f}°N, {lon:.4f}°E, Tamil Nadu",
            "city": None,
            "state": "Tamil Nadu",
        }


def get_market_rate(city: Optional[str] = None) -> float:
    """
    Get approximate guideline market rate per sq.ft for Tamil Nadu cities/localities.
    """
    if city:
        city_lower = city.lower().strip()
        for key, rate in MARKET_RATES.items():
            if key in city_lower or city_lower in key:
                return rate
    return DEFAULT_MARKET_RATE
