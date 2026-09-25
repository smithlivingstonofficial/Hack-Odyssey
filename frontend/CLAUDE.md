# Climate Property Intelligence — Agent & Developer Reference

This repository implements the **Climate Property Intelligence** platform for India, an AI- and GIS-powered climate-adjusted property valuation system.

---

## Master Architecture & Memory Documents
- Master Project Specification: [`../PROJECT_MEMORY.md`](file:///c:/Users/smith/Documents/SMITH/College/MCA/III-Semester/Hack%20Odyssey/site/PROJECT_MEMORY.md)
- Historical Data Acquisition Guide: [`../HISTORICAL_DATA_GUIDE.md`](file:///c:/Users/smith/Documents/SMITH/College/MCA/III-Semester/Hack%20Odyssey/site/HISTORICAL_DATA_GUIDE.md)

---

## Key Tech Stack & Commands

### 1. Running the System
```bash
# From workspace root (c:/.../Hack Odyssey/site):
npm run dev           # Starts Next.js frontend on http://localhost:3000
npm run dev:backend   # Starts FastAPI backend on http://127.0.0.1:8000
npm run build         # Validates production Next.js build
```

### 2. Architecture Guidelines
1. **Deterministic Data Only**: No fake or randomized data. All climate and hazard features are sourced live and deterministically from Open-Meteo, NOAA IBTrACS, SRTM 90m, and OpenStreetMap.
2. **Transparent Valuation**: Base value = built-up area × market rate; climate impact is a non-linear function of physical exposure capped at explainable percentages.
3. **Resilient APIs**: The frontend (`src/lib/api.ts`) automatically falls back to direct client-side Open-Meteo API querying if the backend server is temporarily unavailable.
