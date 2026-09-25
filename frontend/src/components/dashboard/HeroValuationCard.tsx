"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin,
  Crosshair,
  ArrowRight,
  Loader2,
  UploadCloud,
  Search,
  Maximize2,
  Building2,
  Coins,
  Sparkles,
  Zap,
} from "lucide-react";
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

  const handlePresetSelect = (preset: { name: string; lat: number; lon: number; rate: number }) => {
    setSearchQuery(preset.name);
    onChangeInput({
      address: preset.name,
      latitude: preset.lat,
      longitude: preset.lon,
      market_rate_per_sqft: preset.rate,
    });
    onSelectCoordinates(preset.lat, preset.lon, preset.name);
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

  const PRESETS = [
    { name: "Anna Nagar, Chennai", lat: 13.0827, lon: 80.2198, rate: 6000 },
    { name: "OMR IT Tech Corridor, Chennai", lat: 12.9010, lon: 80.2279, rate: 7000 },
    { name: "Velachery Basin, Chennai", lat: 12.9759, lon: 80.2212, rate: 8000 },
    { name: "Madurai City Center", lat: 9.9252, lon: 78.1198, rate: 5285 },
    { name: "Cuddalore Port Zone", lat: 11.7500, lon: 79.7700, rate: 3600 },
  ];

  return (
    <div
      style={{
        background: "linear-gradient(145deg, #ffffff 0%, #f8fbff 58%, #f4f8ff 100%)",
        border: "1px solid #dbe5f2",
        borderRadius: "18px",
        padding: "20px 18px",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.03), 0 16px 30px -12px rgba(37, 99, 235, 0.18)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "440px",
        fontFamily: "var(--font-sans, -apple-system, BlinkMacSystemFont, sans-serif)",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      <div>
        {/* TOP STATUS BAR & TITLE */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "2px 8px",
              borderRadius: "12px",
              fontSize: "10.5px",
              fontWeight: 700,
              background: "#eaf2ff",
              color: "#2563eb",
              border: "1px solid #cfe0ff",
            }}
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#2563eb" }} />
            AI Valuation Terminal
          </span>

          {/* Segmented Pill Tabs */}
          <div
            style={{
              display: "inline-flex",
              background: "rgba(226, 234, 245, 0.72)",
              padding: "2px",
              borderRadius: "20px",
              gap: "2px",
            }}
          >
            <button
              type="button"
              style={{
                padding: "3px 12px",
                borderRadius: "16px",
                border: "none",
                background: activeTab === "search" ? "#ffffff" : "transparent",
                color: activeTab === "search" ? "#0f172a" : "#64748b",
                fontWeight: 700,
                fontSize: "11px",
                cursor: "pointer",
                boxShadow: activeTab === "search" ? "0 2px 5px rgba(15, 23, 42, 0.08)" : "none",
                transition: "all 0.15s ease",
              }}
              onClick={() => setActiveTab("search")}
            >
              Search
            </button>
            <button
              type="button"
              style={{
                padding: "3px 12px",
                borderRadius: "16px",
                border: "none",
                background: activeTab === "upload" ? "#ffffff" : "transparent",
                color: activeTab === "upload" ? "#0f172a" : "#64748b",
                fontWeight: 700,
                fontSize: "11px",
                cursor: "pointer",
                boxShadow: activeTab === "upload" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                transition: "all 0.15s ease",
              }}
              onClick={() => setActiveTab("upload")}
            >
              Upload Cadastre
            </button>
          </div>
        </div>

        <h1
          style={{
            fontSize: "19px",
            fontWeight: 800,
            color: "#0f172a",
            letterSpacing: "-0.4px",
            lineHeight: "1.25",
            margin: "0 0 3px 0",
          }}
        >
          Find Climate-Adjusted Value
        </h1>
        <p
          style={{
            fontSize: "12px",
            color: "#64748b",
            margin: "0 0 10px 0",
            fontWeight: 500,
          }}
        >
          Simulate 30-year risk exposure across physical perils & project net asset resilience.
        </p>

        {/* SEARCH BOX */}
        {activeTab === "search" ? (
          <div style={{ marginBottom: "12px" }}>
            <form onSubmit={handleSearchSubmit}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "#ffffff",
                  border: "1px solid #bfd2ec",
                  borderRadius: "12px",
                  padding: "5px 6px 5px 12px",
                  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.07), inset 0 1px 0 rgba(255,255,255,0.8)",
                  transition: "border-color 0.15s ease",
                }}
              >
                <MapPin style={{ width: 15, height: 15, color: "#2563eb", marginRight: "8px", flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Search address, neighborhood or PIN code in Tamil Nadu..."
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
                    padding: "5px",
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
                    borderRadius: "8px",
                    fontSize: "11.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 2px 4px rgba(37, 99, 235, 0.25)",
                    flexShrink: 0,
                  }}
                >
                  {isLocating ? "Locating..." : "Search"}
                </button>
              </div>
              {searchError && (
                <div style={{ color: "#ef4444", fontSize: "11px", marginTop: "3px", fontWeight: 600 }}>
                  {searchError}
                </div>
              )}
            </form>

            {/* Quick Presets Row */}
            <div style={{ display: "flex", gap: "5px", marginTop: "7px", overflowX: "auto", paddingBottom: "2px" }}>
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handlePresetSelect(p)}
                  style={{
                    background: "rgba(255, 255, 255, 0.74)",
                    border: "1px solid #d9e4f1",
                    borderRadius: "999px",
                    padding: "3px 8px",
                    fontSize: "10px",
                    fontWeight: 600,
                    color: "#475569",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                  }}
                >
                  <MapPin size={9} color="#64748b" />
                  <span>{p.name.split(",")[0]}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: "10px 14px",
              border: "1.5px dashed #3b82f6",
              borderRadius: "10px",
              textAlign: "center",
              marginBottom: "12px",
              background: "#eff6ff",
            }}
          >
            <input
              type="file"
              id="geojson-upload-hero"
              accept=".geojson,.json,.kml"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    try {
                      const data = JSON.parse(event.target?.result as string);
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
                      }
                    } catch (parseErr) {
                      console.warn("Parse error:", parseErr);
                    }
                  };
                  reader.readAsText(file);
                }
              }}
            />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              <UploadCloud size={16} color="#2563eb" />
              <label
                htmlFor="geojson-upload-hero"
                style={{ fontSize: "11.5px", fontWeight: 700, color: "#1d4ed8", cursor: "pointer", textDecoration: "underline" }}
              >
                Upload GeoJSON / KML Cadastre
              </label>
            </div>
          </div>
        )}

        {/* 3-COLUMN SPECIFICATION INPUTS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "10px",
            marginBottom: "14px",
          }}
        >
          {/* Area */}
          <div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11px",
                fontWeight: 700,
                color: "#475569",
                marginBottom: "4px",
              }}
            >
              <Maximize2 size={11} color="#2563eb" />
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
                padding: "7px 10px",
                background: "rgba(255, 255, 255, 0.86)",
                border: "1px solid #c8d8ea",
                borderRadius: "9px",
                fontSize: "13px",
                fontWeight: 700,
                color: "#0f172a",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Property Type Dropdown */}
          <div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11px",
                fontWeight: 700,
                color: "#475569",
                marginBottom: "4px",
              }}
            >
              <Building2 size={11} color="#059669" />
              <span>Type</span>
            </label>
            <select
              value={input.property_type}
              onChange={(e) => onChangeInput({ property_type: e.target.value as any })}
              style={{
                width: "100%",
                padding: "7px 10px",
                background: "rgba(255, 255, 255, 0.86)",
                border: "1px solid #c8d8ea",
                borderRadius: "9px",
                fontSize: "13px",
                fontWeight: 700,
                color: "#0f172a",
                outline: "none",
                cursor: "pointer",
                boxSizing: "border-box",
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
                gap: "4px",
                fontSize: "11px",
                fontWeight: 700,
                color: "#475569",
                marginBottom: "4px",
              }}
            >
              <Coins size={11} color="#d97706" />
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
                padding: "7px 10px",
                background: "rgba(255, 255, 255, 0.86)",
                border: "1px solid #c8d8ea",
                borderRadius: "9px",
                fontSize: "13px",
                fontWeight: 700,
                color: "#0f172a",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
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
          padding: "13px 18px",
          background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
          color: "#ffffff",
          border: "none",
          borderRadius: "11px",
          fontSize: "14px",
          fontWeight: 700,
          cursor: isLoading ? "not-allowed" : "pointer",
          boxShadow: "0 8px 18px rgba(37, 99, 235, 0.28), inset 0 1px 0 rgba(255,255,255,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          transition: "all 0.15s ease",
        }}
      >
        {isLoading ? (
          <>
            <Loader2 style={{ width: 17, height: 17, animation: "spin 1s linear infinite" }} />
            <span>Analyzing Environmental Vectors...</span>
          </>
        ) : (
          <>
            <Zap size={16} />
            <span>Analyze Property Climate Value</span>
            <ArrowRight size={16} />
          </>
        )}
      </button>
    </div>
  );
};
