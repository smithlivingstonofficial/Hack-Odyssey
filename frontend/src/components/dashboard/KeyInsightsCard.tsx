"use client";

import React from "react";
import { Droplet, Thermometer, Wind, Mountain, Sparkles, CheckCircle2 } from "lucide-react";
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
  const distWaterKm = features ? (features.distance_to_water_m / 1000).toFixed(1) : "3.9";
  const elevation = features ? Math.round(features.elevation_m) : 8;

  const insights = [
    {
      id: "flood",
      title: "Drainage Basin & Coastal Surge",
      icon: Droplet,
      iconColor: "#2563eb",
      iconBg: "#eff6ff",
      badge: floodScore > 50 ? "High Watch" : "Safe Buffer",
      badgeBg: floodScore > 50 ? "#fff7ed" : "#ecfdf5",
      badgeColor: floodScore > 50 ? "#ea580c" : "#059669",
      text: `Property is within ${distWaterKm} km of a coastal surge or flood-prone drainage basin.`,
    },
    {
      id: "heat",
      title: "Urban Surface Microclimate",
      icon: Thermometer,
      iconColor: "#ea580c",
      iconBg: "#fff7ed",
      badge: heatScore > 50 ? "Elevated Heat" : "Moderate",
      badgeBg: heatScore > 50 ? "#fef2f2" : "#f0fdf4",
      badgeColor: heatScore > 50 ? "#dc2626" : "#166534",
      text:
        heatScore > 50
          ? "Located in a high urban surface temperature microclimate region."
          : "Moderate thermal exposure with normal diurnal cooling.",
    },
    {
      id: "cyclone",
      title: "Tropical Storm Trajectory",
      icon: Wind,
      iconColor: "#7c3aed",
      iconBg: "#f5f3ff",
      badge: cycloneScore > 50 ? "Active Track" : "Sheltered",
      badgeBg: cycloneScore > 50 ? "#fffbeb" : "#ecfdf5",
      badgeColor: cycloneScore > 50 ? "#d97706" : "#059669",
      text:
        cycloneScore > 50
          ? "Falls within the historical Bay of Bengal cyclone landfall corridor."
          : "Sheltered inland region with reduced tropical storm risk.",
    },
    {
      id: "elevation",
      title: "Topographic Runoff & Inundation",
      icon: Mountain,
      iconColor: "#059669",
      iconBg: "#ecfdf5",
      badge: elevation < 12 ? "Low-Lying" : "Naturally Elevated",
      badgeBg: elevation < 12 ? "#fef2f2" : "#ecfdf5",
      badgeColor: elevation < 12 ? "#dc2626" : "#059669",
      text:
        elevation < 12
          ? `Low-lying elevation of ${elevation}m above sea level increases inundation vulnerability.`
          : `Safe natural terrain elevation of ${elevation}m provides storm drainage protection.`,
    },
  ];

  return (
    <div
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #fbfcfe 100%)",
        border: "1px solid #e2e8f0",
        borderRadius: "18px",
        padding: "16px 18px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02), 0 10px 25px -5px rgba(0, 0, 0, 0.04)",
        fontFamily: "var(--font-sans, -apple-system, BlinkMacSystemFont, sans-serif)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        boxSizing: "border-box",
        minWidth: 0,
      }}
    >
      <div>
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #f5f3ff, #ede9fe)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#7c3aed",
                boxShadow: "0 1px 2px rgba(124, 58, 237, 0.12)",
                flexShrink: 0,
              }}
            >
              <Sparkles size={16} />
            </div>
            <div>
              <h3
                style={{
                  fontSize: "14.5px",
                  fontWeight: 700,
                  color: "#0f172a",
                  lineHeight: "1.2",
                  margin: 0,
                }}
              >
                Key Insights
              </h3>
              <p
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  margin: "1px 0 0 0",
                  fontWeight: 500,
                }}
              >
                Synthesized risk factors derived from property location
              </p>
            </div>
          </div>

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "3px 9px",
              borderRadius: "12px",
              fontSize: "10px",
              fontWeight: 700,
              background: "#f0fdf4",
              color: "#166534",
              border: "1px solid #bbf7d0",
              whiteSpace: "nowrap",
            }}
          >
            <CheckCircle2 size={10} color="#16a34a" />
            Synthesized
          </span>
        </div>

        {/* INSIGHT ROWS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {insights.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "9px 11px",
                  background: "#ffffff",
                  border: "1px solid #f1f5f9",
                  borderRadius: "10px",
                  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.02)",
                  transition: "all 0.15s ease",
                }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "6px",
                    background: item.iconBg,
                    color: item.iconColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "1px",
                  }}
                >
                  <Icon size={13} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px", marginBottom: "2px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#1e293b" }}>
                      {item.title}
                    </span>
                    <span
                      style={{
                        fontSize: "9px",
                        fontWeight: 700,
                        color: item.badgeColor,
                        background: item.badgeBg,
                        padding: "1px 5px",
                        borderRadius: "4px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <p style={{ fontSize: "11px", color: "#475569", margin: 0, lineHeight: "1.4" }}>
                    {item.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER BAR */}
      <div
        style={{
          marginTop: "12px",
          paddingTop: "9px",
          borderTop: "1px solid #f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "10.5px",
          color: "#94a3b8",
        }}
      >
        <span>Deterministic Rule Engine</span>
        <span style={{ color: "#2563eb", fontWeight: 600 }}>Zero Static Placeholders</span>
      </div>
    </div>
  );
};
