"use client";

import React from "react";
import { RiskScore } from "@/lib/api";

interface ClimateRiskScoreCardProps {
  overallScore?: number;
  overallCategory?: string;
  riskScores?: RiskScore[];
  elevationM?: number;
}

export const ClimateRiskScoreCard: React.FC<ClimateRiskScoreCardProps> = ({
  overallScore = 72,
  overallCategory = "High Risk",
  riskScores = [],
  elevationM = 8,
}) => {
  // Extract individual hazard scores
  const floodScore = riskScores.find((r) => r.hazard.toLowerCase() === "flood")?.score ?? 68;
  const heatScore = riskScores.find((r) => r.hazard.toLowerCase() === "heat")?.score ?? 58;
  const cycloneScore = riskScores.find((r) => r.hazard.toLowerCase() === "cyclone")?.score ?? 61;
  const elevationRiskScore = elevationM < 10 ? 70 : elevationM < 30 ? 40 : 15;

  const getLevelLabel = (score: number) => {
    if (score >= 70) return { label: "High", color: "#ef4444", bg: "#fee2e2" };
    if (score >= 40) return { label: "Medium", color: "#f97316", bg: "#ffedd5" };
    return { label: "Low", color: "#10b981", bg: "#ecfdf5" };
  };

  const floodLevel = getLevelLabel(floodScore);
  const heatLevel = getLevelLabel(heatScore);
  const cycloneLevel = getLevelLabel(cycloneScore);
  const elevationLevel = getLevelLabel(elevationRiskScore);

  // SVG Gauge calculations (Semi-circle gauge from 180deg to 0deg)
  const radius = 55;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, overallScore)) / 100) * circumference;

  const scoreColor =
    overallScore >= 70 ? "#ef4444" : overallScore >= 40 ? "#f97316" : "#10b981";

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        padding: "20px 24px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontFamily: "var(--font-sans)",
        height: "100%",
      }}
    >
      <h3
        style={{
          fontSize: "15px",
          fontWeight: 700,
          color: "#0f172a",
          marginBottom: "12px",
        }}
      >
        Climate Risk Score
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "130px 1fr",
          alignItems: "center",
          gap: "18px",
        }}
      >
        {/* Left: SVG Radial Semi-Circle Meter */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <svg width="130" height="75" viewBox="0 0 130 75" style={{ overflow: "visible" }}>
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="35%" stopColor="#f59e0b" />
                <stop offset="70%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>

            {/* Background Arc */}
            <path
              d="M 10 70 A 55 55 0 0 1 120 70"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="12"
              strokeLinecap="round"
            />

            {/* Value Arc */}
            <path
              d="M 10 70 A 55 55 0 0 1 120 70"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: "stroke-dashoffset 0.8s ease" }}
            />
          </svg>

          {/* Center Score Value */}
          <div
            style={{
              position: "absolute",
              top: "36px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: "#0f172a",
                lineHeight: "1",
              }}
            >
              {Math.round(overallScore)}
            </div>
          </div>

          {/* Category Badge Below Gauge */}
          <div
            style={{
              marginTop: "8px",
              padding: "2px 10px",
              borderRadius: "12px",
              fontSize: "11px",
              fontWeight: 700,
              background: overallScore >= 70 ? "#fee2e2" : overallScore >= 40 ? "#ffedd5" : "#ecfdf5",
              color: scoreColor,
            }}
          >
            {overallCategory}
          </div>
        </div>

        {/* Right: 4 Horizontal Hazard Progress Bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* Flood Risk */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", width: "105px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#2563eb" }} />
              <span style={{ fontSize: "12px", color: "#475569", fontWeight: 600 }}>Flood Risk</span>
            </div>
            <div style={{ flex: 1, height: "6px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${floodScore}%`,
                  height: "100%",
                  background: floodLevel.color,
                  borderRadius: "4px",
                  transition: "width 0.6s ease",
                }}
              />
            </div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: floodLevel.color, width: "45px", textAlign: "right" }}>
              {floodLevel.label}
            </span>
          </div>

          {/* Heat Exposure */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", width: "105px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f97316" }} />
              <span style={{ fontSize: "12px", color: "#475569", fontWeight: 600 }}>Heat Exposure</span>
            </div>
            <div style={{ flex: 1, height: "6px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${heatScore}%`,
                  height: "100%",
                  background: heatLevel.color,
                  borderRadius: "4px",
                  transition: "width 0.6s ease",
                }}
              />
            </div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: heatLevel.color, width: "45px", textAlign: "right" }}>
              {heatLevel.label}
            </span>
          </div>

          {/* Cyclone Risk */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", width: "105px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#eab308" }} />
              <span style={{ fontSize: "12px", color: "#475569", fontWeight: 600 }}>Cyclone Risk</span>
            </div>
            <div style={{ flex: 1, height: "6px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${cycloneScore}%`,
                  height: "100%",
                  background: cycloneLevel.color,
                  borderRadius: "4px",
                  transition: "width 0.6s ease",
                }}
              />
            </div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: cycloneLevel.color, width: "45px", textAlign: "right" }}>
              {cycloneLevel.label}
            </span>
          </div>

          {/* Elevation Risk */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", width: "105px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} />
              <span style={{ fontSize: "12px", color: "#475569", fontWeight: 600 }}>Elevation Risk</span>
            </div>
            <div style={{ flex: 1, height: "6px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${elevationRiskScore}%`,
                  height: "100%",
                  background: elevationLevel.color,
                  borderRadius: "4px",
                  transition: "width 0.6s ease",
                }}
              />
            </div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: elevationLevel.color, width: "45px", textAlign: "right" }}>
              {elevationLevel.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
