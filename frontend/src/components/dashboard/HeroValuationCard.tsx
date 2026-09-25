"use client";

import React, { useState } from "react";
import { MapPin, Crosshair, ArrowRight, Loader2, UploadCloud } from "lucide-react";
import { PropertyInput, geocodeAddress } from "@/lib/api";

interface HeroValuationCardProps {
  input: PropertyInput;
  onChangeInput: (updated: Partial<PropertyInput>) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  onSelectCoordinates: (lat: number, lon: number, address?: string) => void;
}

export const HeroValuationCard: React.FC<HeroValuationCardProps> = ({
  input,
  onChangeInput,
  onAnalyze,
  isLoading,
  onSelectCoordinates,
}) => {
  const [activeTab, setActiveTab] = useState<"search" | "upload">("search");
  const [searchQuery, setSearchQuery] = useState(input.address || "");
  const [isLocating, setIsLocating] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLocating(true);
    setSearchError(null);
    try {
      const res = await geocodeAddress(searchQuery);
      onSelectCoordinates(res.latitude, res.longitude, res.display_name);
    } catch (err: any) {
      setSearchError(err.message || "Failed to locate address");
    } finally {
      setIsLocating(false);
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
          onSelectCoordinates(lat, lon, `${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`);
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
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        padding: "26px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "440px",
        fontFamily: "var(--font-sans)",
        boxSizing: "border-box",
      }}
    >
      <div>
        {/* Title & Subtitle */}
        <h1
          style={{
            fontSize: "23px",
            fontWeight: 800,
            color: "#0f172a",
            letterSpacing: "-0.4px",
            lineHeight: "1.25",
            marginBottom: "8px",
          }}
        >
          Find the Climate-Adjusted Value of Any Property
        </h1>
        <p
          style={{
            fontSize: "13px",
            color: "#64748b",
            lineHeight: "1.5",
            marginBottom: "20px",
          }}
        >
          Enter property details to analyze climate risks and get an estimated value.
        </p>

        {/* Segmented Pill Tabs: Search by Location vs Upload Property */}
        <div
          style={{
            display: "inline-flex",
            background: "#f1f5f9",
            padding: "4px",
            borderRadius: "30px",
            marginBottom: "18px",
          }}
        >
          <button
            type="button"
            style={{
              padding: "7px 18px",
              borderRadius: "24px",
              border: "none",
              background: activeTab === "search" ? "#ffffff" : "transparent",
              color: activeTab === "search" ? "#2563eb" : "#64748b",
              fontWeight: 700,
              fontSize: "12px",
              cursor: "pointer",
              boxShadow: activeTab === "search" ? "0 2px 6px rgba(0, 0, 0, 0.06)" : "none",
              transition: "all 0.15s ease",
            }}
            onClick={() => setActiveTab("search")}
          >
            Search by Location
          </button>
          <button
            type="button"
            style={{
              padding: "7px 18px",
              borderRadius: "24px",
              border: "none",
              background: activeTab === "upload" ? "#ffffff" : "transparent",
              color: activeTab === "upload" ? "#2563eb" : "#64748b",
              fontWeight: 700,
              fontSize: "12px",
              cursor: "pointer",
              boxShadow: activeTab === "upload" ? "0 2px 6px rgba(0, 0, 0, 0.06)" : "none",
              transition: "all 0.15s ease",
            }}
            onClick={() => setActiveTab("upload")}
          >
            Upload Property
          </button>
        </div>

        {/* Search Input Box */}
        {activeTab === "search" ? (
          <form onSubmit={handleSearchSubmit} style={{ marginBottom: "18px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                padding: "8px 12px",
                transition: "border-color 0.15s ease",
              }}
            >
              <MapPin style={{ width: 16, height: 16, color: "#94a3b8", marginRight: "8px", flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Enter address, area or pin code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  fontSize: "13px",
                  color: "#1e293b",
                  fontWeight: 500,
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
                  color: "#64748b",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {isLocating ? (
                  <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />
                ) : (
                  <Crosshair style={{ width: 16, height: 16 }} />
                )}
              </button>
            </div>
            {searchError && (
              <div style={{ color: "#ef4444", fontSize: "11px", marginTop: "4px", fontWeight: 600 }}>
                {searchError}
              </div>
            )}
          </form>
        ) : (
          <div
            style={{
              padding: "16px",
              border: "1.5px dashed #cbd5e1",
              borderRadius: "10px",
              textAlign: "center",
              marginBottom: "18px",
              background: "#f8fafc",
            }}
          >
            <UploadCloud style={{ width: 24, height: 24, color: "#2563eb", margin: "0 auto 6px" }} />
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>
              Upload GIS Shapefile, GeoJSON or Registry Deed
            </div>
            <div style={{ fontSize: "10px", color: "#94a3b8" }}>Drag & drop .geojson, .kml or deed file</div>
          </div>
        )}

        {/* 3-Column Inline Specifications Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.2fr 1fr",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          {/* Area */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 700,
                color: "#475569",
                marginBottom: "6px",
              }}
            >
              Area (sq.ft)
            </label>
            <input
              type="number"
              value={input.area_sqft}
              min={100}
              step={50}
              onChange={(e) => onChangeInput({ area_sqft: parseFloat(e.target.value) || 0 })}
              style={{
                width: "100%",
                padding: "8px 10px",
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#0f172a",
                outline: "none",
              }}
            />
          </div>

          {/* Property Type Dropdown */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 700,
                color: "#475569",
                marginBottom: "6px",
              }}
            >
              Property Type
            </label>
            <select
              value={input.property_type}
              onChange={(e) => onChangeInput({ property_type: e.target.value as any })}
              style={{
                width: "100%",
                padding: "8px 10px",
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#0f172a",
                outline: "none",
                cursor: "pointer",
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
                display: "block",
                fontSize: "11px",
                fontWeight: 700,
                color: "#475569",
                marginBottom: "6px",
              }}
            >
              Market Rate (₹/sq.ft)
            </label>
            <input
              type="number"
              value={input.market_rate_per_sqft || 6000}
              min={500}
              step={200}
              onChange={(e) => onChangeInput({ market_rate_per_sqft: parseFloat(e.target.value) || 0 })}
              style={{
                width: "100%",
                padding: "8px 10px",
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#0f172a",
                outline: "none",
              }}
            />
          </div>
        </div>
      </div>

      {/* Full-Width Analyze Property CTA Button */}
      <button
        type="button"
        disabled={isLoading}
        onClick={onAnalyze}
        style={{
          width: "100%",
          padding: "13px 20px",
          background: "#2563eb",
          color: "#ffffff",
          border: "none",
          borderRadius: "10px",
          fontSize: "14px",
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          boxShadow: "0 4px 12px rgba(37, 99, 235, 0.28)",
          transition: "background 0.15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#1d4ed8";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#2563eb";
        }}
      >
        {isLoading ? (
          <>
            <Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} />
            <span>Analyzing Environmental Pipeline...</span>
          </>
        ) : (
          <>
            <span>Analyze Property</span>
            <ArrowRight style={{ width: 16, height: 16 }} />
          </>
        )}
      </button>
    </div>
  );
};
