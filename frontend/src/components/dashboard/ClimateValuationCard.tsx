"use client";

import React from "react";
import { ValuationResult, formatINR } from "@/lib/api";

interface ClimateValuationCardProps {
  valuation?: ValuationResult | null;
  baseRate?: number;
  areaSqft?: number;
}

export const ClimateValuationCard: React.FC<ClimateValuationCardProps> = ({
  valuation,
  baseRate = 6000,
  areaSqft = 1200,
}) => {
  const baseValue = valuation?.base_value_inr ?? areaSqft * baseRate;
  const climateImpactPercentage = valuation?.total_climate_impact_percentage ?? 18;
  const climateImpactInr =
    valuation?.total_climate_impact_inr ?? Math.round(baseValue * (climateImpactPercentage / 100));
  const adjustedValue = valuation?.adjusted_value_inr ?? baseValue - climateImpactInr;

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        padding: "20px 24px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
        fontFamily: "var(--font-sans)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
      }}
    >
      <div>
        {/* Title */}
        <h3
          style={{
            fontSize: "15px",
            fontWeight: 700,
            color: "#0f172a",
            marginBottom: "16px",
          }}
        >
          Value Estimation
        </h3>

        {/* Base Value & Estimated Impact Rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: "12.5px", color: "#475569", fontWeight: 500 }}>
              Base Property Value
            </span>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
              {formatINR(baseValue)}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: "12.5px", color: "#475569", fontWeight: 500 }}>
              Estimated Climate Impact
            </span>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#dc2626" }}>
              - {climateImpactPercentage.toFixed(0)}% ({formatINR(climateImpactInr)})
            </span>
          </div>
        </div>
      </div>

      {/* Prominent Highlighted Blue Box matching reference mockup */}
      <div
        style={{
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
          borderRadius: "10px",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: "13px", fontWeight: 700, color: "#1d4ed8" }}>
          Climate-Adjusted Value
        </span>
        <span style={{ fontSize: "20px", fontWeight: 800, color: "#1d4ed8", letterSpacing: "-0.5px" }}>
          {formatINR(adjustedValue)}
        </span>
      </div>
    </div>
  );
};
