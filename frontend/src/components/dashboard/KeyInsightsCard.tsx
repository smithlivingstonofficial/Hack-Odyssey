"use client";

import React from "react";
import { Droplet, Thermometer, Wind, Mountain } from "lucide-react";
import { ClimateFeatures } from "@/lib/api";

interface KeyInsightsCardProps {
  features?: ClimateFeatures | null;
  floodScore?: number;
  heatScore?: number;
  cycloneScore?: number;
}

export const KeyInsightsCard: React.FC<KeyInsightsCardProps> = ({
  features,
  floodScore = 72,
  heatScore = 58,
  cycloneScore = 61,
}) => {
  // Generate insights deterministically from features
  const distWaterKm = features ? (features.distance_to_water_m / 1000).toFixed(1) : "1.8";
  const elevation = features ? Math.round(features.elevation_m) : 8;

  const insights = [
    {
      id: "flood",
      icon: Droplet,
      iconColor: "#2563eb",
      iconBg: "#dbeafe",
      text: `Property is within ${distWaterKm} km of a coastal surge or flood-prone drainage basin.`,
    },
    {
      id: "heat",
      icon: Thermometer,
      iconColor: "#ea580c",
      iconBg: "#ffedd5",
      text: heatScore > 50
        ? "Located in a high urban surface temperature microclimate region."
        : "Moderate thermal exposure with normal diurnal cooling.",
    },
    {
      id: "cyclone",
      icon: Wind,
      iconColor: "#7c3aed",
      iconBg: "#f3e8ff",
      text: cycloneScore > 50
        ? "Falls within the historical Bay of Bengal cyclone landfall corridor."
        : "Sheltered inland region with reduced tropical storm risk.",
    },
    {
      id: "elevation",
      icon: Mountain,
      iconColor: "#059669",
      iconBg: "#dcfce7",
      text: elevation < 12
        ? `Low-lying elevation of ${elevation}m above sea level increases inundation vulnerability.`
        : `Safe natural terrain elevation of ${elevation}m provides storm drainage protection.`,
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
        Key Insights
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {insights.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                lineHeight: "1.4",
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: item.iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "2px",
                }}
              >
                <Icon style={{ width: 13, height: 13, color: item.iconColor }} />
              </div>
              <span style={{ fontSize: "12px", color: "#334155", fontWeight: 500 }}>
                {item.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
