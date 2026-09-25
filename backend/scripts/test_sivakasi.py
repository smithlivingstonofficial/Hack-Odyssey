import httpx

def test_sivakasi():
    query = """[out:json][timeout:15];
    (
      way["building"](around:2000, 9.4226, 77.8368);
      node["building"](around:2000, 9.4226, 77.8368);
      way["landuse"](around:2000, 9.4226, 77.8368);
      node["amenity"](around:2000, 9.4226, 77.8368);
      way["amenity"](around:2000, 9.4226, 77.8368);
      node["shop"](around:2000, 9.4226, 77.8368);
      node["place"](around:2000, 9.4226, 77.8368);
    );
    out tags center 50;
    """
    headers = {"User-Agent": "TerraValueTN/1.0 (Hackathon Educational Research)"}
    r = httpx.post("https://overpass-api.de/api/interpreter", data={"data": query}, headers=headers, timeout=15.0)
    print("Status:", r.status_code)
    if r.status_code == 200:
        elements = r.json().get("elements", [])
        print(f"Retrieved {len(elements)} real elements around 626189 / Sivakasi!")
        for e in elements[:12]:
            tags = e.get("tags", {})
            name = tags.get("name", tags.get("amenity", tags.get("building", tags.get("landuse", "Structure"))))
            center = e.get("center", {}) or {"lat": e.get("lat"), "lon": e.get("lon")}
            print(f"  • {name} ({tags.get('building', tags.get('amenity', tags.get('landuse', 'place')))}) at {center}")

if __name__ == "__main__":
    test_sivakasi()
