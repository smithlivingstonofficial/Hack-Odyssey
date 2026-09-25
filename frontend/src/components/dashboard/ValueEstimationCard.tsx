"use client";

import React from "react";
import { ValuationResult, formatINR } from "@/lib/api";

interface ValueEstimationCardProps {
  valuation?: ValuationResult | null;
  baseRate?: number;
  areaSqft?: number;
}

export const ValueEstimationCard: React.FC<ValueEstimationCardProps> = ({
  valuation,
  baseRate = 6000,
  areaSqft = 1200,
}) => {
  // If no analysis run yet, show standard initial calculation
  const baseValue = valuation?.base_value_inr ?? areaSqft * baseRate;
  const climateImpactPercentage = valuation?.total_climate_impact_percentage ?? 18;
  const climateImpactInr = valuation?.total_climate_impact_inr ?? Math.round(baseValue * (climateImpactPercentage / 100));
  const adjustedValue = valuation?.adjusted_value_inr ?? (baseValue - climateImpactInr);

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
      <div>
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

        {/* Base Property Value Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}
        >
          <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 500 }}>
            Base Property Value
          </span>
          <span style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
            {formatINR(baseValue)}
          </span>
        </div>

        {/* Estimated Climate Impact Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "18px",
          }}
        >
          <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 500 }}>
            Estimated Climate Impact
          </span>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#dc2626" }}>
            - {climateImpactPercentage.toFixed(0)}% ({formatINR(climateImpactInr)})
          </span>
        </div>
      </div>

      {/* Prominent Highlighted Blue Box */}
      <div
        style={{
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
          borderRadius: "12px",
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: "14px",
            fontWeight: 700,
            color: "#1d4ed8",
          }}
        >
          Climate-Adjusted Value
        </span>
        <span
          style={{
            fontSize: "24px",
            fontWeight: 800,
            color: "#1d4ed8",
            letterSpacing: "-0.5px",
          }}
        >
          {formatINR(adjustedValue)}
        </span>
      </div>
    </div>
  );
};
