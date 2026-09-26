"use client";

import React, { useState } from "react";
import {
  ThermometerSun,
  Waves,
  Wind,
  CloudRain,
  EyeOff,
  Layers,
  Map as MapIcon,
  Globe,
  Mountain,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export type HazardLayerType = "thermal" | "flood" | "cyclone" | "radar" | "none";
export type BasemapType = "streets" | "satellite" | "topographic";

export interface MapLayerControlProps {
  activeHazard: HazardLayerType;
  onChangeHazard: (hazard: HazardLayerType) => void;
  activeBasemap: BasemapType;
  onChangeBasemap: (basemap: BasemapType) => void;
  isLoadingLayer?: boolean;
}

export const MapLayerControl: React.FC<MapLayerControlProps> = ({
  activeHazard,
  onChangeHazard,
  activeBasemap,
  onChangeBasemap,
  isLoadingLayer = false,
}) => {
  const [showLegend, setShowLegend] = useState<boolean>(true);

  const hazardConfigs: {
    id: HazardLayerType;
    label: string;
    icon: React.ElementType;
    color: string;
    activeBg: string;
    activeBorder: string;
    activeColor: string;
  }[] = [
    {
      id: "thermal",
      label: "Thermal Stress",
      icon: ThermometerSun,
      color: "#d97706",
      activeBg: "#fef3c7",
      activeBorder: "#f59e0b",
      activeColor: "#b45309",
    },
    {
      id: "flood",
      label: "Flood Inundation",
      icon: Waves,
      color: "#0284c7",
      activeBg: "#e0f2fe",
      activeBorder: "#38bdf8",
      activeColor: "#0369a1",
    },
    {
      id: "cyclone",
      label: "Cyclone Surge",
      icon: Wind,
      color: "#7c3aed",
      activeBg: "#f3e8ff",
      activeBorder: "#c084fc",
      activeColor: "#6b21a8",
    },
    {
      id: "radar",
      label: "Live Radar",
      icon: CloudRain,
      color: "#059669",
      activeBg: "#d1fae5",
      activeBorder: "#34d399",
      activeColor: "#047857",
    },
    {
      id: "none",
      label: "Clear Overlay",
      icon: EyeOff,
      color: "#64748b",
      activeBg: "#f1f5f9",
      activeBorder: "#cbd5e1",
      activeColor: "#334155",
    },
  ];

  const basemapConfigs: {
    id: BasemapType;
    label: string;
    icon: React.ElementType;
  }[] = [
    { id: "streets", label: "Street", icon: MapIcon },
    { id: "satellite", label: "Satellite", icon: Globe },
    { id: "topographic", label: "Topo", icon: Mountain },
  ];

  return (
    <>
      {/* Floating Top-Center / Left Controls Bar */}
      <div
        className="map-layer-control-bar"
        style={{
          position: "absolute",
          top: "16px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 8px",
          background: "rgba(255, 255, 255, 0.94)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(226, 232, 240, 0.9)",
          borderRadius: "30px",
          boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.12), 0 4px 6px -2px rgba(15, 23, 42, 0.05)",
          maxWidth: "calc(100vw - 32px)",
          overflowX: "auto",
        }}
      >
        {/* Hazard Layer Selectors */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {hazardConfigs.map((cfg) => {
            const Icon = cfg.icon;
            const isActive = activeHazard === cfg.id;
            return (
              <button
                key={cfg.id}
                type="button"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  border: isActive ? `1.5px solid ${cfg.activeBorder}` : "1px solid transparent",
                  background: isActive ? cfg.activeBg : "transparent",
                  color: isActive ? cfg.activeColor : "#475569",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: "12px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.18s ease",
                }}
                onClick={() => onChangeHazard(cfg.id)}
              >
                <Icon style={{ width: 14, height: 14, color: isActive ? cfg.activeColor : cfg.color }} />
                <span>{cfg.label}</span>
                {isActive && isLoadingLayer && (
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: cfg.activeColor,
                      animation: "pulse-dot 1s infinite",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div style={{ width: "1px", height: "20px", background: "#cbd5e1", margin: "0 2px" }} />

        {/* Basemap Style Selectors */}
        <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
          {basemapConfigs.map((bm) => {
            const Icon = bm.icon;
            const isBmActive = activeBasemap === bm.id;
            return (
              <button
                key={bm.id}
                type="button"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "5px 10px",
                  borderRadius: "16px",
                  border: isBmActive ? "1.5px solid #2563eb" : "1px solid transparent",
                  background: isBmActive ? "#eff6ff" : "transparent",
                  color: isBmActive ? "#1d4ed8" : "#64748b",
                  fontWeight: isBmActive ? 700 : 500,
                  fontSize: "11px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.18s ease",
                }}
                onClick={() => onChangeBasemap(bm.id)}
              >
                <Icon style={{ width: 13, height: 13 }} />
                <span>{bm.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Active Hazard Legend (Bottom-Right) */}
      {activeHazard !== "none" && (
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            right: "20px",
            zIndex: 1000,
            width: "280px",
            background: "rgba(255, 255, 255, 0.94)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(226, 232, 240, 0.9)",
            borderRadius: "14px",
            boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.12)",
            padding: "10px 14px",
            fontFamily: "var(--font-sans, system-ui, sans-serif)",
            transition: "all 0.2s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
            }}
            onClick={() => setShowLegend(!showLegend)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Info style={{ width: 14, height: 14, color: "#2563eb" }} />
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#0f172a" }}>
                {activeHazard === "thermal" && "Thermal & Heat Stress Scale"}
                {activeHazard === "flood" && "Flood & Inundation Depth"}
                {activeHazard === "cyclone" && "Cyclone Surge Corridor"}
                {activeHazard === "radar" && "Live Precipitation Radar"}
              </span>
            </div>
            <div style={{ color: "#94a3b8" }}>
              {showLegend ? <ChevronDown style={{ width: 14, height: 14 }} /> : <ChevronUp style={{ width: 14, height: 14 }} />}
            </div>
          </div>

          {showLegend && (
            <div style={{ marginTop: "8px" }}>
              {/* Continuous Gradient Bar */}
              <div
                style={{
                  height: "8px",
                  borderRadius: "4px",
                  marginBottom: "4px",
                  background:
                    activeHazard === "thermal"
                      ? "linear-gradient(to right, #fef08a, #f59e0b, #ea580c, #dc2626, #991b1b)"
                      : activeHazard === "flood"
                      ? "linear-gradient(to right, #bae6fd, #38bdf8, #0284c7, #1d4ed8, #1e3a8a)"
                      : activeHazard === "cyclone"
                      ? "linear-gradient(to right, #f3e8ff, #c084fc, #9333ea, #6b21a8, #3b0764)"
                      : "linear-gradient(to right, #6ee7b7, #3b82f6, #6366f1, #ec4899, #ef4444)",
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "#64748b",
                }}
              >
                <span>
                  {activeHazard === "thermal" && "28°C (Mild)"}
                  {activeHazard === "flood" && "Low Inundation"}
                  {activeHazard === "cyclone" && "Gale Warning"}
                  {activeHazard === "radar" && "Light Rain"}
                </span>
                <span>
                  {activeHazard === "thermal" && "42°C+ (Extreme)"}
                  {activeHazard === "flood" && "Severe Deluge"}
                  {activeHazard === "cyclone" && "Category 3+ Landfall"}
                  {activeHazard === "radar" && "Severe Storm"}
                </span>
              </div>

              <div
                style={{
                  fontSize: "9px",
                  color: "#94a3b8",
                  marginTop: "6px",
                  paddingTop: "6px",
                  borderTop: "1px solid #f1f5f9",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>Dataset Source:</span>
                <span style={{ fontWeight: 600, color: "#475569" }}>
                  {activeHazard === "thermal" && "Open-Meteo ERA5 / Weather Stations"}
                  {activeHazard === "flood" && "SRTM 90m DEM & TNSDMA Hydrology"}
                  {activeHazard === "cyclone" && "NOAA IBTrACS Landfall Tracks"}
                  {activeHazard === "radar" && "RainViewer Doppler Satellite"}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
