"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import { HazardLayerType } from "@/components/map/MapLayerControl";

interface MapLayersCardProps {
  activeHazard: HazardLayerType;
  onChangeHazard: (hazard: HazardLayerType) => void;
  onViewAll?: () => void;
}

export const MapLayersCard: React.FC<MapLayersCardProps> = ({
  activeHazard,
  onChangeHazard,
  onViewAll,
}) => {
  const layers: {
    id: HazardLayerType;
    title: string;
    level: string;
    levelColor: string;
    levelBg: string;
    renderVisual: () => React.ReactNode;
  }[] = [
    {
      id: "flood",
      title: "Flood Risk",
      level: "High",
      levelColor: "#ef4444",
      levelBg: "#fee2e2",
      renderVisual: () => (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0284c7 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Water Inundation Polygon Texture */}
          <svg width="100%" height="100%" viewBox="0 0 120 70" preserveAspectRatio="none">
            <path
              d="M0,20 Q30,5 60,25 T120,15 L120,70 L0,70 Z"
              fill="#0284c7"
              fillOpacity="0.45"
            />
            <path
              d="M0,35 Q40,15 80,40 T120,30 L120,70 L0,70 Z"
              fill="#38bdf8"
              fillOpacity="0.65"
            />
            <path
              d="M10,70 Q45,20 110,65"
              stroke="#bae6fd"
              strokeWidth="2.5"
              fill="none"
              strokeDasharray="4, 3"
            />
          </svg>
        </div>
      ),
    },
    {
      id: "thermal",
      title: "Heat Exposure",
      level: "Medium",
      levelColor: "#ea580c",
      levelBg: "#ffedd5",
      renderVisual: () => (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #451a03 0%, #9a3412 50%, #ea580c 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Thermal Contours */}
          <svg width="100%" height="100%" viewBox="0 0 120 70" preserveAspectRatio="none">
            <ellipse cx="60" cy="35" rx="50" ry="28" fill="#ea580c" fillOpacity="0.4" />
            <ellipse cx="60" cy="35" rx="35" ry="18" fill="#f97316" fillOpacity="0.6" />
            <ellipse cx="60" cy="35" rx="20" ry="10" fill="#facc15" fillOpacity="0.8" />
            <ellipse cx="60" cy="35" rx="8" ry="4" fill="#ffffff" fillOpacity="0.9" />
          </svg>
        </div>
      ),
    },
    {
      id: "cyclone",
      title: "Cyclone Track",
      level: "Medium",
      levelColor: "#ea580c",
      levelBg: "#ffedd5",
      renderVisual: () => (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #0b1329 0%, #172554 60%, #1e3a8a 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Coastline & Dotted Cyclone Track with Nodes */}
          <svg width="100%" height="100%" viewBox="0 0 120 70" preserveAspectRatio="none">
            {/* Coastline */}
            <path d="M70,0 Q60,35 80,70 L120,70 L120,0 Z" fill="#1e293b" fillOpacity="0.6" />
            {/* Cyclone Trajectory Path */}
            <path
              d="M10,65 Q50,45 110,12"
              stroke="#eab308"
              strokeWidth="2.5"
              fill="none"
              strokeDasharray="4, 4"
            />
            <circle cx="10" cy="65" r="3.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
            <circle cx="45" cy="50" r="3.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
            <circle cx="80" cy="30" r="3.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
            <circle cx="110" cy="12" r="3.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
          </svg>
        </div>
      ),
    },
    {
      id: "none",
      title: "Elevation Map",
      level: "Low",
      levelColor: "#10b981",
      levelBg: "#ecfdf5",
      renderVisual: () => (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #064e3b 0%, #047857 50%, #10b981 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Topographic Contour Lines */}
          <svg width="100%" height="100%" viewBox="0 0 120 70" preserveAspectRatio="none">
            <path d="M0,50 Q40,30 90,60 T120,40" stroke="#34d399" strokeWidth="1.5" fill="none" opacity="0.6" />
            <path d="M0,35 Q50,15 100,45 T120,25" stroke="#6ee7b7" strokeWidth="1.5" fill="none" opacity="0.8" />
            <path d="M15,20 Q60,5 110,30" stroke="#a7f3d0" strokeWidth="1.5" fill="none" opacity="0.9" />
          </svg>
        </div>
      ),
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
      {/* Header */}
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

      {/* 4 Pure CSS Visual Cards matching reference mockup */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "12px",
        }}
      >
        {layers.map((layer) => {
          const isSelected = activeHazard === layer.id;

          return (
            <div
              key={layer.id}
              onClick={() => onChangeHazard(layer.id)}
              style={{
                borderRadius: "10px",
                overflow: "hidden",
                border: isSelected ? "2px solid #2563eb" : "1px solid #e2e8f0",
                cursor: "pointer",
                background: "#ffffff",
                boxShadow: isSelected ? "0 4px 12px rgba(37, 99, 235, 0.18)" : "0 1px 3px rgba(0, 0, 0, 0.04)",
                transition: "all 0.15s ease",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* GIS Texture Header (Height: 64px) */}
              <div style={{ height: "64px", width: "100%", position: "relative" }}>
                {layer.renderVisual()}
              </div>

              {/* Title & Level Badge Pill Footer */}
              <div
                style={{
                  padding: "8px 10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#ffffff",
                }}
              >
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#1e293b" }}>
                  {layer.title}
                </span>

                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: layer.levelColor,
                    background: layer.levelBg,
                    padding: "1px 6px",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                  }}
                >
                  {layer.level} &rsaquo;
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
