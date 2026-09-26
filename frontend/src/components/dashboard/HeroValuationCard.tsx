"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin,
  Crosshair,
  ArrowRight,
  Loader2,
  Maximize2,
  Building2,
  Coins,
  Zap,
  Shield,
  SunMedium,
  Wind,
  Navigation,
  Mountain,
  Check,
} from "lucide-react";
import { PropertyInput, geocodeAddress, resolveTamilNaduLocality, classifyTamilNaduTerrain } from "@/lib/api";

interface HeroValuationCardProps {
  input: PropertyInput;
  locationLabel?: string;
  onChangeInput: (updated: Partial<PropertyInput>) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  onSelectCoordinates: (lat: number, lon: number, address?: string) => void;
}

export const HeroValuationCard: React.FC<HeroValuationCardProps> = ({
  input,
  locationLabel,
  onChangeInput,
  onAnalyze,
  isLoading,
  onSelectCoordinates,
}) => {
  const [searchQuery, setSearchQuery] = useState(input.address || "");
  const [isLocating, setIsLocating] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Synchronize input.address with searchQuery when address changes from outside
  useEffect(() => {
    if (input.address && input.address !== searchQuery) {
      setSearchQuery(input.address);
    }
  }, [input.address]);

  // Resolve primary title and locality details for the Property Overview preview banner
  const isCoord = (str: string) =>
    /^\s*\d+\.\d+\s*°?\s*[NSEW]?/i.test(str) || str.includes("°N") || str.includes("°E");

  let primaryTitle = "Tamil Nadu";
  let stateSubtitle = "Tamil Nadu, India";

  const rawLabel = (locationLabel || input.address || searchQuery || "").trim();

  if (isCoord(rawLabel)) {
    const resolved = resolveTamilNaduLocality(input.latitude, input.longitude);
    primaryTitle = resolved.name;
    stateSubtitle = resolved.district;
  } else if (rawLabel) {
    const parts = rawLabel.split(",");
    primaryTitle = parts[0]?.trim() || "Tamil Nadu";
    stateSubtitle = parts.slice(1).join(",").trim() || "Tamil Nadu, India";
  }

  const activeProtectionsCount =
    (input.flood_protection ? 1 : 0) +
    (input.cool_roof ? 1 : 0) +
    (input.storm_resistant ? 1 : 0);
  const protectionStatus =
    activeProtectionsCount === 0 ? "Standard Build" : `${activeProtectionsCount}/3 Protected`;

  // Dynamic terrain classification based on coordinates & region
  const terrainLabel = classifyTamilNaduTerrain(input.latitude, input.longitude);

  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLocating(true);
    setSearchError(null);
    try {
      const res = await geocodeAddress(searchQuery.trim());
      const label = res.display_name || searchQuery.trim();
      setSearchQuery(label);
      onChangeInput({
        address: label,
        latitude: res.latitude,
        longitude: res.longitude,
      });
      onSelectCoordinates(res.latitude, res.longitude, label);
    } catch (err: any) {
      setSearchError(err.message || "Failed to locate address");
    } finally {
      setIsLocating(false);
    }
  };

  const handleAnalyzeClick = async () => {
    if (searchQuery.trim() && searchQuery.trim().toLowerCase() !== (input.address || "").toLowerCase()) {
      setIsLocating(true);
      try {
        const res = await geocodeAddress(searchQuery.trim());
        const label = res.display_name || searchQuery.trim();
        setSearchQuery(label);
        onChangeInput({
          address: label,
          latitude: res.latitude,
          longitude: res.longitude,
        });
        onSelectCoordinates(res.latitude, res.longitude, label);
      } catch (err) {
        console.warn("Auto-geocoding fallback on analyze:", err);
        onAnalyze();
      } finally {
        setIsLocating(false);
      }
    } else {
      onAnalyze();
    }
  };

  const handleGpsCurrentLocation = () => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const label = `${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`;
          setSearchQuery(label);
          onChangeInput({
            address: label,
            latitude: lat,
            longitude: lon,
          });
          onSelectCoordinates(lat, lon, label);
        },
        () => {
          setIsLocating(false);
          setSearchError("Geolocation access was declined or timed out.");
        },
        { timeout: 8000 }
      );
    }
  };

  return (
    <div
      style={{
        background: "linear-gradient(155deg, #ffffff 0%, #f8fbff 55%, #f1f6ff 100%)",
        border: "1px solid #dbe5f2",
        borderRadius: "18px",
        padding: "14px 14px",
        boxShadow: "0 2px 4px rgba(15, 23, 42, 0.03), 0 16px 30px -12px rgba(37, 99, 235, 0.14)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        minHeight: "480px",
        fontFamily: "var(--font-sans, -apple-system, BlinkMacSystemFont, sans-serif)",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      <div>
        {/* HEADER: TITLE + VERIFIED BADGE */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "9px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <div
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "7px",
                background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#1d4ed8",
                boxShadow: "0 1px 2px rgba(29, 78, 216, 0.12)",
                flexShrink: 0,
              }}
            >
              <Building2 size={15} />
            </div>
            <div>
              <h2
                style={{
                  fontSize: "15px",
                  fontWeight: 800,
                  color: "#0f172a",
                  letterSpacing: "-0.2px",
                  lineHeight: "1.2",
                  margin: 0,
                }}
              >
                Estimate Property Value
              </h2>
              <p
                style={{
                  fontSize: "10.5px",
                  color: "#64748b",
                  margin: "1px 0 0 0",
                  fontWeight: 500,
                }}
              >
                Location & Weather-Adjusted Valuation
              </p>
            </div>
          </div>

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "2.5px 7px",
              borderRadius: "10px",
              fontSize: "10px",
              fontWeight: 700,
              background: "#ecfdf5",
              color: "#059669",
              border: "1px solid #a7f3d0",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#10b981" }} />
            Verified
          </span>
        </div>

        {/* SEARCH BOX */}
        <div style={{ marginBottom: "10px" }}>
          <form onSubmit={handleSearchSubmit}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#ffffff",
                border: "1px solid #bfd2ec",
                borderRadius: "10px",
                padding: "5px 7px 5px 11px",
                boxShadow: "0 2px 8px rgba(37, 99, 235, 0.06)",
              }}
            >
              <MapPin style={{ width: 15, height: 15, color: "#2563eb", marginRight: "7px", flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search address or area in Tamil Nadu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  fontSize: "12.5px",
                  color: "#0f172a",
                  fontWeight: 600,
                  background: "transparent",
                }}
              />
              <button
                type="button"
                title="Detect GPS location"
                onClick={handleGpsCurrentLocation}
                disabled={isLocating}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  marginRight: "4px",
                }}
              >
                {isLocating ? (
                  <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
                ) : (
                  <Crosshair style={{ width: 14, height: 14 }} />
                )}
              </button>

              <button
                type="submit"
                disabled={isLocating}
                style={{
                  padding: "6px 14px",
                  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "7px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(37, 99, 235, 0.25)",
                  flexShrink: 0,
                }}
              >
                {isLocating ? "..." : "Search"}
              </button>
            </div>
            {searchError && (
              <div style={{ color: "#ef4444", fontSize: "11px", marginTop: "3px", fontWeight: 600 }}>
                {searchError}
              </div>
            )}
          </form>
        </div>

        {/* COMBINED PROPERTY OVERVIEW PREVIEW BANNER */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 10px",
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "10px",
            border: "1px solid #dbe5f2",
            marginBottom: "10px",
            boxShadow: "0 1px 3px rgba(15, 23, 42, 0.02)",
          }}
        >
          {/* Architectural SVG Illustration Thumbnail */}
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "8px",
              overflow: "hidden",
              border: "1px solid #cbd5e1",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
              flexShrink: 0,
              background: "linear-gradient(180deg, #7dd3fc 0%, #bae6fd 50%, #e0f2fe 100%)",
            }}
          >
            <svg width="44" height="44" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                fontSize: "13.5px",
                fontWeight: 800,
                color: "#0f172a",
                lineHeight: "1.2",
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
                fontSize: "11px",
                color: "#64748b",
                marginTop: "1px",
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
              title={stateSubtitle}
            >
              {stateSubtitle}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "3px", flexWrap: "wrap" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px",
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  padding: "1px 5px",
                  borderRadius: "4px",
                  fontSize: "9.5px",
                  color: "#475569",
                  fontWeight: 600,
                }}
              >
                <Navigation style={{ width: 8, height: 8, color: "#2563eb" }} />
                <span>{input.latitude.toFixed(4)}°N, {input.longitude.toFixed(4)}°E</span>
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px",
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  padding: "1px 5px",
                  borderRadius: "4px",
                  fontSize: "9.5px",
                  color: "#166534",
                  fontWeight: 600,
                }}
              >
                <Mountain size={9} color="#16a34a" />
                <span>{terrainLabel}</span>
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px",
                  background: activeProtectionsCount > 0 ? "#eff6ff" : "#f8fafc",
                  border: activeProtectionsCount > 0 ? "1px solid #bfdbfe" : "1px solid #e2e8f0",
                  padding: "1px 5px",
                  borderRadius: "4px",
                  fontSize: "9.5px",
                  color: activeProtectionsCount > 0 ? "#1d4ed8" : "#64748b",
                  fontWeight: 600,
                }}
              >
                <Shield size={9} color={activeProtectionsCount > 0 ? "#2563eb" : "#64748b"} />
                <span>{protectionStatus}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3-COLUMN SPECIFICATION INPUTS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "7px",
            marginBottom: "9px",
          }}
        >
          {/* Area */}
          <div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "3px",
                fontSize: "10px",
                fontWeight: 700,
                color: "#475569",
                marginBottom: "3px",
              }}
            >
              <Maximize2 size={10} color="#2563eb" />
              <span>Area (sq.ft)</span>
            </label>
            <input
              type="number"
              value={input.area_sqft}
              min={100}
              step={50}
              onChange={(e) => onChangeInput({ area_sqft: parseFloat(e.target.value) || 0 })}
              style={{
                width: "100%",
                padding: "5px 6px",
                background: "#ffffff",
                border: "1px solid #c8d8ea",
                borderRadius: "7px",
                fontSize: "12px",
                fontWeight: 700,
                color: "#0f172a",
                outline: "none",
                boxSizing: "border-box",
                height: "34px",
              }}
            />
          </div>

          {/* Property Type Dropdown */}
          <div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "3px",
                fontSize: "10px",
                fontWeight: 700,
                color: "#475569",
                marginBottom: "3px",
              }}
            >
              <Building2 size={10} color="#059669" />
              <span>Type</span>
            </label>
            <select
              value={input.property_type}
              onChange={(e) => onChangeInput({ property_type: e.target.value as any })}
              style={{
                width: "100%",
                padding: "5px 4px",
                background: "#ffffff",
                border: "1px solid #c8d8ea",
                borderRadius: "7px",
                fontSize: "11.5px",
                fontWeight: 700,
                color: "#0f172a",
                outline: "none",
                cursor: "pointer",
                boxSizing: "border-box",
                height: "34px",
              }}
            >
              <option value="residential">Residential</option>
              <option value="apartment">Apartment</option>
              <option value="commercial">Commercial</option>
              <option value="industrial">Industrial</option>
            </select>
          </div>

          {/* Market Rate */}
          <div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "3px",
                fontSize: "10px",
                fontWeight: 700,
                color: "#475569",
                marginBottom: "3px",
              }}
            >
              <Coins size={10} color="#d97706" />
              <span>Rate (₹/sq.ft)</span>
            </label>
            <input
              type="number"
              value={input.market_rate_per_sqft || 6000}
              min={500}
              step={100}
              onChange={(e) => onChangeInput({ market_rate_per_sqft: parseFloat(e.target.value) || 0 })}
              style={{
                width: "100%",
                padding: "5px 6px",
                background: "#ffffff",
                border: "1px solid #c8d8ea",
                borderRadius: "7px",
                fontSize: "12px",
                fontWeight: 700,
                color: "#0f172a",
                outline: "none",
                boxSizing: "border-box",
                height: "34px",
              }}
            />
          </div>
        </div>

        {/* BUILDING DETAILS & PROTECTION FEATURES */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.9)",
            border: "1px solid #d9e5f3",
            borderRadius: "10px",
            padding: "8px 9px",
            marginBottom: "9px",
            boxShadow: "0 1px 2px rgba(15, 23, 42, 0.02)",
          }}
        >
          {/* Header Row: Title + Specs */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "9.5px", fontWeight: 800, color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.02em" }}>
              Building Protections
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ fontSize: "9.5px", color: "#475569", fontWeight: 700, background: "#f1f5f9", padding: "1px 5px", borderRadius: "4px" }}>
                {input.num_floors || 2} Floors
              </span>
              <span style={{ fontSize: "9.5px", color: "#475569", fontWeight: 700, background: "#f1f5f9", padding: "1px 5px", borderRadius: "4px" }}>
                {input.building_age || 5}y Age
              </span>
            </div>
          </div>

          {/* Interactive Defense Toggles */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "5px" }}>
            {/* Flood Protection */}
            <button
              type="button"
              onClick={() => onChangeInput({ flood_protection: !input.flood_protection })}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "5px 4px",
                borderRadius: "6px",
                border: input.flood_protection ? "1.5px solid #2563eb" : "1px solid #cbd5e1",
                background: input.flood_protection ? "#eff6ff" : "#ffffff",
                color: input.flood_protection ? "#1d4ed8" : "#475569",
                fontSize: "10px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "3px", minWidth: 0 }}>
                <Shield size={11} color={input.flood_protection ? "#2563eb" : "#64748b"} style={{ flexShrink: 0 }} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Raised Grnd</span>
              </div>
              {input.flood_protection && <Check size={10} color="#2563eb" strokeWidth={3} style={{ flexShrink: 0 }} />}
            </button>

            {/* Cool Roof */}
            <button
              type="button"
              onClick={() => onChangeInput({ cool_roof: !input.cool_roof })}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "5px 4px",
                borderRadius: "6px",
                border: input.cool_roof ? "1.5px solid #ea580c" : "1px solid #cbd5e1",
                background: input.cool_roof ? "#fff7ed" : "#ffffff",
                color: input.cool_roof ? "#c2410c" : "#475569",
                fontSize: "10px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "3px", minWidth: 0 }}>
                <SunMedium size={11} color={input.cool_roof ? "#ea580c" : "#64748b"} style={{ flexShrink: 0 }} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Cool Roof</span>
              </div>
              {input.cool_roof && <Check size={10} color="#ea580c" strokeWidth={3} style={{ flexShrink: 0 }} />}
            </button>

            {/* Storm Resistant */}
            <button
              type="button"
              onClick={() => onChangeInput({ storm_resistant: !input.storm_resistant })}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "5px 4px",
                borderRadius: "6px",
                border: input.storm_resistant ? "1.5px solid #ca8a04" : "1px solid #cbd5e1",
                background: input.storm_resistant ? "#fefce8" : "#ffffff",
                color: input.storm_resistant ? "#854d0e" : "#475569",
                fontSize: "10px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "3px", minWidth: 0 }}>
                <Wind size={11} color={input.storm_resistant ? "#ca8a04" : "#64748b"} style={{ flexShrink: 0 }} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Storm Ties</span>
              </div>
              {input.storm_resistant && <Check size={10} color="#ca8a04" strokeWidth={3} style={{ flexShrink: 0 }} />}
            </button>
          </div>
        </div>
      </div>

      {/* CTA BUTTON */}
      <button
        type="button"
        onClick={handleAnalyzeClick}
        disabled={isLoading}
        style={{
          width: "100%",
          padding: "10px 14px",
          background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
          color: "#ffffff",
          border: "none",
          borderRadius: "9px",
          fontSize: "13px",
          fontWeight: 700,
          cursor: isLoading ? "not-allowed" : "pointer",
          boxShadow: "0 4px 14px rgba(37, 99, 235, 0.28), inset 0 1px 0 rgba(255,255,255,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "7px",
          transition: "all 0.15s ease",
        }}
      >
        {isLoading ? (
          <>
            <Loader2 style={{ width: 15, height: 15, animation: "spin 1s linear infinite" }} />
            <span>Calculating value...</span>
          </>
        ) : (
          <>
            <Zap size={14} />
            <span>Calculate Property Value</span>
            <ArrowRight size={14} />
          </>
        )}
      </button>
    </div>
  );
};
