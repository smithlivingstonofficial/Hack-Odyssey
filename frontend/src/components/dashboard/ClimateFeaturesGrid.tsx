"use client";

import React, { useState } from "react";
import { ClimateFeatures } from "@/lib/api";
import {
  Mountain,
  Compass,
  CloudRain,
  CloudLightning,
  Sun,
  Moon,
  Droplets,
  Waves,
  Navigation,
  Building,
  Trees,
  Wind,
  Gauge,
  Thermometer,
  Database,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ClimateFeaturesGridProps {
  features: ClimateFeatures;
}

export const ClimateFeaturesGrid: React.FC<ClimateFeaturesGridProps> = ({
  features,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const featureItems = [
    { label: "Elevation (SRTM 90m)", value: `${features.elevation_m} m`, icon: Mountain },
    { label: "Terrain Slope", value: `${features.slope_deg}°`, icon: Compass },
    { label: "Annual Rainfall", value: `${features.annual_rainfall_mm} mm`, icon: CloudRain },
    { label: "Max 1-Day Rain", value: `${features.max_1day_rainfall_mm} mm`, icon: CloudLightning },
    { label: "Day Surface Temp", value: `${features.day_lst_c} °C`, icon: Sun },
    { label: "Night Surface Temp", value: `${features.night_lst_c} °C`, icon: Moon },
    { label: "Water Occurrence", value: `${features.water_occurrence} %`, icon: Droplets },
    {
      label: "Dist. to Waterbody",
      value:
        features.distance_to_water_m > 1000
          ? `${(features.distance_to_water_m / 1000).toFixed(1)} km`
          : `${features.distance_to_water_m.toFixed(0)} m`,
      icon: Waves,
    },
    {
      label: "Nearest Drainage River",
      value:
        features.distance_to_river_m > 1000
          ? `${(features.distance_to_river_m / 1000).toFixed(1)} km`
          : `${features.distance_to_river_m.toFixed(0)} m`,
      icon: Navigation,
    },
    { label: "Built-up Impervious", value: `${(features.built_fraction * 100).toFixed(0)} %`, icon: Building },
    { label: "Canopy / Vegetation", value: `${(features.vegetation_fraction * 100).toFixed(0)} %`, icon: Trees },
    { label: "Cyclones within 100km", value: `${features.cyclone_count_100km}`, icon: Wind },
    { label: "Peak Track Wind", value: `${features.max_nearby_wind} km/h`, icon: Gauge },
    { label: "Relative Humidity", value: `${features.humidity} %`, icon: Thermometer },
  ];

  return (
    <div className="card animate-in" style={{ padding: "16px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
        }}
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="section-title" style={{ margin: 0 }}>
          <Database className="section-icon text-slate-700" />
          <span>Geospatial Feature Vector</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "var(--text-muted)" }}>
          <span>{featureItems.length} features</span>
          {collapsed ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5" />
          )}
        </div>
      </div>

      {!collapsed && (
        <>
          <div
            style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              marginTop: "8px",
              marginBottom: "12px",
              lineHeight: 1.4,
            }}
          >
            Direct sensor and raster values extracted from Open-Meteo, SRTM, and hydrological datasets.
          </div>

          <div className="features-grid">
            {featureItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="feature-item">
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)" }}>
                    <Icon className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span className="feature-name">{item.label}</span>
                  </div>
                  <span className="feature-val">{item.value}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
