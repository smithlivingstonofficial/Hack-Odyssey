"use client";

import React, { useState } from "react";
import {
  GitCompare,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Building,
  Home,
  MapPin,
} from "lucide-react";
import { formatINR, PropertyInput } from "@/lib/api";

interface ComparisonViewProps {
  onSelectProperty?: (prop: PropertyInput) => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ onSelectProperty }) => {
  const [selectedPropId, setSelectedPropId] = useState<string>("prop-a");

  const properties = [
    {
      id: "prop-a",
      name: "Property A (Anna Nagar Villa)",
      location: "Anna Nagar, Chennai",
      type: "Residential Villa",
      baseValue: 7200000,
      impactPct: 18,
      impactInr: 1296000,
      adjustedValue: 5904000,
      riskLevel: "High Risk",
      riskBadgeColor: "#ef4444",
      riskBadgeBg: "#fee2e2",
      floodRisk: "High (74%)",
      floodColor: "#ef4444",
      heatRisk: "High (68%)",
      heatColor: "#ef4444",
      cycloneRisk: "Medium (61%)",
      cycloneColor: "#f59e0b",
      elevation: "8m MSL (Low)",
      insuranceRisk: "Elevated",
      inputData: {
        address: "Anna Nagar, Chennai, Tamil Nadu",
        latitude: 13.0827,
        longitude: 80.2198,
        property_type: "residential" as const,
        area_sqft: 1200,
        market_rate_per_sqft: 6000,
        building_age: 5,
        num_floors: 2,
        has_basement: false,
        flood_protection: false,
        cool_roof: false,
        storm_resistant: false,
      },
    },
    {
      id: "prop-b",
      name: "Property B (OMR Tech Corridor)",
      location: "Sholinganallur, Chennai",
      type: "Commercial Office",
      baseValue: 7400000,
      impactPct: 7,
      impactInr: 524000,
      adjustedValue: 6876000,
      riskLevel: "Medium Risk",
      riskBadgeColor: "#f59e0b",
      riskBadgeBg: "#fef3c7",
      floodRisk: "Medium (52%)",
      floodColor: "#f59e0b",
      heatRisk: "High (66%)",
      heatColor: "#ef4444",
      cycloneRisk: "Medium (58%)",
      cycloneColor: "#f59e0b",
      elevation: "14m MSL (Moderate)",
      insuranceRisk: "Moderate",
      inputData: {
        address: "OMR IT Corridor, Chennai, Tamil Nadu",
        latitude: 12.9010,
        longitude: 80.2279,
        property_type: "commercial" as const,
        area_sqft: 1400,
        market_rate_per_sqft: 5285,
        building_age: 4,
        num_floors: 3,
        has_basement: false,
        flood_protection: true,
        cool_roof: false,
        storm_resistant: false,
      },
    },
    {
      id: "prop-c",
      name: "Property C (Coimbatore Foothills)",
      location: "Saravanampatti, Coimbatore",
      type: "Independent Home",
      baseValue: 8000000,
      impactPct: 3,
      impactInr: 224000,
      adjustedValue: 7776000,
      riskLevel: "Low Risk",
      riskBadgeColor: "#10b981",
      riskBadgeBg: "#dcfce7",
      floodRisk: "Low (18%)",
      floodColor: "#10b981",
      heatRisk: "Low (32%)",
      heatColor: "#10b981",
      cycloneRisk: "Low (12%)",
      cycloneColor: "#10b981",
      elevation: "410m MSL (Safe)",
      insuranceRisk: "Minimal",
      inputData: {
        address: "Saravanampatti, Coimbatore, Tamil Nadu",
        latitude: 11.0805,
        longitude: 76.9950,
        property_type: "residential" as const,
        area_sqft: 1600,
        market_rate_per_sqft: 5000,
        building_age: 2,
        num_floors: 2,
        has_basement: false,
        flood_protection: true,
        cool_roof: true,
        storm_resistant: true,
      },
    },
  ];

  const parameters = [
    { label: "Base Value", key: "baseValue", format: (v: number) => formatINR(v) },
    { label: "Climate Impact", key: "impactPct", format: (v: number, p: any) => `-${v}% (${formatINR(p.impactInr)})`, isImpact: true },
    { label: "Adjusted Value", key: "adjustedValue", format: (v: number) => formatINR(v), isAdjusted: true },
    { label: "Flood Risk", key: "floodRisk", isBadge: true, colorKey: "floodColor" },
    { label: "Heat Risk", key: "heatRisk", isBadge: true, colorKey: "heatColor" },
    { label: "Cyclone Risk", key: "cycloneRisk", isBadge: true, colorKey: "cycloneColor" },
    { label: "Elevation Datum", key: "elevation" },
    { label: "Underwriting Risk", key: "insuranceRisk" },
  ];

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", paddingBottom: "40px", fontFamily: "var(--font-sans)" }}>
      {/* Header matching reference mockup */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
          Comparison
        </h1>
        <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0 0" }}>
          Compare multiple properties based on physical climate risk and adjusted valuation.
        </p>
      </div>

      {/* 3 Property Cards matching the reference design */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "18px", marginBottom: "28px" }}>
        {properties.map((prop) => {
          const isSelected = selectedPropId === prop.id;
          return (
            <div
              key={prop.id}
              onClick={() => setSelectedPropId(prop.id)}
              style={{
                background: "#ffffff",
                border: isSelected ? "2px solid #2563eb" : "1px solid #e2e8f0",
                borderRadius: "16px",
                padding: "20px",
                boxShadow: isSelected ? "0 4px 16px rgba(37, 99, 235, 0.15)" : "0 1px 3px rgba(0, 0, 0, 0.04)",
                cursor: "pointer",
                transition: "all 0.15s ease",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              {/* Header with Type & Risk Badge */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  {prop.name.split("(")[0].trim()}
                </span>
                <span
                  style={{
                    fontSize: "10.5px",
                    fontWeight: 700,
                    color: prop.riskBadgeColor,
                    background: prop.riskBadgeBg,
                    padding: "2px 8px",
                    borderRadius: "6px",
                  }}
                >
                  {prop.riskLevel}
                </span>
              </div>

              {/* Vector Architectural Card Visual */}
              <div
                style={{
                  height: "80px",
                  borderRadius: "10px",
                  background: prop.id === "prop-a"
                    ? "linear-gradient(135deg, #1e3a8a 0%, #0284c7 100%)"
                    : prop.id === "prop-b"
                    ? "linear-gradient(135deg, #334155 0%, #64748b 100%)"
                    : "linear-gradient(135deg, #064e3b 0%, #10b981 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "14px",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "14px", fontWeight: 800 }}>{prop.location}</div>
                  <div style={{ fontSize: "11px", opacity: 0.85 }}>{prop.type}</div>
                </div>
              </div>

              {/* Value Figures */}
              <div style={{ marginBottom: "14px" }}>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#1d4ed8", lineHeight: "1.2" }}>
                  {formatINR(prop.adjustedValue)}
                </div>
                <div style={{ fontSize: "12px", color: prop.impactPct > 10 ? "#dc2626" : "#f59e0b", fontWeight: 600, marginTop: "2px" }}>
                  (-{prop.impactPct}% Impact)
                </div>
              </div>

              {/* CTA Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSelectProperty) onSelectProperty(prop.inputData);
                }}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: isSelected ? "none" : "1px solid #cbd5e1",
                  background: isSelected ? "#2563eb" : "#ffffff",
                  color: isSelected ? "#ffffff" : "#334155",
                  fontSize: "11.5px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                  transition: "all 0.15s ease",
                }}
              >
                <span>View Details</span>
                <ArrowRight style={{ width: 13, height: 13 }} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Comparison Summary Table directly matching reference design */}
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
          Comparison Summary
        </h2>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ textAlign: "left", padding: "12px 16px", color: "#64748b", fontWeight: 700, width: "25%" }}>
                  Parameter
                </th>
                <th style={{ textAlign: "left", padding: "12px 16px", color: "#0f172a", fontWeight: 800, width: "25%" }}>
                  Property A (Anna Nagar)
                </th>
                <th style={{ textAlign: "left", padding: "12px 16px", color: "#0f172a", fontWeight: 800, width: "25%" }}>
                  Property B (OMR Tech)
                </th>
                <th style={{ textAlign: "left", padding: "12px 16px", color: "#0f172a", fontWeight: 800, width: "25%" }}>
                  Property C (Coimbatore)
                </th>
              </tr>
            </thead>
            <tbody>
              {parameters.map((param, idx) => (
                <tr
                  key={param.label}
                  style={{
                    borderBottom: "1px solid #f1f5f9",
                    background: idx % 2 === 0 ? "#ffffff" : "#f8fafc",
                  }}
                >
                  <td style={{ padding: "14px 16px", fontWeight: 600, color: "#475569" }}>
                    {param.label}
                  </td>
                  {properties.map((prop) => {
                    const rawVal = (prop as any)[param.key];
                    let displayVal: React.ReactNode = rawVal;

                    if (param.format) {
                      displayVal = param.format(rawVal, prop);
                    }

                    if (param.isImpact) {
                      displayVal = (
                        <span style={{ color: prop.impactPct > 10 ? "#dc2626" : prop.impactPct > 5 ? "#d97706" : "#059669", fontWeight: 700 }}>
                          {displayVal}
                        </span>
                      );
                    } else if (param.isAdjusted) {
                      displayVal = (
                        <span style={{ color: "#1d4ed8", fontWeight: 800, fontSize: "14px" }}>
                          {displayVal}
                        </span>
                      );
                    } else if (param.isBadge) {
                      const color = (prop as any)[param.colorKey || ""];
                      displayVal = (
                        <span
                          style={{
                            fontWeight: 700,
                            color: color || "#334155",
                          }}
                        >
                          {rawVal}
                        </span>
                      );
                    }

                    return (
                      <td key={prop.id} style={{ padding: "14px 16px", color: "#1e293b", fontWeight: 600 }}>
                        {displayVal}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
