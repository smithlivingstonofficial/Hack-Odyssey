"use client";

import React from "react";
import { PropertyInput, resolveTamilNaduLocality } from "@/lib/api";
import {
  Navigation,
  Building2,
  Maximize2,
  Coins,
  Mountain,
  ShieldCheck,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";

interface PropertyOverviewCardProps {
  input: PropertyInput;
  locationLabel?: string;
  onEditProperty?: () => void;
}

export const PropertyOverviewCard: React.FC<PropertyOverviewCardProps> = ({
  input,
  locationLabel = "Anna Nagar, Chennai, Tamil Nadu",
  onEditProperty,
}) => {
  // Check if string looks like raw coordinates
  const isCoord = (str: string) =>
    /^\s*\d+\.\d+\s*°?\s*[NSEW]?/i.test(str) || str.includes("°N") || str.includes("°E");

  let primaryTitle = "Anna Nagar";
  let stateSubtitle = "Chennai, Tamil Nadu";

  const rawLabel = (locationLabel || input.address || "").trim();

  if (isCoord(rawLabel)) {
    const resolved = resolveTamilNaduLocality(input.latitude, input.longitude);
    primaryTitle = resolved.name;
    stateSubtitle = resolved.district;
  } else {
    const parts = rawLabel.split(",");
    primaryTitle = parts[0]?.trim() || "Anna Nagar";
    stateSubtitle = parts.slice(1).join(",").trim() || "Tamil Nadu, India";
  }

  // Active mitigations count
  const defensesCount = [
    input.flood_protection,
    input.cool_roof,
    input.storm_resistant,
  ].filter(Boolean).length;

  return (
    <div
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #fbfcfe 100%)",
        border: "1px solid #e2e8f0",
        borderRadius: "18px",
        padding: "18px 20px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02), 0 10px 25px -5px rgba(0, 0, 0, 0.04)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontFamily: "var(--font-sans, -apple-system, BlinkMacSystemFont, sans-serif)",
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
                background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#16a34a",
                boxShadow: "0 1px 2px rgba(22, 163, 74, 0.12)",
                flexShrink: 0,
              }}
            >
              <Building2 size={16} />
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
                Property Overview
              </h3>
              <p style={{ fontSize: "11px", color: "#64748b", margin: "1px 0 0 0", fontWeight: 500 }}>
                Cadastre Asset Identification & Specifications
              </p>
            </div>
          </div>

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "2px 8px",
              borderRadius: "12px",
              fontSize: "10px",
              fontWeight: 700,
              background: "#ecfdf5",
              color: "#059669",
              border: "1px solid #a7f3d0",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#10b981" }} />
            Verified Parcel
          </span>
        </div>

        {/* THUMBNAIL & ASSET PROFILE BLOCK */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "10px",
            background: "#f8fafc",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            marginBottom: "10px",
          }}
        >
          {/* Architectural SVG Illustration */}
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "10px",
              overflow: "hidden",
              border: "1px solid #cbd5e1",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.06)",
              flexShrink: 0,
              position: "relative",
              background: "linear-gradient(180deg, #7dd3fc 0%, #bae6fd 50%, #e0f2fe 100%)",
            }}
          >
            <svg
              width="60"
              height="60"
              viewBox="0 0 72 72"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ display: "block" }}
            >
              <path d="M0 46C18 44 48 43 72 45V72H0V46Z" fill="#86efac" fillOpacity="0.4" />
              <rect y="50" width="72" height="22" fill="#22c55e" />
              <rect x="14" y="32" width="44" height="20" fill="#f8fafc" stroke="#64748b" strokeWidth="0.75" />
              <rect x="17" y="36" width="16" height="15" fill="#0f172a" rx="1" />
              <rect x="18" y="37" width="6.5" height="13" fill="#38bdf8" fillOpacity="0.5" />
              <rect x="25.5" y="37" width="6.5" height="13" fill="#fef08a" fillOpacity="0.4" />
              <rect x="36" y="37" width="9" height="14" fill="#b45309" rx="0.5" />
              <rect x="10" y="16" width="40" height="17" fill="#ffffff" stroke="#475569" strokeWidth="0.75" />
              <rect x="13" y="19" width="34" height="11" fill="#0284c7" rx="1" />
              <rect x="8" y="29" width="44" height="4" fill="#bae6fd" fillOpacity="0.5" stroke="#94a3b8" strokeWidth="0.5" />
              <rect x="8" y="14" width="44" height="2.5" fill="#334155" rx="0.5" />
              <circle cx="8" cy="46" r="6" fill="#15803d" />
              <circle cx="64" cy="47" r="5" fill="#15803d" />
            </svg>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 800,
                color: "#0f172a",
                lineHeight: "1.25",
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
              title={primaryTitle}
            >
              {primaryTitle}
            </div>
            <div
              style={{
                fontSize: "11.5px",
                color: "#64748b",
                marginTop: "2px",
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
              title={stateSubtitle}
            >
              {stateSubtitle}
            </div>

            {/* Badges: Coordinates & Topography */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px", flexWrap: "wrap" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px",
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  padding: "1px 6px",
                  borderRadius: "4px",
                  fontSize: "9.5px",
                  color: "#475569",
                  fontWeight: 600,
                }}
              >
                <Navigation style={{ width: 9, height: 9, color: "#2563eb" }} />
                <span>{input.latitude.toFixed(4)}°N, {input.longitude.toFixed(4)}°E</span>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE CADASTRE & RESILIENCE STRIP */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              padding: "7px 10px",
              background: "#f1f5f9",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Mountain size={13} color="#059669" style={{ flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "9px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Topography</div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap" }}>
                Coastal Basin Plan
              </div>
            </div>
          </div>

          <div
            style={{
              padding: "7px 10px",
              background: defensesCount > 0 ? "#ecfdf5" : "#f8fafc",
              borderRadius: "8px",
              border: `1px solid ${defensesCount > 0 ? "#a7f3d0" : "#e2e8f0"}`,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <ShieldCheck size={13} color={defensesCount > 0 ? "#059669" : "#94a3b8"} style={{ flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "9px", color: defensesCount > 0 ? "#047857" : "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                Defenses
              </div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: defensesCount > 0 ? "#065f46" : "#475569", whiteSpace: "nowrap" }}>
                {defensesCount > 0 ? `${defensesCount} Active Defenses` : "Standard Build"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3-COLUMN SPECIFICATION CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "8px",
          paddingTop: "10px",
          borderTop: "1px solid #f1f5f9",
        }}
      >
        <div
          style={{
            background: "#f8fafc",
            borderRadius: "8px",
            padding: "8px 10px",
            border: "1px solid #f1f5f9",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "#64748b", fontWeight: 600 }}>
            <Maximize2 size={10} color="#2563eb" />
            <span>Area</span>
          </div>
          <div style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a", marginTop: "2px", whiteSpace: "nowrap" }}>
            {input.area_sqft.toLocaleString()}
            <span style={{ fontSize: "10px", fontWeight: 500, color: "#64748b" }}> sq.ft</span>
          </div>
        </div>

        <div
          style={{
            background: "#f8fafc",
            borderRadius: "8px",
            padding: "8px 10px",
            border: "1px solid #f1f5f9",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "#64748b", fontWeight: 600 }}>
            <Building2 size={10} color="#059669" />
            <span>Type</span>
          </div>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 800,
              color: "#0f172a",
              marginTop: "2px",
              textTransform: "capitalize",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {input.property_type}
          </div>
        </div>

        <div
          style={{
            background: "#f8fafc",
            borderRadius: "8px",
            padding: "8px 10px",
            border: "1px solid #f1f5f9",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "#64748b", fontWeight: 600 }}>
            <Coins size={10} color="#d97706" />
            <span>Market Rate</span>
          </div>
          <div style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a", marginTop: "2px", whiteSpace: "nowrap" }}>
            ₹{(input.market_rate_per_sqft || 6000).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};
