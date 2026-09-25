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
        track: "linear-gradient(90deg, #f87171, #dc2626)",
      };
    }
    if (score >= 55) {
      return {
        label: "High",
        color: "#ea580c",
        bg: "#fff7ed",
        border: "#fed7aa",
        track: "linear-gradient(90deg, #fb923c, #ea580c)",
      };
    }
    if (score >= 35) {
      return {
        label: "Medium",
        color: "#d97706",
        bg: "#fffbeb",
        border: "#fde68a",
        track: "linear-gradient(90deg, #fcd34d, #f59e0b)",
      };
    }
    return {
      label: "Low",
      color: "#059669",
      bg: "#ecfdf5",
      border: "#a7f3d0",
      track: "linear-gradient(90deg, #34d399, #10b981)",
    };
  };

  const floodLevel = getLevelLabel(floodScore);
  const heatLevel = getLevelLabel(heatScore);
  const cycloneLevel = getLevelLabel(cycloneScore);
  const inundationLevel = getLevelLabel(inundationScore);

  // Overall Severity Branding
  const overallLevel = getLevelLabel(overallScore);

  // SVG Gauge calculations
  // Arc parameters: Center (68, 72), Radius = 56, semi-circle from 180° to 0°
  const radius = 56;
  const circumference = Math.PI * radius; // 175.9
  const clampedScore = Math.min(100, Math.max(0, overallScore));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  // Exact needle/cursor coordinate on the arc
  const scoreAngleRad = Math.PI * (1 - clampedScore / 100);
  const cursorX = 68 + radius * Math.cos(scoreAngleRad);
  const cursorY = 72 - radius * Math.sin(scoreAngleRad);

  // Active mitigation check
  const activeDefensesCount = [
    propertyInput?.flood_protection,
    propertyInput?.cool_roof,
    propertyInput?.storm_resistant,
  ].filter(Boolean).length;

  return (
    <div
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #fbfcfe 100%)",
        border: "1px solid #e2e8f0",
        borderRadius: "18px",
        padding: "18px 20px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02), 0 10px 25px -5px rgba(0, 0, 0, 0.04)",
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
      {/* HEADER SECTION */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "10px",
            marginBottom: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#2563eb",
                boxShadow: "0 1px 2px rgba(37, 99, 235, 0.12)",
                flexShrink: 0,
              }}
            >
              <Activity size={16} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <h3
                  style={{
                    fontSize: "14.5px",
                    fontWeight: 700,
                    color: "#0f172a",
                    lineHeight: "1.2",
                    margin: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  Climate Risk Score
                </h3>
              </div>
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
                Multi-Hazard GIS Exposure & Defense Index
              </p>
            </div>
          </div>

          {/* Toggle pill: Hazards vs Drivers */}
          <div
            style={{
              display: "flex",
              background: "#f1f5f9",
              borderRadius: "8px",
              padding: "2px",
              gap: "2px",
              flexShrink: 0,
            }}
          >
            <button
              onClick={() => setActiveTab("hazards")}
              style={{
                border: "none",
                background: activeTab === "hazards" ? "#ffffff" : "transparent",
                color: activeTab === "hazards" ? "#0f172a" : "#64748b",
                fontSize: "11px",
                fontWeight: 600,
                padding: "3px 8px",
                borderRadius: "6px",
                cursor: "pointer",
                boxShadow: activeTab === "hazards" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              Hazards
            </button>
            <button
              onClick={() => setActiveTab("drivers")}
              style={{
                border: "none",
                background: activeTab === "drivers" ? "#ffffff" : "transparent",
                color: activeTab === "drivers" ? "#0f172a" : "#64748b",
                fontSize: "11px",
                fontWeight: 600,
                padding: "3px 8px",
                borderRadius: "6px",
                cursor: "pointer",
                boxShadow: activeTab === "drivers" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              Drivers
            </button>
          </div>
        </div>

        {/* MAIN BODY: SPEEDOMETER GAUGE (LEFT) + HAZARDS / DRIVERS (RIGHT) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "135px 1fr",
            alignItems: "center",
            gap: "16px",
            marginTop: "6px",
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
            }}
          >
            <div style={{ position: "relative", width: "135px", height: "82px" }}>
              <svg
                width="135"
                height="82"
                viewBox="0 0 136 82"
                style={{ overflow: "visible" }}
              >
                <defs>
                  <linearGradient id="meterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="35%" stopColor="#f59e0b" />
                    <stop offset="68%" stopColor="#ea580c" />
                    <stop offset="100%" stopColor="#dc2626" />
                  </linearGradient>

                  <filter id="cursorGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="rgba(0,0,0,0.25)" />
                  </filter>
                </defs>

                {/* Background Gauge Arc */}
                <path
                  d="M 12 72 A 56 56 0 0 1 124 72"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="10"
                  strokeLinecap="round"
                />

                {/* Active Colored Arc */}
                <path
                  d="M 12 72 A 56 56 0 0 1 124 72"
                  fill="none"
                  stroke="url(#meterGradient)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  style={{
                    transition: "stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                />

                {/* Tick Notches at 0, 35, 55, 75, 100 */}
                {[0, 35, 55, 75, 100].map((tick) => {
                  const tickRad = Math.PI * (1 - tick / 100);
                  const x1 = 68 + 48 * Math.cos(tickRad);
                  const y1 = 72 - 48 * Math.sin(tickRad);
                  const x2 = 68 + 43 * Math.cos(tickRad);
                  const y2 = 72 - 43 * Math.sin(tickRad);
                  return (
                    <line
                      key={tick}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#cbd5e1"
                      strokeWidth="1.2"
                    />
                  );
                })}

                {/* Glowing Needle / Pointer Cursor */}
                <circle
                  cx={cursorX}
                  cy={cursorY}
                  r="6"
                  fill="#ffffff"
                  stroke={overallLevel.color}
                  strokeWidth="2.75"
                  filter="url(#cursorGlow)"
                  style={{
                    transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                />
              </svg>

              {/* CENTER NUMERICAL VALUE & METRICS */}
              <div
                style={{
                  position: "absolute",
                  top: "28px",
                  left: 0,
                  right: 0,
                  textAlign: "center",
                  pointerEvents: "none",
                }}
              >
                <div style={{ display: "inline-flex", alignItems: "baseline", gap: "2px" }}>
                  <span
                    style={{
                      fontSize: "30px",
                      fontWeight: 800,
                      color: "#0f172a",
                      letterSpacing: "-0.03em",
                      lineHeight: "1",
                    }}
                  >
                    {Math.round(overallScore)}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#94a3b8",
                    }}
                  >
                    /100
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "8px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#64748b",
                    marginTop: "2px",
                  }}
                >
                  Composite Index
                </div>
              </div>
            </div>

            {/* SEVERITY BADGE UNDER GAUGE */}
            <div
              style={{
                marginTop: "4px",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "3px 10px",
                borderRadius: "20px",
                fontSize: "10.5px",
                fontWeight: 700,
                background: overallLevel.bg,
                color: overallLevel.color,
                border: `1px solid ${overallLevel.border}`,
                boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                whiteSpace: "nowrap",
              }}
            >
              {overallScore >= 75 ? (
                <AlertTriangle size={11} strokeWidth={2.5} />
              ) : overallScore >= 55 ? (
                <ShieldAlert size={11} strokeWidth={2.5} />
              ) : (
                <ShieldCheck size={11} strokeWidth={2.5} />
              )}
              <span>{overallCategory}</span>
            </div>

            {/* MITIGATION / CONFIDENCE STATUS CHIP */}
            {activeDefensesCount > 0 ? (
              <div
                style={{
                  marginTop: "4px",
                  fontSize: "9px",
                  color: "#059669",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                  whiteSpace: "nowrap",
                }}
              >
                <CheckCircle2 size={10} />
                <span>{activeDefensesCount} defenses applied</span>
              </div>
            ) : (
              <div
                style={{
                  marginTop: "4px",
                  fontSize: "9px",
                  color: "#64748b",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                }}
              >
                {Math.round(confidence * 100)}% model confidence
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: TAB 1 - HAZARDS BREAKDOWN */}
          {activeTab === "hazards" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: 0 }}>
              {/* 1. FLOOD RISK */}
              <div
                onMouseEnter={() => setHoveredHazard("flood")}
                onMouseLeave={() => setHoveredHazard(null)}
                style={{
                  padding: "5px 6px",
                  borderRadius: "8px",
                  background: hoveredHazard === "flood" ? "#f8fafc" : "transparent",
                  transition: "background 0.15s ease",
                  cursor: "pointer",
                }}
                onClick={() => onExploreHazard?.("flood")}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "3px", gap: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
                    <div
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "5px",
                        background: "#eff6ff",
                        color: "#2563eb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Waves size={11} />
                    </div>
                    <span style={{ fontSize: "11.5px", fontWeight: 600, color: "#1e293b", whiteSpace: "nowrap" }}>
                      Flood Risk
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap" }}>
                      {Math.round(floodScore)}
                      <span style={{ fontSize: "9px", color: "#94a3b8", fontWeight: 500 }}>/100</span>
                    </span>
                    <span
                      style={{
                        fontSize: "9.5px",
                        fontWeight: 700,
                        padding: "1px 6px",
                        borderRadius: "4px",
                        background: floodLevel.bg,
                        color: floodLevel.color,
                        border: `1px solid ${floodLevel.border}`,
                        whiteSpace: "nowrap",
                        minWidth: "44px",
                        textAlign: "center",
                      }}
                    >
                      {floodLevel.label}
                    </span>
                  </div>
                </div>
                <div style={{ height: "5px", background: "#f1f5f9", borderRadius: "3px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${floodScore}%`,
                      height: "100%",
                      background: floodLevel.track,
                      borderRadius: "3px",
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
              </div>

              {/* 2. HEAT EXPOSURE */}
              <div
                onMouseEnter={() => setHoveredHazard("heat")}
                onMouseLeave={() => setHoveredHazard(null)}
                style={{
                  padding: "5px 6px",
                  borderRadius: "8px",
                  background: hoveredHazard === "heat" ? "#f8fafc" : "transparent",
                  transition: "background 0.15s ease",
                  cursor: "pointer",
                }}
                onClick={() => onExploreHazard?.("heat")}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "3px", gap: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
                    <div
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "5px",
                        background: "#fff7ed",
                        color: "#ea580c",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <ThermometerSun size={11} />
                    </div>
                    <span style={{ fontSize: "11.5px", fontWeight: 600, color: "#1e293b", whiteSpace: "nowrap" }}>
                      Heat Exposure
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap" }}>
                      {Math.round(heatScore)}
                      <span style={{ fontSize: "9px", color: "#94a3b8", fontWeight: 500 }}>/100</span>
                    </span>
                    <span
                      style={{
                        fontSize: "9.5px",
                        fontWeight: 700,
                        padding: "1px 6px",
                        borderRadius: "4px",
                        background: heatLevel.bg,
                        color: heatLevel.color,
                        border: `1px solid ${heatLevel.border}`,
                        whiteSpace: "nowrap",
                        minWidth: "44px",
                        textAlign: "center",
                      }}
                    >
                      {heatLevel.label}
                    </span>
                  </div>
                </div>
                <div style={{ height: "5px", background: "#f1f5f9", borderRadius: "3px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${heatScore}%`,
                      height: "100%",
                      background: heatLevel.track,
                      borderRadius: "3px",
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
              </div>

              {/* 3. CYCLONE RISK */}
              <div
                onMouseEnter={() => setHoveredHazard("cyclone")}
                onMouseLeave={() => setHoveredHazard(null)}
                style={{
                  padding: "5px 6px",
                  borderRadius: "8px",
                  background: hoveredHazard === "cyclone" ? "#f8fafc" : "transparent",
                  transition: "background 0.15s ease",
                  cursor: "pointer",
                }}
                onClick={() => onExploreHazard?.("cyclone")}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "3px", gap: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
                    <div
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "5px",
                        background: "#eef2ff",
                        color: "#4f46e5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Wind size={11} />
                    </div>
                    <span style={{ fontSize: "11.5px", fontWeight: 600, color: "#1e293b", whiteSpace: "nowrap" }}>
                      Cyclone Risk
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap" }}>
                      {Math.round(cycloneScore)}
                      <span style={{ fontSize: "9px", color: "#94a3b8", fontWeight: 500 }}>/100</span>
                    </span>
                    <span
                      style={{
                        fontSize: "9.5px",
                        fontWeight: 700,
                        padding: "1px 6px",
                        borderRadius: "4px",
                        background: cycloneLevel.bg,
                        color: cycloneLevel.color,
                        border: `1px solid ${cycloneLevel.border}`,
                        whiteSpace: "nowrap",
                        minWidth: "44px",
                        textAlign: "center",
                      }}
                    >
                      {cycloneLevel.label}
                    </span>
                  </div>
                </div>
                <div style={{ height: "5px", background: "#f1f5f9", borderRadius: "3px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${cycloneScore}%`,
                      height: "100%",
                      background: cycloneLevel.track,
                      borderRadius: "3px",
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
              </div>

              {/* 4. INUNDATION & SURGE RISK */}
              <div
                onMouseEnter={() => setHoveredHazard("inundation")}
                onMouseLeave={() => setHoveredHazard(null)}
                style={{
                  padding: "5px 6px",
                  borderRadius: "8px",
                  background: hoveredHazard === "inundation" ? "#f8fafc" : "transparent",
                  transition: "background 0.15s ease",
                  cursor: "pointer",
                }}
                onClick={() => onExploreHazard?.("inundation")}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "3px", gap: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
                    <div
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "5px",
                        background: "#ecfdf5",
                        color: "#059669",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Mountain size={11} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", minWidth: 0 }}>
                      <span style={{ fontSize: "11.5px", fontWeight: 600, color: "#1e293b", whiteSpace: "nowrap" }}>
                        Inundation
                      </span>
                      <span
                        style={{
                          fontSize: "8.5px",
                          fontWeight: 600,
                          color: "#64748b",
                          background: "#f1f5f9",
                          padding: "1px 4px",
                          borderRadius: "3px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {Math.round(elevationM)}m
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap" }}>
                      {Math.round(inundationScore)}
                      <span style={{ fontSize: "9px", color: "#94a3b8", fontWeight: 500 }}>/100</span>
                    </span>
                    <span
                      style={{
                        fontSize: "9.5px",
                        fontWeight: 700,
                        padding: "1px 6px",
                        borderRadius: "4px",
                        background: inundationLevel.bg,
                        color: inundationLevel.color,
                        border: `1px solid ${inundationLevel.border}`,
                        whiteSpace: "nowrap",
                        minWidth: "44px",
                        textAlign: "center",
                      }}
                    >
                      {inundationLevel.label}
                    </span>
                  </div>
                </div>
                <div style={{ height: "5px", background: "#f1f5f9", borderRadius: "3px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${inundationScore}%`,
                      height: "100%",
                      background: inundationLevel.track,
                      borderRadius: "3px",
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* RIGHT COLUMN: TAB 2 - DRIVERS & DEFENSES VIEW */
            <div style={{ display: "flex", flexDirection: "column", gap: "7px", minWidth: 0 }}>
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "7px 10px",
                }}
              >
                <div style={{ fontSize: "9.5px", fontWeight: 700, color: "#0369a1", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "2px" }}>
                  Primary Risk Driver
                </div>
                <div style={{ fontSize: "11px", color: "#334155", fontWeight: 600, lineHeight: "1.3" }}>
                  {elevationM < 12
                    ? `Low elevation (${Math.round(elevationM)}m) accelerates stormwater retention & surge ingress.`
                    : "Intense monsoonal cloudbursts & high urban built-up thermal density."}
                </div>
              </div>

              {/* Property defenses status cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px" }}>
                <div
                  style={{
                    padding: "5px 7px",
                    borderRadius: "6px",
                    background: propertyInput?.flood_protection ? "#ecfdf5" : "#f8fafc",
                    border: `1px solid ${propertyInput?.flood_protection ? "#a7f3d0" : "#e2e8f0"}`,
                    fontSize: "10px",
                  }}
                >
                  <div style={{ fontWeight: 600, color: propertyInput?.flood_protection ? "#065f46" : "#64748b", whiteSpace: "nowrap" }}>
                    {propertyInput?.flood_protection ? "✓ Flood Barrier" : "✕ No Plinth"}
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: "9px" }}>
                    {propertyInput?.flood_protection ? "-24% exposure" : "+18% risk"}
                  </div>
                </div>

                <div
                  style={{
                    padding: "5px 7px",
                    borderRadius: "6px",
                    background: propertyInput?.cool_roof ? "#ecfdf5" : "#f8fafc",
                    border: `1px solid ${propertyInput?.cool_roof ? "#a7f3d0" : "#e2e8f0"}`,
                    fontSize: "10px",
                  }}
                >
                  <div style={{ fontWeight: 600, color: propertyInput?.cool_roof ? "#065f46" : "#64748b", whiteSpace: "nowrap" }}>
                    {propertyInput?.cool_roof ? "✓ Cool Roof" : "✕ Std Roof"}
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: "9px" }}>
                    {propertyInput?.cool_roof ? "-20% heat" : "+12% load"}
                  </div>
                </div>
              </div>

              {/* Mitigation tip */}
              <div
                style={{
                  fontSize: "10px",
                  color: "#475569",
                  background: "#f1f5f9",
                  padding: "5px 7px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Sparkles size={11} color="#6366f1" style={{ flexShrink: 0 }} />
                <span>Simulating resilience adaptations lowers risk score.</span>
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
          borderTop: "1px solid #f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "10.5px",
        }}
      >
        <span style={{ color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", flexShrink: 0 }} />
          <span>ERA5 30-Yr + SRTM 90m</span>
        </span>
        <span style={{ color: "#2563eb", fontWeight: 600, fontSize: "10.5px" }}>
          {overallScore >= 70 ? "High Exposure Zone" : "Balanced Risk Profile"}
        </span>
      </div>
    </div>
  );
};
