import React from "react";
import { PropertyInput, resolveTamilNaduLocality, formatINR } from "@/lib/api";
import { Navigation } from "lucide-react";

interface PropertyOverviewCardProps {
  input: PropertyInput;
  locationLabel?: string;
}

export const PropertyOverviewCard: React.FC<PropertyOverviewCardProps> = ({
  input,
  locationLabel = "Anna Nagar, Chennai, Tamil Nadu",
}) => {
  // Check if string looks like raw coordinates (e.g. "9.1528°N", "77.9816°E")
  const isCoord = (str: string) =>
    /^\s*\d+\.\d+\s*°?\s*[NSEW]?/i.test(str) || str.includes("°N") || str.includes("°E");

  let primaryTitle = "Anna Nagar";
  let stateSubtitle = "Chennai, Tamil Nadu";

  const rawLabel = (locationLabel || input.address || "").trim();

  if (isCoord(rawLabel)) {
    // Resolve real-world place name from spatial Tamil Nadu centroids
    const resolved = resolveTamilNaduLocality(input.latitude, input.longitude);
    primaryTitle = resolved.name;
    stateSubtitle = resolved.district;
  } else {
    const parts = rawLabel.split(",");
    primaryTitle = parts[0]?.trim() || "Anna Nagar";
    stateSubtitle = parts.slice(1).join(",").trim() || "Tamil Nadu, India";
  }

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
          Property Overview
        </h3>

        {/* Thumbnail Block with Luxury Modern Villa SVG (Zero External Images) */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
          <div
            style={{
              width: "74px",
              height: "74px",
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid #cbd5e1",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
              flexShrink: 0,
              position: "relative",
              background: "linear-gradient(180deg, #7dd3fc 0%, #bae6fd 50%, #e0f2fe 100%)",
            }}
          >
            {/* Architectural Villa SVG Illustration */}
            <svg
              width="74"
              height="74"
              viewBox="0 0 72 72"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ display: "block" }}
            >
              {/* Sky and distant hill */}
              <path d="M0 46C18 44 48 43 72 45V72H0V46Z" fill="#86efac" fillOpacity="0.4" />
              
              {/* Ground & Grass Lawn */}
              <rect y="50" width="72" height="22" fill="#22c55e" />
              <path d="M0 50C20 49 52 49 72 50V54H0V50Z" fill="#16a34a" />
              <rect x="22" y="52" width="28" height="20" fill="#cbd5e1" opacity="0.6" />

              {/* Main Building Ground Floor (Warm Modern Architecture) */}
              <rect x="14" y="32" width="44" height="20" fill="#f8fafc" stroke="#64748b" strokeWidth="0.75" />
              
              {/* Ground Floor Tinted Glass Windows with Warm Glow */}
              <rect x="17" y="36" width="16" height="15" fill="#0f172a" rx="1" />
              <rect x="18" y="37" width="6.5" height="13" fill="#38bdf8" fillOpacity="0.5" />
              <rect x="25.5" y="37" width="6.5" height="13" fill="#fef08a" fillOpacity="0.4" />
              <line x1="25" y1="36" x2="25" y2="51" stroke="#334155" strokeWidth="0.75" />

              {/* Timber Accent Door & Paneling */}
              <rect x="36" y="37" width="9" height="14" fill="#b45309" rx="0.5" />
              <line x1="39" y1="37" x2="39" y2="51" stroke="#78350f" strokeWidth="0.5" />
              <line x1="42" y1="37" x2="42" y2="51" stroke="#78350f" strokeWidth="0.5" />

              {/* Upper Floor Cantilevered Cube (Minimalist Luxury Villa) */}
              <rect x="10" y="16" width="40" height="17" fill="#ffffff" stroke="#475569" strokeWidth="0.75" />
              <rect x="10" y="16" width="40" height="2" fill="#e2e8f0" />

              {/* Upper Floor Floor-to-Ceiling Ribbon Glass */}
              <rect x="13" y="19" width="34" height="11" fill="#0f172a" rx="1" />
              <rect x="14" y="20" width="15" height="9" fill="#0284c7" fillOpacity="0.6" />
              <rect x="30" y="20" width="16" height="9" fill="#fef08a" fillOpacity="0.45" />
              <line x1="29.5" y1="19" x2="29.5" y2="30" stroke="#334155" strokeWidth="0.75" />
              
              {/* Glass Balcony Railing */}
              <rect x="8" y="29" width="44" height="4" fill="#bae6fd" fillOpacity="0.5" stroke="#94a3b8" strokeWidth="0.5" />

              {/* Modern Flat Overhang Roof */}
              <rect x="8" y="14" width="44" height="2.5" fill="#334155" rx="0.5" />

              {/* Right Side Wing */}
              <rect x="50" y="26" width="12" height="25" fill="#f1f5f9" stroke="#64748b" strokeWidth="0.75" />
              <rect x="52" y="30" width="8" height="7" fill="#1e293b" rx="0.5" />
              <rect x="53" y="31" width="6" height="5" fill="#7dd3fc" fillOpacity="0.5" />

              {/* Architectural Trees & Garden Shrubbery */}
              <circle cx="8" cy="46" r="6" fill="#15803d" />
              <circle cx="5" cy="48" r="4.5" fill="#16a34a" />
              <circle cx="64" cy="47" r="5" fill="#15803d" />
              <circle cx="66" cy="49" r="4" fill="#22c55e" />
            </svg>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "15px",
                fontWeight: 800,
                color: "#0f172a",
                lineHeight: "1.25",
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
                maxWidth: "200px",
              }}
              title={primaryTitle}
            >
              {primaryTitle}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#64748b",
                marginTop: "3px",
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
                maxWidth: "200px",
              }}
              title={stateSubtitle}
            >
              {stateSubtitle}
            </div>
            {/* Real GIS coordinates micro-badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                marginTop: "4px",
                background: "#f1f5f9",
                border: "1px solid #e2e8f0",
                padding: "2px 7px",
                borderRadius: "4px",
                fontSize: "10px",
                color: "#64748b",
                fontWeight: 600,
              }}
            >
              <Navigation style={{ width: 10, height: 10, color: "#2563eb" }} />
              <span>{input.latitude.toFixed(4)}°N, {input.longitude.toFixed(4)}°E</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Column Specifications Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "12px",
          paddingTop: "14px",
          borderTop: "1px solid #f1f5f9",
        }}
      >
        <div>
          <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600 }}>Area</div>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>
            {input.area_sqft.toLocaleString()} sq.ft
          </div>
        </div>
        <div>
          <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600 }}>Property Type</div>
          <div
            style={{
              fontSize: "13px",
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
          <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600 }}>Market Rate</div>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>
            ₹ {(input.market_rate_per_sqft || 6000).toLocaleString()} / sq.ft
          </div>
        </div>
      </div>
    </div>
  );
};
