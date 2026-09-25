"use client";

import React from "react";
import { ChevronRight, Waves, ThermometerSun, Wind, Mountain } from "lucide-react";
import { HazardLayerType } from "@/components/map/MapLayerControl";

interface RiskLayersCardProps {
  activeHazard: HazardLayerType;
  onChangeHazard: (hazard: HazardLayerType) => void;
  floodScore?: number;
  heatScore?: number;
  cycloneScore?: number;
  elevationM?: number;
}

export const RiskLayersCard: React.FC<RiskLayersCardProps> = ({
  activeHazard,
  onChangeHazard,
  floodScore = 75,
  heatScore = 55,
  cycloneScore = 60,
  elevationM = 8,
}) => {
  const getBadge = (score: number) => {
    if (score >= 70) return { label: "High", color: "#dc2626", bg: "#fee2e2" };
    if (score >= 40) return { label: "Medium", color: "#d97706", bg: "#fef3c7" };
    return { label: "Low", color: "#059669", bg: "#dcfce7" };
  };

  const layers = [
    {
      id: "flood" as HazardLayerType,
      title: "Flood Risk",
      badge: getBadge(floodScore),
      icon: Waves,
      gradient: "linear-gradient(135deg, #1e3a8a 0%, #0284c7 60%, #38bdf8 100%)",
      patternColor: "rgba(255, 255, 255, 0.15)",
    },
    {
      id: "thermal" as HazardLayerType,
      title: "Heat Exposure",
      badge: getBadge(heatScore),
      icon: ThermometerSun,
      gradient: "linear-gradient(135deg, #7c2d12 0%, #ea580c 50%, #facc15 100%)",
      patternColor: "rgba(255, 255, 255, 0.15)",
    },
    {
      id: "cyclone" as HazardLayerType,
      title: "Cyclone Track",
      badge: getBadge(cycloneScore),
      icon: Wind,
      gradient: "linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #f59e0b 100%)",
      patternColor: "rgba(255, 255, 255, 0.15)",
    },
    {
      id: "none" as HazardLayerType,
      title: "Elevation Map",
      badge: getBadge(elevationM < 10 ? 70 : 20),
      icon: Mountain,
      gradient: "linear-gradient(135deg, #064e3b 0%, #059669 50%, #84cc16 100%)",
      patternColor: "rgba(255, 255, 255, 0.15)",
    },
  ];

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        padding: "20px 24px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
        fontFamily: "var(--font-sans)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <h3
        style={{
          fontSize: "15px",
          fontWeight: 700,
          color: "#0f172a",
          marginBottom: "14px",
        }}
      >
        Risk Layers
      </h3>

      {/* 4 Interactive Layer Cards (Pure CSS & SVG, Zero External Images) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "12px",
        }}
      >
        {layers.map((layer) => {
          const Icon = layer.icon;
          const isSelected = activeHazard === layer.id;

          return (
            <div
              key={layer.id}
              onClick={() => onChangeHazard(layer.id)}
              style={{
                borderRadius: "12px",
                border: isSelected ? "2px solid #2563eb" : "1px solid #e2e8f0",
                background: "#ffffff",
                overflow: "hidden",
                cursor: "pointer",
                transition: "all 0.18s ease",
                boxShadow: isSelected ? "0 4px 12px rgba(37, 99, 235, 0.15)" : "none",
              }}
            >
              {/* Top Graphic Panel (Pure CSS Geospatial Pattern) */}
              <div
                style={{
                  height: "56px",
                  background: layer.gradient,
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {/* Abstract GIS Topological Contour Rings */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `radial-gradient(${layer.patternColor} 1.5px, transparent 1.5px)`,
                    backgroundSize: "8px 8px",
                  }}
                />
                <Icon style={{ width: 24, height: 24, color: "rgba(255, 255, 255, 0.9)", zIndex: 2 }} />
              </div>

              {/* Bottom Label & Badge */}
              <div
                style={{
                  padding: "8px 10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: isSelected ? "#eff6ff" : "#ffffff",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: isSelected ? "#1d4ed8" : "#1e293b",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {layer.title}
                </span>

                <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      color: layer.badge.color,
                      background: layer.badge.bg,
                      padding: "1px 6px",
                      borderRadius: "10px",
                    }}
                  >
                    {layer.badge.label}
                  </span>
                  <ChevronRight style={{ width: 12, height: 12, color: "#94a3b8" }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
