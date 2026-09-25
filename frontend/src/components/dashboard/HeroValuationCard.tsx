"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Crosshair, ArrowRight, Loader2, UploadCloud, Search } from "lucide-react";
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

  // Synchronize input.address with searchQuery when address changes from outside
  useEffect(() => {
    if (input.address && input.address !== searchQuery) {
      setSearchQuery(input.address);
    }
  }, [input.address]);

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
                borderRadius: "30px",
                padding: "4px 6px 4px 14px",
                transition: "border-color 0.15s ease",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
              }}
            >
              <MapPin style={{ width: 16, height: 16, color: "#94a3b8", marginRight: "8px", flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Enter address, city or pin code (e.g. Madurai, Anna Nagar)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  fontSize: "13px",
                  color: "#1e293b",
                  fontWeight: 500,
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
                  padding: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  marginRight: "4px",
                  transition: "color 0.15s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#2563eb"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#94a3b8"; }}
              >
                {isLocating ? (
                  <Loader2 style={{ width: 15, height: 15, animation: "spin 1s linear infinite" }} />
                ) : (
                  <Crosshair style={{ width: 15, height: 15 }} />
                )}
              </button>

              {/* Prominent Blue Search CTA button matching the navbar style */}
              <button
                type="submit"
                disabled={isLocating}
                style={{
                  padding: "7px 18px",
                  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(37, 99, 235, 0.3)",
                  transition: "all 0.15s ease",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.4)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 2px 6px rgba(37, 99, 235, 0.3)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {isLocating ? "Searching..." : "Search"}
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
              padding: "12px 14px",
              border: "1.5px dashed #3b82f6",
              borderRadius: "10px",
              textAlign: "center",
              marginBottom: "16px",
              background: "#eff6ff",
              position: "relative",
            }}
          >
            <input
              type="file"
              id="geojson-upload-input"
              accept=".geojson,.json,.kml"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    try {
                      const data = JSON.parse(event.target?.result as string);
                      // Check for feature or coordinates
                      if (data.type === "FeatureCollection" && data.features?.[0]) {
                        const feat = data.features[0];
                        const coords = feat.geometry?.coordinates;
                        if (coords && coords.length >= 2) {
                          const lon = coords[0];
                          const lat = coords[1];
                          const props = feat.properties || {};
                          const area = props.area_sqft || props.area || 1800;
                          const name = props.name || file.name.replace(/\.[^/.]+$/, "");
                          onChangeInput({
                            area_sqft: area,
                            address: `${name}, Tamil Nadu`,
                            market_rate_per_sqft: props.rate || 7500,
                          });
                          onSelectCoordinates(lat, lon, `${name}, Tamil Nadu`);
                        }
                      } else {
                        // generic format
                        onChangeInput({
                          area_sqft: 1500,
                          address: `${file.name.replace(/\.[^/.]+$/, "")} (Uploaded)`,
                        });
                      }
                    } catch (parseErr) {
                      console.warn("Could not parse file:", parseErr);
                    }
                  };
                  reader.readAsText(file);
                }
              }}
            />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "4px" }}>
              <UploadCloud style={{ width: 20, height: 20, color: "#2563eb" }} />
              <label
                htmlFor="geojson-upload-input"
                style={{ fontSize: "12px", fontWeight: 700, color: "#1d4ed8", cursor: "pointer", textDecoration: "underline" }}
              >
                Upload GIS GeoJSON / Shapefile
              </label>
            </div>
            <div style={{ fontSize: "10px", color: "#64748b", marginBottom: "8px" }}>
              Or load verified Tamil Nadu parcel demo:
            </div>
            <div style={{ display: "flex", gap: "6px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => {
                  onChangeInput({
                    area_sqft: 2400,
                    property_type: "residential",
                    market_rate_per_sqft: 8500,
                    num_floors: 2,
                    address: "Anna Nagar West Cadastre, Chennai",
                  });
                  onSelectCoordinates(13.0878, 80.2088, "Anna Nagar West Cadastre, Chennai");
                }}
                style={{
                  background: "#ffffff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "6px",
                  padding: "3px 8px",
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "#1e40af",
                  cursor: "pointer",
                }}
              >
                Anna Nagar Cadastre (2,400 sq.ft)
              </button>
              <button
                type="button"
                onClick={() => {
                  onChangeInput({
                    area_sqft: 6500,
                    property_type: "commercial",
                    market_rate_per_sqft: 11000,
                    num_floors: 4,
                    address: "OMR IT Corridor Tech Park, Sholinganallur",
                  });
                  onSelectCoordinates(12.8996, 80.2279, "OMR IT Corridor Tech Park, Sholinganallur");
                }}
                style={{
                  background: "#ffffff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "6px",
                  padding: "3px 8px",
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "#1e40af",
                  cursor: "pointer",
                }}
              >
                OMR IT Park (6,500 sq.ft)
              </button>
              <button
                type="button"
                onClick={() => {
                  onChangeInput({
                    area_sqft: 3200,
                    property_type: "residential",
                    market_rate_per_sqft: 9200,
                    num_floors: 2,
                    address: "ECR Beachfront Plot, Neelankarai",
                  });
                  onSelectCoordinates(12.9482, 80.2588, "ECR Beachfront Plot, Neelankarai");
                }}
                style={{
                  background: "#ffffff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "6px",
                  padding: "3px 8px",
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "#1e40af",
                  cursor: "pointer",
                }}
              >
                ECR Coastal Plot (3,200 sq.ft)
              </button>
            </div>
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
        disabled={isLoading || isLocating}
        onClick={handleAnalyzeClick}
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
