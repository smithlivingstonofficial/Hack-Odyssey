"use client";

import React, { useState } from "react";
import {
  GraduationCap,
  Waves,
  ThermometerSun,
  Wind,
  Mountain,
  Calculator,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";

export const LearnView: React.FC = () => {
  const [openSection, setOpenSection] = useState<string>("methodology");

  const topics = [
    {
      id: "methodology",
      title: "1. Climate-Adjusted Valuation Methodology",
      icon: Calculator,
      color: "#2563eb",
      summary: "How physical climate metrics are transformed into transparent financial discounts.",
      content: `Our valuation engine converts multi-hazard physical exposure into quantitative asset haircuts using deterministic empirical models:
• Base Valuation: Derived from statutory Tamil Nadu Guideline Rates (Inspector General of Registration) multiplied by cadastral built-up area extracted from OpenStreetMap.
• Flood Vulnerability Function: Computes deluge rainfall excess (10-year 24h deluge > 150mm), SRTM ground elevation datum (< 10m MSL), and geodesic distance to coastal watercourses.
• Thermal Asset Impairment: Evaluates wet-bulb temperature (> 32°C) and urban heat island microclimates, leading to increased cooling energy expenditure and structural roof degradation.
• Cyclone Wind Damage Matrix: Incorporates NOAA IBTrACS historical landfall records and coastal proximity within 15 km.
The resulting Climate-Adjusted Value reflects the actual discounted net asset value recommended for institutional underwriting.`,
    },
    {
      id: "flood",
      title: "2. Flood Inundation & Drainage Catchments",
      icon: Waves,
      color: "#0284c7",
      summary: "Understanding urban drainage basins, Chembarambakkam discharge, and coastal surge.",
      content: `Tamil Nadu's coastal plains feature micro-depressions and low-gradient drainage networks:
• The Cooum and Adyar River basins convey runoff from inland catchment reservoirs (Chembarambakkam, Puzhal) to the Bay of Bengal.
• Low-elevation terrain (< 8m MSL) experiences tidal backwater effects during monsoon storm events.
• Our GIS pipeline maps real-time elevation contours and waterway buffers to identify property-level water ingress risks.`,
    },
    {
      id: "heat",
      title: "3. Extreme Heat & Wet-Bulb Stress",
      icon: ThermometerSun,
      color: "#ea580c",
      summary: "Surface temperature anomalies and human habitability limits.",
      content: `Urban surface temperatures in Tamil Nadu often exceed ambient air temperature by 6°C to 12°C due to dense masonry and lack of tree canopy:
• Wet-Bulb Temperature (Tw): Computed via Stull's psychrometric formulation combining temperature and relative humidity. Tw > 35°C represents the physiological limit of human cooling.
• Commercial Impact: Prolonged heat waves increase HVAC electrical loads by 28-45% and accelerate concrete thermal expansion cracking.`,
    },
    {
      id: "cyclone",
      title: "4. Tropical Cyclone Trajectories & Gale Vectors",
      icon: Wind,
      color: "#ca8a04",
      summary: "Bay of Bengal cyclone corridors and NOAA IBTrACS historical landfall.",
      content: `The Bay of Bengal generates some of the North Indian Ocean's most severe tropical storms:
• Historical track analysis (Cyclone Michaung 2023, Vardah 2016, Thane 2011) demonstrates recurring landfall corridors along North Tamil Nadu.
• Wind gale velocities exceeding 120 km/h cause envelope damage, roof shear failure, and severe sea-water storm surges along the coastal strip.`,
    },
  ];

  return (
    <div style={{ maxWidth: "1080px", margin: "0 auto", paddingBottom: "48px", fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#2563eb",
            }}
          >
            <GraduationCap style={{ width: 20, height: 20 }} />
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
            Climate Intelligence Knowledge Base
          </h1>
        </div>
        <p style={{ fontSize: "13px", color: "#64748b", margin: "6px 0 0 0" }}>
          Scientific methodology, environmental datasets, and financial risk models explained.
        </p>
      </div>

      {/* Accordion Topics */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {topics.map((t) => {
          const Icon = t.icon;
          const isOpen = openSection === t.id;

          return (
            <div
              key={t.id}
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                transition: "all 0.15s ease",
              }}
            >
              {/* Header Button */}
              <button
                type="button"
                onClick={() => setOpenSection(isOpen ? "" : t.id)}
                style={{
                  width: "100%",
                  padding: "18px 22px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "10px",
                      background: `${t.color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: t.color,
                      flexShrink: 0,
                    }}
                  >
                    <Icon style={{ width: 18, height: 18 }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                      {t.title}
                    </h3>
                    <p style={{ fontSize: "12px", color: "#64748b", margin: "3px 0 0 0" }}>
                      {t.summary}
                    </p>
                  </div>
                </div>

                <div style={{ color: "#94a3b8" }}>
                  {isOpen ? <ChevronUp style={{ width: 18, height: 18 }} /> : <ChevronDown style={{ width: 18, height: 18 }} />}
                </div>
              </button>

              {/* Collapsible Content */}
              {isOpen && (
                <div
                  style={{
                    padding: "0 22px 22px 74px",
                    fontSize: "13px",
                    lineHeight: "1.65",
                    color: "#334155",
                    whiteSpace: "pre-line",
                    borderTop: "1px solid #f1f5f9",
                    paddingTop: "16px",
                  }}
                >
                  {t.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
