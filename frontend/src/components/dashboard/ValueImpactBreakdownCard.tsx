"use client";

import React from "react";
import { ValuationResult } from "@/lib/api";

interface ValueImpactBreakdownCardProps {
  valuation?: ValuationResult | null;
  floodScore?: number;
  heatScore?: number;
  cycloneScore?: number;
}

export const ValueImpactBreakdownCard: React.FC<ValueImpactBreakdownCardProps> = ({
  valuation,
  floodScore = 72,
  heatScore = 58,
  cycloneScore = 61,
}) => {
  const totalImpact = valuation?.total_climate_impact_percentage ?? 18;

  // Relative distribution
  const floodPct = Math.round(totalImpact * 0.44) || 8;
  const heatPct = Math.round(totalImpact * 0.28) || 5;
  const cyclonePct = Math.round(totalImpact * 0.17) || 3;
  const otherPct = Math.max(1, Math.round(totalImpact - (floodPct + heatPct + cyclonePct)));

  const breakdown = [
    { label: "Flood Risk", pct: `-${floodPct}%`, color: "#2563eb" },
    { label: "Heat Exposure", pct: `-${heatPct}%`, color: "#f97316" },
    { label: "Cyclone Risk", pct: `-${cyclonePct}%`, color: "#eab308" },
    { label: "Other Factors", pct: `-${otherPct}%`, color: "#0284c7" },
  ];

  // SVG Donut calculation (Radius: 38, StrokeWidth: 14)
  const size = 110;
  const r = 38;
  const c = 2 * Math.PI * r;

  const floodLen = (floodPct / totalImpact) * c;
  const heatLen = (heatPct / totalImpact) * c;
  const cycloneLen = (cyclonePct / totalImpact) * c;
  const otherLen = (otherPct / totalImpact) * c;

  const floodOffset = 0;
  const heatOffset = -floodLen;
  const cycloneOffset = -(floodLen + heatLen);
  const otherOffset = -(floodLen + heatLen + cycloneLen);

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        padding: "18px 22px",
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
          fontSize: "14px",
          fontWeight: 700,
          color: "#0f172a",
          marginBottom: "10px",
        }}
      >
        Value Impact Breakdown
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "110px 1fr",
          alignItems: "center",
          gap: "18px",
        }}
      >
        {/* SVG Donut Chart */}
        <div style={{ position: "relative", width: `${size}px`, height: `${size}px` }}>
          <svg width={size} height={size} viewBox="0 0 110 110" style={{ transform: "rotate(-90deg)" }}>
            {/* Background ring */}
            <circle cx="55" cy="55" r={r} fill="none" stroke="#f1f5f9" strokeWidth="14" />

            {/* Flood segment */}
            <circle
              cx="55"
              cy="55"
              r={r}
              fill="none"
              stroke="#2563eb"
              strokeWidth="14"
              strokeDasharray={`${floodLen} ${c - floodLen}`}
              strokeDashoffset={floodOffset}
            />

            {/* Heat segment */}
            <circle
              cx="55"
              cy="55"
              r={r}
              fill="none"
              stroke="#f97316"
              strokeWidth="14"
              strokeDasharray={`${heatLen} ${c - heatLen}`}
              strokeDashoffset={heatOffset}
            />

            {/* Cyclone segment */}
            <circle
              cx="55"
              cy="55"
              r={r}
              fill="none"
              stroke="#eab308"
              strokeWidth="14"
              strokeDasharray={`${cycloneLen} ${c - cycloneLen}`}
              strokeDashoffset={cycloneOffset}
            />

            {/* Other segment */}
            <circle
              cx="55"
              cy="55"
              r={r}
              fill="none"
              stroke="#0284c7"
              strokeWidth="14"
              strokeDasharray={`${otherLen} ${c - otherLen}`}
              strokeDashoffset={otherOffset}
            />
          </svg>

          {/* Center Text inside Donut */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: "1.1",
            }}
          >
            <span style={{ fontSize: "16px", fontWeight: 800, color: "#dc2626" }}>
              -{totalImpact.toFixed(0)}%
            </span>
            <span style={{ fontSize: "9px", color: "#64748b", fontWeight: 600 }}>
              Total Impact
            </span>
          </div>
        </div>

        {/* Legend List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {breakdown.map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "11px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: item.color,
                  }}
                />
                <span style={{ color: "#475569", fontWeight: 500 }}>{item.label}</span>
              </div>
              <span style={{ fontWeight: 700, color: "#dc2626" }}>{item.pct}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
