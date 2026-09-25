"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export const ClimateRiskOverTimeCard: React.FC = () => {
  const [selectedHazard, setSelectedHazard] = useState("Flood Risk");

  const hazardConfigs: Record<string, { color: string; fill: string; points: { year: string; x: number; y: number }[] }> = {
    "Flood Risk": {
      color: "#2563eb",
      fill: "#2563eb",
      points: [
        { year: "2020", x: 25, y: 72 },
        { year: "2025", x: 65, y: 55 },
        { year: "2030", x: 105, y: 48 },
        { year: "2035", x: 145, y: 42 },
        { year: "2040", x: 185, y: 35 },
        { year: "2045", x: 225, y: 28 },
        { year: "2050", x: 265, y: 22 },
      ],
    },
    "Heat Exposure": {
      color: "#ea580c",
      fill: "#ea580c",
      points: [
        { year: "2020", x: 25, y: 68 },
        { year: "2025", x: 65, y: 52 },
        { year: "2030", x: 105, y: 44 },
        { year: "2035", x: 145, y: 38 },
        { year: "2040", x: 185, y: 30 },
        { year: "2045", x: 225, y: 24 },
        { year: "2050", x: 265, y: 16 },
      ],
    },
    "Cyclone Risk": {
      color: "#d97706",
      fill: "#d97706",
      points: [
        { year: "2020", x: 25, y: 62 },
        { year: "2025", x: 65, y: 58 },
        { year: "2030", x: 105, y: 50 },
        { year: "2035", x: 145, y: 45 },
        { year: "2040", x: 185, y: 39 },
        { year: "2045", x: 225, y: 32 },
        { year: "2050", x: 265, y: 26 },
      ],
    },
  };

  const currentConfig = hazardConfigs[selectedHazard] || hazardConfigs["Flood Risk"];
  const points = currentConfig.points;

  const pathD = points.reduce(
    (acc, p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ""
  );

  const areaD = `${pathD} L 265 85 L 25 85 Z`;

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        padding: "18px 20px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
        fontFamily: "var(--font-sans)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Header with Dropdown */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        <span style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
          Climate Risk Over Time
        </span>
        <div style={{ position: "relative" }}>
          <select
            value={selectedHazard}
            onChange={(e) => setSelectedHazard(e.target.value)}
            style={{
              padding: "4px 22px 4px 10px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "11px",
              fontWeight: 600,
              color: "#334155",
              outline: "none",
              cursor: "pointer",
              appearance: "none",
            }}
          >
            <option value="Flood Risk">Flood Risk</option>
            <option value="Heat Exposure">Heat Exposure</option>
            <option value="Cyclone Risk">Cyclone Risk</option>
          </select>
          <ChevronDown
            style={{
              position: "absolute",
              right: "6px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "12px",
              height: "12px",
              color: "#64748b",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>

      {/* Interactive SVG Line Graph with Y-Axis and X-Axis */}
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        {/* Y-Axis Labels */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "85px",
            fontSize: "9px",
            color: "#94a3b8",
            fontWeight: 600,
            textAlign: "right",
            paddingRight: "4px",
          }}
        >
          <span>High</span>
          <span>Medium</span>
          <span>Low</span>
        </div>

        {/* SVG Chart Canvas */}
        <div style={{ flex: 1, position: "relative" }}>
          <svg width="100%" height="95" viewBox="0 0 290 95" style={{ overflow: "visible" }}>
            <defs>
              <linearGradient id="trendAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={currentConfig.color} stopOpacity="0.25" />
                <stop offset="100%" stopColor={currentConfig.color} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            <line x1="20" y1="20" x2="275" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="20" y1="50" x2="275" y2="50" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="20" y1="80" x2="275" y2="80" stroke="#f1f5f9" strokeWidth="1" />

            {/* Area Fill */}
            <path d={areaD} fill="url(#trendAreaGradient)" />

            {/* Trend Line */}
            <path d={pathD} fill="none" stroke={currentConfig.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Forecast dashed projection segment from 2035 to 2050 */}
            <line x1={points[3]?.x || 145} y1={points[3]?.y || 42} x2={points[6]?.x || 265} y2={points[6]?.y || 22} stroke={currentConfig.color} strokeWidth="2" strokeDasharray="4 4" />

            {/* Dots */}
            {points.map((p, idx) => (
              <circle
                key={p.year}
                cx={p.x}
                cy={p.y}
                r={idx === 3 ? "4.5" : "3"}
                fill={idx === 3 ? currentConfig.color : "#ffffff"}
                stroke={currentConfig.color}
                strokeWidth="2"
              />
            ))}

            {/* Tooltip callout badge over 2035 */}
            <g transform="translate(145, 12)">
              <rect x="-65" y="-12" width="130" height="18" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))" />
              <text x="0" y="1" textAnchor="middle" fontSize="8" fontWeight="700" fill="#1e293b">
                Higher risk expected in future years
              </text>
            </g>
          </svg>

          {/* X-Axis Years */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "9px",
              color: "#94a3b8",
              fontWeight: 600,
              paddingLeft: "10px",
              paddingRight: "10px",
              marginTop: "2px",
            }}
          >
            {points.map((p) => (
              <span key={p.year}>{p.year}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
