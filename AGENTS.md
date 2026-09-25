# AGENTS.md — Climate Property Intelligence
## Developer & AI Agent Working Memory

This file serves as the primary context document for any human developer or AI coding agent working in this repository.

---

## 1. Project Reference Documents
- **Complete Architecture & Spec**: [`PROJECT_MEMORY.md`](file:///c:/Users/smith/Documents/SMITH/College/MCA/III-Semester/Hack%20Odyssey/site/PROJECT_MEMORY.md)
- **Historical Climate & GIS Data Guide**: [`HISTORICAL_DATA_GUIDE.md`](file:///c:/Users/smith/Documents/SMITH/College/MCA/III-Semester/Hack%20Odyssey/site/HISTORICAL_DATA_GUIDE.md)

---

## 2. Directory Layout & Core Files
```
Hack Odyssey/site/
├── package.json                   # Root scripts (npm run dev, npm run dev:backend, npm run build)
├── PROJECT_MEMORY.md              # Master system architecture & database specifications
├── HISTORICAL_DATA_GUIDE.md       # API endpoints & Python scripts for historical data extraction
├── backend/                       # Python FastAPI Backend
│   ├── app/
│   │   ├── main.py                # FastAPI entry point & CORS configuration
│   │   ├── api/v1/routes.py       # API Endpoints (/analyze, /geocode, /weather/live, /heatmap/*)
│   │   ├── services/
│   │   │   ├── open_meteo_service.py # Live weather, elevation, and historical climate archive
│   │   │   ├── feature_orchestrator.py # Standardized 20-feature environmental vector assembly
│   │   │   ├── geocoding.py       # Nominatim reverse/forward geocoding + NHB rates
│   │   │   ├── heatmap_service.py # Continuous live thermal, flood, and cyclone heatmaps
│   │   │   └── overpass_service.py # OpenStreetMap real cadastre and building extraction
│   │   ├── ml/risk_models.py      # Multi-hazard risk prediction algorithms (Flood, Heat, Cyclone)
│   │   ├── valuation/engine.py    # Transparent financial impact & valuation calculation
│   │   └── schemas/property.py    # Pydantic data schemas
│   └── requirements.txt
└── frontend/                      # Next.js 16 Web Application
    ├── src/
    │   ├── app/                   # App Router (page.tsx, layout.tsx, globals.css)
    │   ├── components/
    │   │   ├── map/MapComponent.tsx # Leaflet interactive map with continuous heatmap & pin
    │   │   ├── weather/LiveWeatherWidget.tsx # Live Metro Open-Meteo real-time card
    │   │   ├── dashboard/Sidebar.tsx # Property valuation and analysis panel
    │   │   └── report/ExecutiveReportModal.tsx # Printable valuation memorandum
    │   └── lib/api.ts             # API Client with resilient direct client-side fallback
    └── package.json
```

---

## 3. Strict Operating Rules
1. **Zero Hardcoded Dummy Datasets**: Never store or reintroduce artificial mock GIS district arrays, fake building arrays, or static station temperatures. All features must be derived from live APIs or real databases.
2. **Deterministic Feature Pipeline**: The ML models receive a standardized 20-feature vector produced deterministically by `feature_orchestrator.py`.
3. **Transparent Financial Explainability**: Every valuation haircut must state its mathematical driver contributions (e.g. low elevation, high rainfall deluge, distance to coastal surge).
