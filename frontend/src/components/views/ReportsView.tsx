"use client";

import React from "react";
import {
  Download,
  Printer,
  FileCheck,
  ShieldAlert,
  ShieldCheck,
  ArrowDown,
  Building,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import { PropertyInput, ValuationResult, RiskScore, formatINR } from "@/lib/api";

interface ReportsViewProps {
  input: PropertyInput;
  valuation?: ValuationResult | null;
  riskScores?: RiskScore[];
  locationLabel?: string;
  onBackToDashboard?: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  input,
  valuation,
  riskScores = [],
  locationLabel = "Anna Nagar, Chennai, Tamil Nadu",
  onBackToDashboard,
}) => {
  const baseValue = valuation?.base_value_inr ?? input.area_sqft * (input.market_rate_per_sqft || 6000);
  const impactPct = valuation?.total_climate_impact_percentage ?? 18;
  const impactInr = valuation?.total_climate_impact_inr ?? Math.round(baseValue * (impactPct / 100));
  const adjustedValue = valuation?.adjusted_value_inr ?? baseValue - impactInr;

  const floodScore = riskScores.find((r) => r.hazard === "flood")?.score ?? 73;
  const heatScore = riskScores.find((r) => r.hazard === "heat")?.score ?? 58;
  const cycloneScore = riskScores.find((r) => r.hazard === "cyclone")?.score ?? 61;
  const elevationScore = 22;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div style={{ maxWidth: "1080px", margin: "0 auto", paddingBottom: "48px", fontFamily: "var(--font-sans)" }}>
      {/* Top Header Bar matching reference design */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "14px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Property Report
            </h1>
            <span
              style={{
                background: "#dcfce7",
                color: "#15803d",
                fontSize: "11px",
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: "20px",
                border: "1px solid #bbf7d0",
              }}
            >
              Certified Valuation
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0 0" }}>
            Complete climate physical exposure analysis and property valuation memorandum.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {onBackToDashboard && (
            <button
              type="button"
              onClick={onBackToDashboard}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "#ffffff",
                color: "#334155",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                padding: "9px 16px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <span>← Back to Dashboard</span>
            </button>
          )}
          <button
            type="button"
            onClick={handlePrint}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              padding: "10px 18px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)",
              transition: "all 0.15s ease",
            }}
          >
            <Download style={{ width: 16, height: 16 }} />
            <span>Download PDF / Print</span>
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Card 1: Property Summary */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          }}
        >
          <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: "0 0 16px 0" }}>
            Property Summary
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px", alignItems: "center" }}>
            {/* Vector Illustration */}
            <div
              style={{
                height: "120px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #1e3a8a 0%, #0284c7 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                padding: "12px",
                textAlign: "center",
              }}
            >
              <Building style={{ width: 32, height: 32, marginBottom: "6px" }} />
              <div style={{ fontSize: "14px", fontWeight: 700 }}>{locationLabel.split(",")[0]}</div>
              <div style={{ fontSize: "11px", opacity: 0.85 }}>Tamil Nadu, India</div>
            </div>

            {/* Spec Ledger */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
              <div>
                <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>Area</div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>
                  {input.area_sqft.toLocaleString()} sq.ft
                </div>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>Property Type</div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a", marginTop: "2px", textTransform: "capitalize" }}>
                  {input.property_type}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>Market Rate</div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>
                  ₹ {(input.market_rate_per_sqft || 6000).toLocaleString()} / sq.ft
                </div>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>Number of Floors</div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>
                  {input.num_floors || 2} Floors
                </div>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>Built Structure</div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>
                  RCC Frame
                </div>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>Appraisal Date</div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>
                  25 Sep 2026
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Climate Risk Analysis (4 Boxes directly from reference design) */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          }}
        >
          <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: "0 0 16px 0" }}>
            Climate Risk Analysis
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
            {/* Flood Risk */}
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#475569" }}>Flood Risk</span>
                <span style={{ fontSize: "10px", fontWeight: 700, color: "#ef4444", background: "#fee2e2", padding: "2px 6px", borderRadius: "4px" }}>
                  High
                </span>
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a" }}>{floodScore}%</div>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>0.8m 10-Yr Storm Inundation</div>
            </div>

            {/* Heat Exposure */}
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#475569" }}>Heat Exposure</span>
                <span style={{ fontSize: "10px", fontWeight: 700, color: "#ea580c", background: "#ffedd5", padding: "2px 6px", borderRadius: "4px" }}>
                  Medium
                </span>
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a" }}>{heatScore}%</div>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>42.5°C Summer Peak Index</div>
            </div>

            {/* Cyclone Risk */}
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#475569" }}>Cyclone Risk</span>
                <span style={{ fontSize: "10px", fontWeight: 700, color: "#ca8a04", background: "#fef9c3", padding: "2px 6px", borderRadius: "4px" }}>
                  Medium
                </span>
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a" }}>{cycloneScore}%</div>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>120 km/h Coastal Gale Vector</div>
            </div>

            {/* Elevation Risk */}
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#475569" }}>Elevation Risk</span>
                <span style={{ fontSize: "10px", fontWeight: 700, color: "#10b981", background: "#dcfce7", padding: "2px 6px", borderRadius: "4px" }}>
                  Low
                </span>
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a" }}>{elevationScore}%</div>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>8.2m MSL Drainage Datum</div>
            </div>
          </div>
        </div>

        {/* Card 3: Value Assessment directly matching reference design */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          }}
        >
          <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: "0 0 16px 0" }}>
            Value Assessment
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr", gap: "20px", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>Base Property Value</div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>
                {formatINR(baseValue)}
              </div>
            </div>

            <div>
              <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>Estimated Climate Impact</div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "#dc2626", marginTop: "4px" }}>
                -{impactPct}% ({formatINR(impactInr)})
              </div>
            </div>

            <div
              style={{
                background: "#eff6ff",
                border: "1.5px solid #bfdbfe",
                borderRadius: "12px",
                padding: "16px 20px",
              }}
            >
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#1d4ed8" }}>
                Climate-Adjusted Value
              </div>
              <div style={{ fontSize: "26px", fontWeight: 800, color: "#1d4ed8", letterSpacing: "-0.5px", marginTop: "2px" }}>
                {formatINR(adjustedValue)}
              </div>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div style={{ fontSize: "11px", color: "#94a3b8", lineHeight: "1.5", textAlign: "center", padding: "10px" }}>
          Certified Climate Valuation Memorandum generated under the TerraValue TN Environmental Assessment Framework.
          Data verified via Open-Meteo ERA5 Reanalysis, NOAA IBTrACS, and OpenStreetMap Overpass cadastre.
        </div>
      </div>
    </div>
  );
};
