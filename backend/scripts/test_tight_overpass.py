import httpx

def test():
    endpoints = [
        "https://overpass.kumi.systems/api/interpreter",
        "https://lz4.overpass-api.de/api/interpreter",
        "https://overpass-api.de/api/interpreter",
    ]
    q = """[out:json][timeout:6];
    (
      way["building"](around:400, 13.0827, 80.2707);
    );
    out tags center 15;
    """
    headers = {
        "User-Agent": "TerraValueTamilNadu/1.0 (Hackathon Research; contact@smith.edu)"
    }
    for ep in endpoints:
        try:
            print(f"Testing {ep}...")
            r = httpx.post(ep, data={"data": q}, headers=headers, timeout=6.0)
            print("Status code:", r.status_code)
            if r.status_code == 200:
                data = r.json()
                elements = data.get("elements", [])
                print(f"Successfully retrieved {len(elements)} real properties in Tamil Nadu!")
                for e in elements[:5]:
                    tags = e.get("tags", {})
                    name = tags.get("name", tags.get("building", "Building"))
                    b_type = tags.get("building", "residential")
                    center = e.get("center", {})
                    print(f"  • {name} | Type: {b_type} | Coord: {center.get('lat')}, {center.get('lon')}")
                return
        except Exception as ex:
            print("Failed:", ex)

if __name__ == "__main__":
    test()
