"use client";

import React, { useState } from "react";
import { Droplet, Thermometer, Wind, Leaf } from "lucide-react";

export const FutureScenarioCard: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<"2030" | "2040" | "2050">("2050");

  const yearData = {
    "2030": { flood: "+12%", heat: "+15%", cyclone: "+8%" },
    "2040": { flood: "+20%", heat: "+26%", cyclone: "+14%" },
    "2050": { flood: "+28%", heat: "+35%", cyclone: "+18%" },
  };

  const current = yearData[selectedYear];

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
      {/* Header with Year Selector Pills */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        <span style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
          Future Scenario
        </span>

        {/* Year Pills */}
        <div style={{ display: "flex", gap: "4px" }}>
          {(["2030", "2040", "2050"] as const).map((year) => {
            const isActive = selectedYear === year;
            return (
              <button
                key={year}
                type="button"
                onClick={() => setSelectedYear(year)}
                style={{
                  padding: "3px 10px",
                  borderRadius: "14px",
                  border: isActive ? "1px solid #2563eb" : "1px solid #e2e8f0",
                  background: isActive ? "#2563eb" : "#f8fafc",
                  color: isActive ? "#ffffff" : "#64748b",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {year}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3 Metric Cards in a Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "8px",
          marginBottom: "12px",
        }}
      >
        {/* Flood Risk */}
        <div
          style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "10px",
            padding: "8px 10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
            <Droplet style={{ width: 12, height: 12, color: "#2563eb" }} />
            <span style={{ fontSize: "10px", fontWeight: 600, color: "#1e40af" }}>Flood Risk</span>
          </div>
          <div style={{ fontSize: "16px", fontWeight: 800, color: "#1d4ed8" }}>
            {current.flood} <span style={{ fontSize: "12px" }}>↑</span>
          </div>
        </div>

        {/* Heat Exposure */}
        <div
          style={{
            background: "#fff7ed",
            border: "1px solid #fed7aa",
            borderRadius: "10px",
            padding: "8px 10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
            <Thermometer style={{ width: 12, height: 12, color: "#ea580c" }} />
            <span style={{ fontSize: "10px", fontWeight: 600, color: "#9a3412" }}>Heat Exposure</span>
          </div>
          <div style={{ fontSize: "16px", fontWeight: 800, color: "#c2410c" }}>
            {current.heat} <span style={{ fontSize: "12px" }}>↑</span>
          </div>
        </div>

        {/* Cyclone Risk */}
        <div
          style={{
            background: "#fefce8",
            border: "1px solid #fef08a",
            borderRadius: "10px",
            padding: "8px 10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
            <Wind style={{ width: 12, height: 12, color: "#ca8a04" }} />
            <span style={{ fontSize: "10px", fontWeight: 600, color: "#854d0e" }}>Cyclone Risk</span>
          </div>
          <div style={{ fontSize: "16px", fontWeight: 800, color: "#a16207" }}>
            {current.cyclone} <span style={{ fontSize: "12px" }}>↑</span>
          </div>
        </div>
      </div>

      {/* Summary Note with Green Leaf */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "8px",
          fontSize: "11px",
          color: "#475569",
          lineHeight: "1.35",
        }}
      >
        <Leaf style={{ width: 14, height: 14, color: "#10b981", flexShrink: 0, marginTop: "2px" }} />
        <span>
          By {selectedYear}, this location is expected to face higher flood and heat risks, which may further reduce property value.
        </span>
      </div>
    </div>
  );
};
