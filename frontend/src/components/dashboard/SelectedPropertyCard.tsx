"use client";

import React from "react";
import { Edit2, Eye, Building2, Home, Landmark, Factory } from "lucide-react";
import { PropertyInput } from "@/lib/api";

interface SelectedPropertyCardProps {
  input: PropertyInput;
  locationLabel?: string;
  onEdit?: () => void;
  onViewOnMap?: () => void;
}

export const SelectedPropertyCard: React.FC<SelectedPropertyCardProps> = ({
  input,
  locationLabel = "Anna Nagar, Chennai, Tamil Nadu",
  onEdit,
  onViewOnMap,
}) => {
  const parts = locationLabel.split(",");
  const primaryTitle = parts[0]?.trim() || "Anna Nagar, Chennai";
  const stateSubtitle = parts.slice(1).join(",").trim() || "Tamil Nadu, India";

  const getAssetIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "commercial":
        return <Landmark style={{ width: 24, height: 24, color: "#2563eb" }} />;
      case "apartment":
        return <Building2 style={{ width: 24, height: 24, color: "#2563eb" }} />;
      case "industrial":
        return <Factory style={{ width: 24, height: 24, color: "#2563eb" }} />;
      default:
        return <Home style={{ width: 24, height: 24, color: "#2563eb" }} />;
    }
  };

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        padding: "18px 20px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* Header with Title & Edit link */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "14px",
        }}
      >
        <span style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
          Selected Property
        </span>
        <button
          type="button"
          onClick={onEdit}
          style={{
            background: "transparent",
            border: "none",
            color: "#2563eb",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <Edit2 style={{ width: 12, height: 12 }} />
          <span>Edit</span>
        </button>
      </div>

      {/* Property Details Block (Pure CSS / SVG Vector, zero external images) */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
            border: "1px solid #bfdbfe",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {getAssetIcon(input.property_type)}
        </div>
        <div>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", lineHeight: "1.3" }}>
            {primaryTitle}
          </div>
          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "1px" }}>
            {stateSubtitle}
          </div>
          <button
            type="button"
            onClick={onViewOnMap}
            style={{
              background: "transparent",
              border: "none",
              color: "#2563eb",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              marginTop: "4px",
              padding: 0,
            }}
          >
            <Eye style={{ width: 12, height: 12 }} />
            <span>View on Map</span>
          </button>
        </div>
      </div>

      {/* 3-Column Stats Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1.1fr",
          gap: "8px",
          paddingTop: "12px",
          borderTop: "1px solid #f1f5f9",
        }}
      >
        <div>
          <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 600 }}>Area</div>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>
            {input.area_sqft.toLocaleString()} sq.ft
          </div>
        </div>
        <div>
          <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 600 }}>Type</div>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#0f172a",
              marginTop: "2px",
              textTransform: "capitalize",
            }}
          >
            {input.property_type}
          </div>
        </div>
        <div>
          <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 600 }}>Market Rate</div>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>
            ₹ {(input.market_rate_per_sqft || 6000).toLocaleString()} / sq.ft
          </div>
        </div>
      </div>
    </div>
  );
};
