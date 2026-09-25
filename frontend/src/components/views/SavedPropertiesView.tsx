"use client";

import React, { useState } from "react";
import {
  Bookmark,
  MapPin,
  TrendingDown,
  Layers,
  ArrowRight,
  GitCompare,
  Trash2,
  Plus,
  Building,
  Home,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { PropertyInput, formatINR } from "@/lib/api";

interface SavedPropertyItem {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  propertyType: string;
  areaSqft: number;
  marketRate: number;
  baseValue: number;
  impactPct: number;
  adjustedValue: number;
  riskCategory: "High Risk" | "Medium Risk" | "Low Risk";
  floodScore: number;
  heatScore: number;
  cycloneScore: number;
  dateSaved: string;
}

interface SavedPropertiesViewProps {
  onSelectProperty: (property: PropertyInput) => void;
  onViewOnMap: (lat: number, lon: number, address: string) => void;
  onCompare: () => void;
  onNewAssessment: () => void;
}

export const SavedPropertiesView: React.FC<SavedPropertiesViewProps> = ({
  onSelectProperty,
  onViewOnMap,
  onCompare,
  onNewAssessment,
}) => {
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [properties, setProperties] = useState<SavedPropertyItem[]>([
    {
      id: "prop-1",
      name: "Anna Nagar Executive Residence",
      address: "2nd Avenue, Anna Nagar, Chennai, Tamil Nadu",
      latitude: 13.0827,
      longitude: 80.2198,
      propertyType: "residential",
      areaSqft: 1200,
      marketRate: 6000,
      baseValue: 7200000,
      impactPct: 10,
      adjustedValue: 6480000,
      riskCategory: "Medium Risk",
      floodScore: 68,
      heatScore: 58,
      cycloneScore: 61,
      dateSaved: "24 Sep 2026",
    },
    {
      id: "prop-2",
      name: "OMR IT Tech Park Suite",
      address: "OMR IT Expressway, Sholinganallur, Chennai, Tamil Nadu",
      latitude: 12.9010,
      longitude: 80.2279,
      propertyType: "commercial",
      areaSqft: 2100,
      marketRate: 6900,
      baseValue: 14490000,
      impactPct: 13,
      adjustedValue: 12606300,
      riskCategory: "Medium Risk",
      floodScore: 74,
      heatScore: 52,
      cycloneScore: 65,
      dateSaved: "22 Sep 2026",
    },
    {
      id: "prop-3",
      name: "Marina Coastal Heritage Bungalow",
      address: "Kamarajar Salai, Triplicane, Chennai, Tamil Nadu",
      latitude: 13.0500,
      longitude: 80.2824,
      propertyType: "residential",
      areaSqft: 1800,
      marketRate: 15500,
      baseValue: 27900000,
      impactPct: 20,
      adjustedValue: 22320000,
      riskCategory: "High Risk",
      floodScore: 88,
      heatScore: 64,
      cycloneScore: 78,
      dateSaved: "20 Sep 2026",
    },
  ]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProperties((prev) => prev.filter((p) => p.id !== id));
  };

  const filtered = properties.filter((p) => {
    if (filter === "high") return p.riskCategory === "High Risk";
    if (filter === "medium") return p.riskCategory === "Medium Risk";
    if (filter === "low") return p.riskCategory === "Low Risk";
    return true;
  });

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", paddingBottom: "40px" }}>
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Saved Properties
            </h1>
            <span
              style={{
                background: "#eff6ff",
                color: "#2563eb",
                fontSize: "12px",
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: "20px",
                border: "1px solid #bfdbfe",
              }}
            >
              {properties.length} Properties
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0 0" }}>
            Track and compare your appraised real estate portfolio across Tamil Nadu.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Risk Filter Pills */}
          <div
            style={{
              display: "inline-flex",
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              padding: "3px",
            }}
          >
            {(["all", "high", "medium", "low"] as const).map((lvl) => {
              const isActive = filter === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setFilter(lvl)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "7px",
                    border: "none",
                    background: isActive ? "#2563eb" : "transparent",
                    color: isActive ? "#ffffff" : "#475569",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "capitalize",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {lvl === "all" ? "All (3)" : lvl}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onNewAssessment}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              padding: "8px 16px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)",
            }}
          >
            <Plus style={{ width: 15, height: 15 }} />
            <span>New Property</span>
          </button>
        </div>
      </div>

      {/* Property Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px" }}>
        {filtered.map((prop) => {
          const isHigh = prop.riskCategory === "High Risk";
          return (
            <div
              key={prop.id}
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.04)";
              }}
            >
              {/* Header Visual Bar with Vector Building SVG */}
              <div
                style={{
                  height: "110px",
                  background: isHigh
                    ? "linear-gradient(135deg, #7f1d1d 0%, #b91c1c 50%, #ea580c 100%)"
                    : "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0284c7 100%)",
                  position: "relative",
                  padding: "16px",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                }}
              >
                {/* Status Badges */}
                <div style={{ position: "absolute", top: "12px", left: "14px", display: "flex", gap: "6px" }}>
                  <span
                    style={{
                      background: "rgba(15, 23, 42, 0.75)",
                      backdropFilter: "blur(6px)",
                      color: "#ffffff",
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: "6px",
                      textTransform: "uppercase",
                    }}
                  >
                    {prop.propertyType}
                  </span>
                  <span
                    style={{
                      background: isHigh ? "#ef4444" : "#f59e0b",
                      color: "#ffffff",
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: "6px",
                    }}
                  >
                    {prop.riskCategory}
                  </span>
                </div>

                {/* Delete Button */}
                <button
                  type="button"
                  title="Remove from saved"
                  onClick={(e) => handleDelete(prop.id, e)}
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "14px",
                    background: "rgba(0, 0, 0, 0.4)",
                    border: "none",
                    color: "#ffffff",
                    borderRadius: "6px",
                    width: "28px",
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <Trash2 style={{ width: 14, height: 14 }} />
                </button>

                {/* Property Name */}
                <div style={{ zIndex: 2 }}>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#ffffff", lineHeight: "1.2" }}>
                    {prop.name}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "rgba(255, 255, 255, 0.8)", fontSize: "11px", marginTop: "3px" }}>
                    <MapPin style={{ width: 11, height: 11 }} />
                    <span style={{ maxWidth: "260px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {prop.address}
                    </span>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "14px", flex: 1, justifyContent: "space-between" }}>
                {/* Valuation Ledger */}
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "12px 14px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>Base Market Value:</span>
                    <strong style={{ fontSize: "12px", color: "#0f172a" }}>{formatINR(prop.baseValue)}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>Climate Haircut:</span>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#dc2626" }}>
                      -{prop.impactPct}% ({formatINR(prop.baseValue * (prop.impactPct / 100))})
                    </span>
                  </div>
                  <div
                    style={{
                      borderTop: "1px dashed #cbd5e1",
                      paddingTop: "6px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#1d4ed8" }}>
                      Adjusted Value:
                    </span>
                    <strong style={{ fontSize: "16px", fontWeight: 800, color: "#1d4ed8" }}>
                      {formatINR(prop.adjustedValue)}
                    </strong>
                  </div>
                </div>

                {/* Micro Hazard Meters */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", textAlign: "center" }}>
                  <div style={{ background: "#eff6ff", borderRadius: "8px", padding: "6px 4px" }}>
                    <div style={{ fontSize: "9.5px", color: "#2563eb", fontWeight: 700 }}>Flood</div>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#1e40af" }}>{prop.floodScore}</div>
                  </div>
                  <div style={{ background: "#fff7ed", borderRadius: "8px", padding: "6px 4px" }}>
                    <div style={{ fontSize: "9.5px", color: "#ea580c", fontWeight: 700 }}>Heat</div>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#9a3412" }}>{prop.heatScore}</div>
                  </div>
                  <div style={{ background: "#fefce8", borderRadius: "8px", padding: "6px 4px" }}>
                    <div style={{ fontSize: "9.5px", color: "#ca8a04", fontWeight: 700 }}>Cyclone</div>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#854d0e" }}>{prop.cycloneScore}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", paddingTop: "4px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectProperty({
                        address: prop.address,
                        latitude: prop.latitude,
                        longitude: prop.longitude,
                        property_type: prop.propertyType as any,
                        area_sqft: prop.areaSqft,
                        market_rate_per_sqft: prop.marketRate,
                        building_age: 5,
                        num_floors: 2,
                        has_basement: false,
                        flood_protection: false,
                        cool_roof: false,
                        storm_resistant: false,
                      });
                    }}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "none",
                      background: "#2563eb",
                      color: "#ffffff",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                    }}
                  >
                    <span>⚡ Analyze</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onViewOnMap(prop.latitude, prop.longitude, prop.address)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      color: "#334155",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                    }}
                  >
                    <span>👁 View Map</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
