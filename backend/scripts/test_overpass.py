import httpx

def test_overpass():
    query = """[out:json][timeout:20];
    (
      way["building"](around:600,13.0368,80.2676);
      node["building"](around:600,13.0368,80.2676);
      way["landuse"](around:600,13.0368,80.2676);
    );
    out tags center 20;
    """
    endpoints = [
        "https://overpass-api.de/api/interpreter",
        "https://overpass.kumi.systems/api/interpreter",
        "https://maps.mail.ru/osm/tools/overpass/api/interpreter"
    ]
    for url in endpoints:
        try:
            print(f"Testing Overpass endpoint: {url}")
            r = httpx.post(url, data={"data": query}, timeout=15.0)
            if r.status_code == 200:
                data = r.json()
                elements = data.get("elements", [])
                print(f"Success! Retrieved {len(elements)} real properties/buildings in Mylapore, Chennai!")
                for e in elements[:6]:
                    tags = e.get("tags", {})
                    name = tags.get("name", tags.get("building", tags.get("landuse", "building")))
                    b_type = tags.get("building", tags.get("landuse", "structure"))
                    center = e.get("center", {}) or {"lat": e.get("lat"), "lon": e.get("lon")}
                    print(f"  • [{b_type.upper()}] {name} at ({center.get('lat')}, {center.get('lon')})")
                return
        except Exception as ex:
            print(f"Failed with {url}: {ex}")

if __name__ == "__main__":
    test_overpass()
