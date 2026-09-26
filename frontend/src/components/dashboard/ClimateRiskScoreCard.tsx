"use client";

import React, { useState } from "react";
import { RiskScore, PropertyInput } from "@/lib/api";
import {
  Waves,
  ThermometerSun,
  Wind,
  Mountain,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Activity,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface ClimateRiskScoreCardProps {
  overallScore?: number;
  overallCategory?: string;
  riskScores?: RiskScore[];
  elevationM?: number;
  propertyInput?: PropertyInput;
  confidence?: number;
  onExploreHazard?: (hazard: string) => void;
}

export const ClimateRiskScoreCard: React.FC<ClimateRiskScoreCardProps> = ({
  overallScore = 72,
  overallCategory = "High Risk",
  riskScores = [],
  elevationM = 8,
  propertyInput,
  confidence = 0.85,
  onExploreHazard,
}) => {
  const [activeTab, setActiveTab] = useState<"hazards" | "drivers">("hazards");
  const [hoveredHazard, setHoveredHazard] = useState<string | null>(null);

  // Extract individual hazard scores with smooth continuous fallbacks
  const floodItem = riskScores.find((r) => r.hazard.toLowerCase() === "flood");
  const heatItem = riskScores.find((r) => r.hazard.toLowerCase() === "heat");
  const cycloneItem = riskScores.find((r) => r.hazard.toLowerCase() === "cyclone");
  const inundationItem = riskScores.find((r) =>
    r.hazard.toLowerCase() === "inundation" || r.hazard.toLowerCase() === "elevation"
  );

  const floodScore = floodItem?.score ?? 68;
  const heatScore = heatItem?.score ?? 58;
  const cycloneScore = cycloneItem?.score ?? 61;

  // Calibrated continuous topographic inundation score
  const computedInundationScore = Math.round(
    Math.max(4, Math.min(96, 100 / (1 + Math.pow(elevationM / 14, 2.0))))
  );
  const inundationScore = inundationItem?.score ?? computedInundationScore;

  // Standardized severity levels
  const getLevelLabel = (score: number) => {
    if (score >= 75) {
      return {
        label: "Severe",
        color: "#dc2626",
        bg: "#fef2f2",
        border: "#fecaca",
        track: "linear-gradient(90deg, #f87171 0%, #dc2626 100%)",
      };
    }
    if (score >= 55) {
      return {
        label: "High",
        color: "#ea580c",
        bg: "#fff7ed",
        border: "#fed7aa",
        track: "linear-gradient(90deg, #fb923c 0%, #ea580c 100%)",
      };
    }
    if (score >= 35) {
      return {
        label: "Medium",
        color: "#d97706",
        bg: "#fffbeb",
        border: "#fde68a",
        track: "linear-gradient(90deg, #fcd34d 0%, #f59e0b 100%)",
      };
    }
    return {
      label: "Low",
      color: "#059669",
      bg: "#ecfdf5",
      border: "#a7f3d0",
      track: "linear-gradient(90deg, #34d399 0%, #10b981 100%)",
    };
  };

  const floodLevel = getLevelLabel(floodScore);
  const heatLevel = getLevelLabel(heatScore);
  const cycloneLevel = getLevelLabel(cycloneScore);
  const inundationLevel = getLevelLabel(inundationScore);

  // Overall Severity Branding
  const overallLevel = getLevelLabel(overallScore);

  // SVG Gauge calculations
  // Arc parameters: Center (76, 76), Radius = 58, semi-circle from 180° to 0°
  const radius = 58;
  const circumference = Math.PI * radius; // 182.2
  const clampedScore = Math.min(100, Math.max(0, overallScore));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  // Exact needle/cursor coordinate on the arc
  const scoreAngleRad = Math.PI * (1 - clampedScore / 100);
  const cursorX = 76 + radius * Math.cos(scoreAngleRad);
  const cursorY = 76 - radius * Math.sin(scoreAngleRad);

  // Active mitigation check
  const activeDefensesCount = [
    propertyInput?.flood_protection,
    propertyInput?.cool_roof,
    propertyInput?.storm_resistant,
  ].filter(Boolean).length;

  return (
    <div
      style={{
        background: "linear-gradient(170deg, #ffffff 0%, #fbfdff 55%, #f4f8ff 100%)",
        border: "1px solid #dbeafe",
        borderRadius: "18px",
        padding: "16px 18px",
        boxShadow: "0 2px 4px rgba(15, 23, 42, 0.02), 0 12px 28px -6px rgba(37, 99, 235, 0.08)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontFamily: "var(--font-sans, -apple-system, BlinkMacSystemFont, sans-serif)",
        height: "100%",
        position: "relative",
        boxSizing: "border-box",
        minWidth: 0,
      }}
    >
      <div>
        {/* HEADER SECTION */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
            marginBottom: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                border: "1px solid #bfdbfe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#2563eb",
                boxShadow: "0 2px 4px rgba(37, 99, 235, 0.12)",
                flexShrink: 0,
              }}
            >
              <Activity size={16} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h3
                style={{
                  fontSize: "15px",
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: "1.2",
                  margin: 0,
                  letterSpacing: "-0.2px",
                  whiteSpace: "nowrap",
                }}
              >
                Climate Risk Score
              </h3>
              <p
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  margin: "1px 0 0 0",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Overall Weather Risk & Protection Level
              </p>
            </div>
          </div>

          {/* Toggle pill: Hazards vs Drivers */}
          <div
            style={{
              display: "flex",
              background: "#f1f5f9",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "2px",
              gap: "2px",
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab("hazards")}
              style={{
                border: "none",
                background: activeTab === "hazards" ? "#ffffff" : "transparent",
                color: activeTab === "hazards" ? "#0f172a" : "#64748b",
                fontSize: "11px",
                fontWeight: 700,
                padding: "3.5px 9px",
                borderRadius: "6px",
                cursor: "pointer",
                boxShadow: activeTab === "hazards" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              Weather Risks
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("drivers")}
              style={{
                border: "none",
                background: activeTab === "drivers" ? "#ffffff" : "transparent",
                color: activeTab === "drivers" ? "#0f172a" : "#64748b",
                fontSize: "11px",
                fontWeight: 700,
                padding: "3.5px 9px",
                borderRadius: "6px",
                cursor: "pointer",
                boxShadow: activeTab === "drivers" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              Key Factors
            </button>
          </div>
        </div>

        {/* MAIN BODY: SPEEDOMETER GAUGE (LEFT) + HAZARDS / DRIVERS (RIGHT) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "152px 1fr",
            alignItems: "center",
            gap: "16px",
            marginTop: "2px",
          }}
        >
          {/* LEFT: PRECISION SVG RADIAL SPEEDOMETER */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              padding: "4px 0",
            }}
          >
            {/* GAUGE HEADER LABEL (CLEANLY POSITIONED ABOVE ARC WITH ZERO NEEDLE INTERSECTION) */}
            <div
              style={{
                fontSize: "9.5px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#64748b",
                marginBottom: "4px",
                textAlign: "center",
              }}
            >
              Composite Score
            </div>

            <div style={{ position: "relative", width: "152px", height: "88px" }}>
              <svg
                width="152"
                height="88"
                viewBox="0 0 152 88"
                style={{ overflow: "visible" }}
              >
                <defs>
                  <linearGradient id="scoreGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="30%" stopColor="#22c55e" />
                    <stop offset="55%" stopColor="#f59e0b" />
                    <stop offset="78%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>

                  <filter id="gaugeShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(37,99,235,0.12)" />
                  </filter>

                  <filter id="needleGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="1.5" stdDeviation="2.5" floodColor="rgba(0,0,0,0.25)" />
                  </filter>
                </defs>

                {/* Base track */}
                <path
                  d="M 18 76 A 58 58 0 0 1 134 76"
                  fill="none"
                  stroke="#edf2f7"
                  strokeWidth="12"
                  strokeLinecap="round"
                />

                {/* Active Colored Arc */}
                <path
                  d="M 18 76 A 58 58 0 0 1 134 76"
                  fill="none"
                  stroke="url(#scoreGaugeGrad)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  filter="url(#gaugeShadow)"
                  style={{
                    transition: "stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                />

                {/* Needle Cursor Pin on Arc */}
                <circle
                  cx={cursorX}
                  cy={cursorY}
                  r="7"
                  fill="#ffffff"
                  stroke={overallLevel.color}
                  strokeWidth="3.5"
                  filter="url(#needleGlow)"
                  style={{
                    transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                />
              </svg>

              {/* CENTER NUMERICAL VALUE & SCALE (PERFECTLY CENTERED, ZERO OVERLAP) */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: "28px",
                  bottom: "8px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                }}
              >
                <span
                  style={{
                    fontSize: "36px",
                    fontWeight: 900,
                    color: "#0f172a",
                    letterSpacing: "-0.04em",
                    lineHeight: "1",
                  }}
                >
                  {Math.round(overallScore)}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#94a3b8",
                    letterSpacing: "0.04em",
                    marginTop: "2px",
                  }}
                >
                  / 100
                </span>
              </div>
            </div>

            {/* SEVERITY BADGE UNDER GAUGE */}
            <div
              style={{
                marginTop: "8px",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "3.5px 12px",
                borderRadius: "20px",
                fontSize: "11px",
                fontWeight: 800,
                background: overallLevel.bg,
                color: overallLevel.color,
                border: `1.5px solid ${overallLevel.border}`,
                boxShadow: `0 2px 6px ${overallLevel.color}22`,
                letterSpacing: "0.02em",
                whiteSpace: "nowrap",
              }}
            >
              {overallScore >= 75 ? (
                <AlertTriangle size={13} strokeWidth={2.5} />
              ) : overallScore >= 55 ? (
                <ShieldAlert size={13} strokeWidth={2.5} />
              ) : (
                <ShieldCheck size={13} strokeWidth={2.5} />
              )}
              <span>{overallCategory.toUpperCase()}</span>
            </div>

            {/* MITIGATION / CONFIDENCE STATUS CHIP */}
            {activeDefensesCount > 0 ? (
              <div
                style={{
                  marginTop: "6px",
                  fontSize: "9.5px",
                  color: "#059669",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  background: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  whiteSpace: "nowrap",
                }}
              >
                <CheckCircle2 size={11} color="#059669" />
                <span>{activeDefensesCount} defenses applied</span>
              </div>
            ) : (
              <div
                style={{
                  marginTop: "6px",
                  fontSize: "10px",
                  color: "#64748b",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  background: "#f8fafc",
                  border: "1px solid #eef2f6",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#3b82f6" }} />
                <span>{Math.round(confidence * 100)}% model confidence</span>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: TAB 1 - HAZARDS BREAKDOWN (MODERN MINI-CARDS) */}
          {activeTab === "hazards" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "7px", minWidth: 0 }}>
              {/* 1. FLOOD RISK */}
              <div
                onMouseEnter={() => setHoveredHazard("flood")}
                onMouseLeave={() => setHoveredHazard(null)}
                onClick={() => onExploreHazard?.("flood")}
                style={{
                  padding: "7px 10px",
                  borderRadius: "10px",
                  background: hoveredHazard === "flood" ? "#ffffff" : "#fbfcfe",
                  border: hoveredHazard === "flood" ? "1px solid #bfdbfe" : "1px solid #eef2f6",
                  boxShadow: hoveredHazard === "flood" ? "0 2px 8px rgba(37, 99, 235, 0.08)" : "0 1px 2px rgba(15, 23, 42, 0.02)",
                  transition: "all 0.15s ease",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "5px", gap: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px", minWidth: 0 }}>
                    <div
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "6px",
                        background: "#eff6ff",
                        color: "#2563eb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Waves size={12} />
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", whiteSpace: "nowrap" }}>
                      Flood Risk
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                    <span style={{ fontSize: "11.5px", fontWeight: 800, color: "#0f172a", whiteSpace: "nowrap" }}>
                      {Math.round(floodScore)}
                      <span style={{ fontSize: "9.5px", color: "#94a3b8", fontWeight: 600 }}>/100</span>
                    </span>
                    <span
                      style={{
                        fontSize: "9.5px",
                        fontWeight: 700,
                        padding: "1.5px 7px",
                        borderRadius: "4px",
                        background: floodLevel.bg,
                        color: floodLevel.color,
                        border: `1px solid ${floodLevel.border}`,
                        whiteSpace: "nowrap",
                        minWidth: "46px",
                        textAlign: "center",
                      }}
                    >
                      {floodLevel.label}
                    </span>
                  </div>
                </div>
                <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${floodScore}%`,
                      height: "100%",
                      background: floodLevel.track,
                      borderRadius: "4px",
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
              </div>

              {/* 2. HEAT EXPOSURE */}
              <div
                onMouseEnter={() => setHoveredHazard("heat")}
                onMouseLeave={() => setHoveredHazard(null)}
                onClick={() => onExploreHazard?.("heat")}
                style={{
                  padding: "7px 10px",
                  borderRadius: "10px",
                  background: hoveredHazard === "heat" ? "#ffffff" : "#fbfcfe",
                  border: hoveredHazard === "heat" ? "1px solid #fed7aa" : "1px solid #eef2f6",
                  boxShadow: hoveredHazard === "heat" ? "0 2px 8px rgba(234, 88, 12, 0.08)" : "0 1px 2px rgba(15, 23, 42, 0.02)",
                  transition: "all 0.15s ease",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "5px", gap: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px", minWidth: 0 }}>
                    <div
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "6px",
                        background: "#fff7ed",
                        color: "#ea580c",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <ThermometerSun size={12} />
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", whiteSpace: "nowrap" }}>
                      Heat Exposure
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                    <span style={{ fontSize: "11.5px", fontWeight: 800, color: "#0f172a", whiteSpace: "nowrap" }}>
                      {Math.round(heatScore)}
                      <span style={{ fontSize: "9.5px", color: "#94a3b8", fontWeight: 600 }}>/100</span>
                    </span>
                    <span
                      style={{
                        fontSize: "9.5px",
                        fontWeight: 700,
                        padding: "1.5px 7px",
                        borderRadius: "4px",
                        background: heatLevel.bg,
                        color: heatLevel.color,
                        border: `1px solid ${heatLevel.border}`,
                        whiteSpace: "nowrap",
                        minWidth: "46px",
                        textAlign: "center",
                      }}
                    >
                      {heatLevel.label}
                    </span>
                  </div>
                </div>
                <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${heatScore}%`,
                      height: "100%",
                      background: heatLevel.track,
                      borderRadius: "4px",
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
              </div>

              {/* 3. CYCLONE RISK */}
              <div
                onMouseEnter={() => setHoveredHazard("cyclone")}
                onMouseLeave={() => setHoveredHazard(null)}
                onClick={() => onExploreHazard?.("cyclone")}
                style={{
                  padding: "7px 10px",
                  borderRadius: "10px",
                  background: hoveredHazard === "cyclone" ? "#ffffff" : "#fbfcfe",
                  border: hoveredHazard === "cyclone" ? "1px solid #ddd6fe" : "1px solid #eef2f6",
                  boxShadow: hoveredHazard === "cyclone" ? "0 2px 8px rgba(124, 58, 237, 0.08)" : "0 1px 2px rgba(15, 23, 42, 0.02)",
                  transition: "all 0.15s ease",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "5px", gap: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px", minWidth: 0 }}>
                    <div
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "6px",
                        background: "#f5f3ff",
                        color: "#7c3aed",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Wind size={12} />
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", whiteSpace: "nowrap" }}>
                      Cyclone Risk
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                    <span style={{ fontSize: "11.5px", fontWeight: 800, color: "#0f172a", whiteSpace: "nowrap" }}>
                      {Math.round(cycloneScore)}
                      <span style={{ fontSize: "9.5px", color: "#94a3b8", fontWeight: 600 }}>/100</span>
                    </span>
                    <span
                      style={{
                        fontSize: "9.5px",
                        fontWeight: 700,
                        padding: "1.5px 7px",
                        borderRadius: "4px",
                        background: cycloneLevel.bg,
                        color: cycloneLevel.color,
                        border: `1px solid ${cycloneLevel.border}`,
                        whiteSpace: "nowrap",
                        minWidth: "46px",
                        textAlign: "center",
                      }}
                    >
                      {cycloneLevel.label}
                    </span>
                  </div>
                </div>
                <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${cycloneScore}%`,
                      height: "100%",
                      background: cycloneLevel.track,
                      borderRadius: "4px",
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
              </div>

              {/* 4. INUNDATION RUNOFF RISK */}
              <div
                onMouseEnter={() => setHoveredHazard("inundation")}
                onMouseLeave={() => setHoveredHazard(null)}
                onClick={() => onExploreHazard?.("inundation")}
                style={{
                  padding: "7px 10px",
                  borderRadius: "10px",
                  background: hoveredHazard === "inundation" ? "#ffffff" : "#fbfcfe",
                  border: hoveredHazard === "inundation" ? "1px solid #bbf7d0" : "1px solid #eef2f6",
                  boxShadow: hoveredHazard === "inundation" ? "0 2px 8px rgba(16, 185, 129, 0.08)" : "0 1px 2px rgba(15, 23, 42, 0.02)",
                  transition: "all 0.15s ease",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "5px", gap: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px", minWidth: 0 }}>
                    <div
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "6px",
                        background: "#ecfdf5",
                        color: "#059669",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Mountain size={12} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", minWidth: 0 }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", whiteSpace: "nowrap" }}>
                        Inundation
                      </span>
                      <span
                        style={{
                          fontSize: "9px",
                          fontWeight: 700,
                          color: "#475569",
                          background: "#f1f5f9",
                          padding: "1px 5px",
                          borderRadius: "4px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {Math.round(elevationM)}m
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                    <span style={{ fontSize: "11.5px", fontWeight: 800, color: "#0f172a", whiteSpace: "nowrap" }}>
                      {Math.round(inundationScore)}
                      <span style={{ fontSize: "9.5px", color: "#94a3b8", fontWeight: 600 }}>/100</span>
                    </span>
                    <span
                      style={{
                        fontSize: "9.5px",
                        fontWeight: 700,
                        padding: "1.5px 7px",
                        borderRadius: "4px",
                        background: inundationLevel.bg,
                        color: inundationLevel.color,
                        border: `1px solid ${inundationLevel.border}`,
                        whiteSpace: "nowrap",
                        minWidth: "46px",
                        textAlign: "center",
                      }}
                    >
                      {inundationLevel.label}
                    </span>
                  </div>
                </div>
                <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${inundationScore}%`,
                      height: "100%",
                      background: inundationLevel.track,
                      borderRadius: "4px",
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* RIGHT COLUMN: TAB 2 - DRIVERS & DEFENSES VIEW */
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: 0 }}>
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "9px 12px",
                  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.02)",
                }}
              >
                <div style={{ fontSize: "9.5px", fontWeight: 800, color: "#0284c7", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "3px" }}>
                  Primary Risk Driver
                </div>
                <div style={{ fontSize: "11.5px", color: "#334155", fontWeight: 600, lineHeight: "1.35" }}>
                  {elevationM < 12
                    ? `Low elevation (${Math.round(elevationM)}m) accelerates stormwater retention & surge ingress.`
                    : "Intense monsoonal cloudbursts & high urban built-up thermal density."}
                </div>
              </div>

              {/* Property defenses status cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                <div
                  style={{
                    padding: "7px 9px",
                    borderRadius: "8px",
                    background: propertyInput?.flood_protection ? "#ecfdf5" : "#f8fafc",
                    border: `1px solid ${propertyInput?.flood_protection ? "#a7f3d0" : "#e2e8f0"}`,
                    fontSize: "10.5px",
                  }}
                >
                  <div style={{ fontWeight: 700, color: propertyInput?.flood_protection ? "#065f46" : "#64748b", whiteSpace: "nowrap" }}>
                    {propertyInput?.flood_protection ? "✓ Raised Ground" : "✕ Standard Build"}
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: "9.5px", marginTop: "1px" }}>
                    {propertyInput?.flood_protection ? "-24% flood exposure" : "+18% risk load"}
                  </div>
                </div>

                <div
                  style={{
                    padding: "7px 9px",
                    borderRadius: "8px",
                    background: propertyInput?.cool_roof ? "#ecfdf5" : "#f8fafc",
                    border: `1px solid ${propertyInput?.cool_roof ? "#a7f3d0" : "#e2e8f0"}`,
                    fontSize: "10.5px",
                  }}
                >
                  <div style={{ fontWeight: 700, color: propertyInput?.cool_roof ? "#065f46" : "#64748b", whiteSpace: "nowrap" }}>
                    {propertyInput?.cool_roof ? "✓ Cool Roof" : "✕ Standard Roof"}
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: "9.5px", marginTop: "1px" }}>
                    {propertyInput?.cool_roof ? "-20% heat load" : "+12% heat impact"}
                  </div>
                </div>
              </div>

              {/* Mitigation tip */}
              <div
                style={{
                  fontSize: "10.5px",
                  color: "#475569",
                  background: "#f8fafc",
                  border: "1px solid #f1f5f9",
                  padding: "7px 10px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Sparkles size={12} color="#6366f1" style={{ flexShrink: 0 }} />
                <span>Simulating resilience adaptations directly reduces risk and preserves value.</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER: DYNAMIC METRIC CALLOUT */}
      <div
        style={{
          marginTop: "12px",
          paddingTop: "9px",
          borderTop: "1px solid #eef2f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "10.5px",
        }}
      >
        <span style={{ color: "#64748b", display: "flex", alignItems: "center", gap: "5px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", flexShrink: 0 }} />
          <span>ERA5 30-Yr + SRTM 90m</span>
        </span>
        <span
          style={{
            color: overallScore >= 70 ? "#dc2626" : overallScore >= 50 ? "#ea580c" : "#059669",
            fontWeight: 700,
            fontSize: "10.5px",
            background: overallScore >= 70 ? "#fef2f2" : overallScore >= 50 ? "#fff7ed" : "#ecfdf5",
            padding: "2px 8px",
            borderRadius: "6px",
          }}
        >
          {overallScore >= 70 ? "High Exposure Zone" : overallScore >= 50 ? "Moderate Exposure" : "Balanced Risk Profile"}
        </span>
      </div>
    </div>
  );
};
