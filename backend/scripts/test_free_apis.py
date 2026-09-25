import httpx
import json

def test_apis():
    print("--- 1. Testing Open-Meteo Elevation API (Free, No Key) ---")
    try:
        r = httpx.get("https://api.open-meteo.com/v1/elevation?latitude=13.0827&longitude=80.2707", timeout=10.0)
        print("Elevation Status:", r.status_code, "Data:", r.json())
    except Exception as e:
        print("Elevation Error:", e)

    print("\n--- 2. Testing Open-Meteo Historical Climate / Rainfall API (Free, No Key) ---")
    try:
        url = "https://archive-api.open-meteo.com/v1/archive?latitude=13.0827&longitude=80.2707&start_date=2023-11-25&end_date=2023-12-10&daily=precipitation_sum,temperature_2m_max,windspeed_10m_max&timezone=Asia%2FKolkata"
        r = httpx.get(url, timeout=10.0)
        data = r.json().get("daily", {})
        max_rain = max(data.get("precipitation_sum", [0]))
        max_wind = max(data.get("windspeed_10m_max", [0]))
        print("Climate Status:", r.status_code, f"Peak 24h Rain: {max_rain} mm (Cyclone Michaung), Peak Wind: {max_wind} km/h")
    except Exception as e:
        print("Climate Error:", e)

    print("\n--- 3. Testing Overpass API for Real Buildings, Flats & Lands in TN (Free, No Key) ---")
    try:
        # Query real buildings, apartments, and landuse in Mylapore, Chennai (radius 300m)
        query = """
        [out:json][timeout:15];
        (
          way["building"](around:300, 13.0368, 80.2676);
          way["landuse"](around:300, 13.0368, 80.2676);
        );
        out tags center 20;
        """
        r = httpx.post("https://overpass-api.de/api/interpreter", data=query, timeout=15.0)
        elements = r.json().get("elements", [])
        print("Overpass Status:", r.status_code, f"Fetched {len(elements)} real building & land parcels!")
        for elem in elements[:5]:
            tags = elem.get("tags", {})
            b_type = tags.get("building", tags.get("landuse", "structure"))
            name = tags.get("name", "Unnamed Parcel")
            center = elem.get("center", {})
            print(f"  • [{b_type.upper()}] {name} at ({center.get('lat')}, {center.get('lon')})")
    except Exception as e:
        print("Overpass Error:", e)

if __name__ == "__main__":
    test_apis()
