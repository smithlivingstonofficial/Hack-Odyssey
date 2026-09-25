"use client";

import React from "react";
import { ValuationResult, formatINR } from "@/lib/api";
import {
  TrendingDown,
  ShieldCheck,
  Coins,
  ArrowDownRight,
  ChevronRight,
  Info,
} from "lucide-react";

interface ClimateValuationCardProps {
  valuation?: ValuationResult | null;
  baseRate?: number;
  areaSqft?: number;
  onOpenReport?: () => void;
}

export const ClimateValuationCard: React.FC<ClimateValuationCardProps> = ({
  valuation,
  baseRate = 6000,
  areaSqft = 1200,
  onOpenReport,
}) => {
  const baseValue = valuation?.base_value_inr ?? areaSqft * baseRate;
  const climateImpactPercentage = valuation?.total_climate_impact_percentage ?? 2.0;
  const climateImpactInr =
    valuation?.total_climate_impact_inr ?? Math.round(baseValue * (climateImpactPercentage / 100));
  const adjustedValue = valuation?.adjusted_value_inr ?? baseValue - climateImpactInr;

  const valueRetainedPct = Math.max(0, Math.min(100, 100 - climateImpactPercentage));

  // Individual hazard impacts
  const floodPct = valuation?.flood_impact?.impact_percentage ?? 1.2;
  const heatPct = valuation?.heat_impact?.impact_percentage ?? 0.5;
  const cyclonePct = valuation?.cyclone_impact?.impact_percentage ?? 0.3;

  return (
    <div
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #fbfcfe 100%)",
        border: "1px solid #e2e8f0",
        borderRadius: "18px",
        padding: "18px 20px",
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
        {/* HEADER SECTION */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#1d4ed8",
                boxShadow: "0 1px 2px rgba(29, 78, 216, 0.12)",
                flexShrink: 0,
              }}
            >
              <Coins size={16} />
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
                Value Estimation
              </h3>
              <p style={{ fontSize: "11px", color: "#64748b", margin: "1px 0 0 0", fontWeight: 500 }}>
                Climate Discount & Financial Haircut
              </p>
            </div>
          </div>

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "3px",
              padding: "2px 8px",
              borderRadius: "12px",
              fontSize: "10px",
              fontWeight: 700,
              background: "#fff1f2",
              color: "#e11d48",
              border: "1px solid #fecdd3",
              whiteSpace: "nowrap",
            }}
          >
            <ArrowDownRight size={11} strokeWidth={2.5} />
            -{climateImpactPercentage.toFixed(1)}% Discount
          </span>
        </div>

        {/* FINANCIAL WATERFALL METRICS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
          {/* Base Property Value */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "6px 10px",
              background: "#f8fafc",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
            }}
          >
            <div>
              <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>Base Market Value</div>
              <div style={{ fontSize: "9.5px", color: "#94a3b8" }}>
                {areaSqft.toLocaleString()} sq.ft @ ₹{baseRate.toLocaleString()}/sq.ft
              </div>
            </div>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>
              {formatINR(baseValue)}
            </div>
          </div>

          {/* Climate Discount Haircut */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "6px 10px",
              background: "#fef2f2",
              borderRadius: "8px",
              border: "1px solid #fee2e2",
            }}
          >
            <div>
              <div style={{ fontSize: "11px", color: "#991b1b", fontWeight: 700 }}>
                Estimated Climate Impact
              </div>
              <div style={{ fontSize: "9.5px", color: "#b91c1c", display: "flex", gap: "6px", marginTop: "1px" }}>
                <span>Flood: -{floodPct.toFixed(1)}%</span>
                <span>•</span>
                <span>Heat: -{heatPct.toFixed(1)}%</span>
                <span>•</span>
                <span>Wind: -{cyclonePct.toFixed(1)}%</span>
              </div>
            </div>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#dc2626" }}>
              -{climateImpactPercentage.toFixed(1)}% ({formatINR(climateImpactInr)})
            </div>
          </div>
        </div>

        {/* VALUE RETENTION PROGRESS BAR */}
        <div style={{ marginBottom: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontWeight: 600, marginBottom: "4px" }}>
            <span style={{ color: "#059669", display: "flex", alignItems: "center", gap: "3px" }}>
              <ShieldCheck size={11} />
              <span>{valueRetainedPct.toFixed(1)}% Capital Retained</span>
            </span>
            <span style={{ color: "#dc2626" }}>-{climateImpactPercentage.toFixed(1)}% Risk Haircut</span>
          </div>
          <div style={{ height: "6px", background: "#fee2e2", borderRadius: "3px", overflow: "hidden", display: "flex" }}>
            <div
              style={{
                width: `${valueRetainedPct}%`,
                height: "100%",
                background: "linear-gradient(90deg, #10b981, #059669)",
                borderRadius: "3px 0 0 3px",
              }}
            />
            <div
              style={{
                width: `${climateImpactPercentage}%`,
                height: "100%",
                background: "#ef4444",
                borderRadius: "0 3px 3px 0",
              }}
            />
          </div>
        </div>
      </div>

      {/* PROMINENT CLIMATE-ADJUSTED HIGHLIGHT CARD */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%)",
          borderRadius: "12px",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "#ffffff",
          boxShadow: "0 4px 14px rgba(30, 64, 175, 0.25)",
        }}
      >
        <div>
          <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#bfdbfe", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Climate-Adjusted Value
          </div>
          <div style={{ fontSize: "9.5px", color: "#93c5fd", marginTop: "1px" }}>
            NPV Discounted under 30-Yr Hazards
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "21px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.5px", lineHeight: "1" }}>
            {formatINR(adjustedValue)}
          </div>
        </div>
      </div>
    </div>
  );
};
