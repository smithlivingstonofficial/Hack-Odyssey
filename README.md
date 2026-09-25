# Hack-Odyssey — Climate Property Intelligence

> **AI and GIS-powered climate-adjusted property valuation platform for India.**  
> Quantifies physical environmental risks (flood inundation, extreme heat, cyclone storm surge, sea-level rise) and translates them into transparent, property-level financial haircuts and valuation adjustments.

---

## 🌟 Key Features

- **Interactive Satellite GIS Basemap**: High-resolution Esri World Imagery with reference boundary layers, real-time weather stations, and continuous heatmaps.
- **Physical Climate Risk Modeling**:
  - 🌊 **Flood Inundation**: Basin catchment, river proximity (Cooum & Adyar rivers), elevation drainage vulnerability.
  - 🌡️ **Thermal & Heat Stress**: ERA5 satellite surface temperature anomaly and urban heat island contours.
  - 🌀 **Cyclone Storm Surge**: NOAA IBTrACS historical landfall trajectories and coastal gale vulnerability.
  - ⛰️ **Topographic Elevation**: Digital elevation model (SRTM/Open-Meteo) analysis.
- **Real Property Cadastre & Guideline Rates**:
  - Live OpenStreetMap cadastral building extraction.
  - Tamil Nadu Guideline Rates & NHB RESIDEX base value calculation.
  - Property-specific climate haircuts and adjusted valuation ledger.
- **Institutional Valuation Report**: Printable valuation memorandum with scenario forecasting (2030, 2040, 2050).

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router, Turbopack)
- **UI Library**: React 19, Lucide Vector Icons
- **GIS Mapping**: Leaflet, React-Leaflet, Leaflet.heat
- **Styling**: Pure CSS Design System (Zero raster images, 100% SVG & CSS graphics)

### Backend
- **Framework**: Python 3.11, FastAPI, Uvicorn
- **Environmental Data**: Open-Meteo Climate Archive & Live Forecast API
- **Cadastre & Geocoding**: Nominatim, OpenStreetMap Overpass API
- **Machine Learning & Risk**: Deterministic 20-feature environmental vector orchestrator, Scikit-learn risk classifiers

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --port 8000 --reload
```
The FastAPI backend will start at `http://localhost:8000` (Swagger docs at `http://localhost:8000/docs`).

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` to launch the Climate Property Intelligence dashboard.

---

## 📄 License
MIT License. Developed for Hack Odyssey.
