"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  Droplet,
  Thermometer,
  Wind,
  Waves,
  Mountain,
  LayoutGrid,
  MapPin,
  X,
  Plus,
  Minus,
  Crosshair,
  Maximize2,
  Minimize2,
  Search,
  Check,
  Layers,
  ChevronDown,
} from "lucide-react";
import { HazardLayerType, BasemapType } from "@/components/map/MapLayerControl";
import { RealPropertyAsset } from "@/lib/api";

const MapComponent = dynamic(
  () => import("@/components/map/MapComponent").then((mod) => mod.MapComponent),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0b1329",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
          fontSize: "13px",
          gap: "8px",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            border: "3px solid rgba(37, 99, 235, 0.2)",
            borderTopColor: "#2563eb",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <span>Initializing Satellite Basemap & Climate Layers...</span>
      </div>
    ),
  }
);

interface EmbeddedMapCardProps {
  targetCoords: [number, number];
  locationLabel: string;
  onSelectCoords: (lat: number, lon: number, label?: string) => void;
  onSelectProperty?: (property: RealPropertyAsset) => void;
  activeCity?: string;
  activeHazard: HazardLayerType;
  onChangeHazard: (hazard: HazardLayerType) => void;
}

export const EmbeddedMapCard: React.FC<EmbeddedMapCardProps> = ({
  targetCoords,
  locationLabel,
  onSelectCoords,
  onSelectProperty,
  activeCity,
  activeHazard,
  onChangeHazard,
}) => {
  const [activeBasemap, setActiveBasemap] = useState<BasemapType>("satellite");
  const [zoomLevel, setZoomLevel] = useState<number>(11);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showProperties, setShowProperties] = useState<boolean>(true);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState<string>("");

  const hazardTools = [
    { id: "flood" as HazardLayerType, label: "Flood", icon: Droplet, color: "#2563eb", activeBg: "#eff6ff" },
    { id: "thermal" as HazardLayerType, label: "Heat", icon: Thermometer, color: "#ea580c", activeBg: "#fff7ed" },
    { id: "cyclone" as HazardLayerType, label: "Cyclone", icon: Wind, color: "#ca8a04", activeBg: "#fefce8" },
    { id: "radar" as HazardLayerType, label: "Rivers", icon: Waves, color: "#0284c7", activeBg: "#f0f9ff" },
    { id: "none" as HazardLayerType, label: "Elevation", icon: Mountain, color: "#059669", activeBg: "#f0fdf4" },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    // Common preset lookup or query Nominatim
    const query = searchInput.toLowerCase();
    if (query.includes("anna nagar")) {
      onSelectCoords(13.0827, 80.2107, "Anna Nagar, Chennai, Tamil Nadu");
    } else if (query.includes("omr") || query.includes("sholinganallur")) {
      onSelectCoords(12.9010, 80.2279, "OMR Tech Corridor, Chennai, Tamil Nadu");
    } else if (query.includes("velachery")) {
      onSelectCoords(12.9759, 80.2212, "Velachery, Chennai, Tamil Nadu");
    } else if (query.includes("marina") || query.includes("triplicane")) {
      onSelectCoords(13.0500, 80.2824, "Marina Beach Coastal Zone, Chennai, Tamil Nadu");
    } else {
      // Default to targetCoords with updated label
      onSelectCoords(targetCoords[0], targetCoords[1], searchInput);
    }
    setIsSearchOpen(false);
  };

  return (
    <div
      style={{
        position: isFullscreen ? "fixed" : "relative",
        top: isFullscreen ? 0 : undefined,
        left: isFullscreen ? 0 : undefined,
        width: isFullscreen ? "100vw" : "100%",
        height: isFullscreen ? "100vh" : "440px",
        zIndex: isFullscreen ? 9999 : 1,
        borderRadius: isFullscreen ? 0 : "16px",
        overflow: "hidden",
        border: isFullscreen ? "none" : "1px solid #e2e8f0",
        boxShadow: isFullscreen ? "none" : "0 4px 20px -2px rgba(15, 23, 42, 0.08)",
        fontFamily: "var(--font-sans)",
        background: "#0b1329",
        transition: "all 0.25s ease-in-out",
      }}
    >
      {/* 1. Floating Top-Left Location / Search Pill */}
      <div
        style={{
          position: "absolute",
          top: "14px",
          left: "16px",
          zIndex: 1000,
          background: "rgba(255, 255, 255, 0.96)",
          backdropFilter: "blur(10px)",
          borderRadius: "8px",
          padding: "7px 14px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15)",
          border: "1px solid rgba(226, 232, 240, 0.9)",
          fontSize: "12px",
          fontWeight: 700,
          color: "#0f172a",
        }}
      >
        <MapPin style={{ width: 15, height: 15, color: "#ef4444" }} />
        {isSearchOpen ? (
          <form onSubmit={handleSearchSubmit} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <input
              type="text"
              autoFocus
              placeholder="Search address or area..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                fontSize: "12px",
                fontWeight: 600,
                color: "#0f172a",
                background: "transparent",
                width: "180px",
              }}
            />
            <button
              type="submit"
              style={{
                background: "#2563eb",
                color: "#ffffff",
                border: "none",
                borderRadius: "4px",
                padding: "3px 8px",
                fontSize: "10px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Go
            </button>
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
                padding: "2px",
              }}
            >
              <X style={{ width: 12, height: 12 }} />
            </button>
          </form>
        ) : (
          <div
            onClick={() => setIsSearchOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
            }}
            title="Click to search another location"
          >
            <span style={{ maxWidth: "230px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {locationLabel || "Anna Nagar, Chennai, Tamil Nadu"}
            </span>
            <Search style={{ width: 13, height: 13, color: "#64748b" }} />
          </div>
        )}
      </div>

      {/* 2. Floating Top-Right Basemap Switcher & Fullscreen Button */}
      <div
        style={{
          position: "absolute",
          top: "14px",
          right: "16px",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {/* Basemap Switcher Pill */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.96)",
            backdropFilter: "blur(10px)",
            borderRadius: "8px",
            padding: "3px",
            display: "flex",
            gap: "2px",
            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15)",
            border: "1px solid rgba(226, 232, 240, 0.9)",
          }}
        >
          {(
            [
              { id: "satellite", label: "Satellite" },
              { id: "topographic", label: "Terrain" },
              { id: "streets", label: "Map" },
            ] as const
          ).map((bm) => {
            const isActive = activeBasemap === bm.id;
            return (
              <button
                key={bm.id}
                type="button"
                onClick={() => setActiveBasemap(bm.id as BasemapType)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "6px",
                  border: "none",
                  background: isActive ? "#2563eb" : "transparent",
                  color: isActive ? "#ffffff" : "#475569",
                  fontSize: "11px",
                  fontWeight: isActive ? 700 : 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  boxShadow: isActive ? "0 2px 6px rgba(37, 99, 235, 0.35)" : "none",
                }}
              >
                {bm.label}
              </button>
            );
          })}
        </div>

        {/* Fullscreen Expansion Button [ ⛶ ] */}
        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          title={isFullscreen ? "Exit Fullscreen" : "Maximize GIS Map"}
          style={{
            background: "rgba(255, 255, 255, 0.96)",
            backdropFilter: "blur(10px)",
            borderRadius: "8px",
            width: "34px",
            height: "34px",
            border: "1px solid rgba(226, 232, 240, 0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#334155",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15)",
            transition: "all 0.15s ease",
          }}
        >
          {isFullscreen ? (
            <Minimize2 style={{ width: 15, height: 15 }} />
          ) : (
            <Maximize2 style={{ width: 15, height: 15 }} />
          )}
        </button>
      </div>

      {/* 3. Floating Left Vertical Hazard Toolbar */}
      <div
        style={{
          position: "absolute",
          top: "70px",
          left: "16px",
          zIndex: 1000,
          background: "rgba(255, 255, 255, 0.96)",
          backdropFilter: "blur(12px)",
          borderRadius: "12px",
          padding: "8px 4px",
          display: "flex",
          flexDirection: "column",
          gap: "5px",
          boxShadow: "0 8px 24px -4px rgba(15, 23, 42, 0.16)",
          border: "1px solid rgba(226, 232, 240, 0.9)",
          width: "56px",
        }}
      >
        {hazardTools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeHazard === tool.id;
          return (
            <button
              key={tool.label}
              type="button"
              onClick={() => onChangeHazard(tool.id)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "6px 2px",
                borderRadius: "8px",
                border: isActive ? `1.5px solid ${tool.color}` : "1.5px solid transparent",
                background: isActive ? tool.activeBg : "transparent",
                color: isActive ? tool.color : "#475569",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <Icon
                style={{
                  width: 17,
                  height: 17,
                  color: isActive ? tool.color : "#64748b",
                  marginBottom: "2px",
                }}
              />
              <span style={{ fontSize: "9.5px", fontWeight: isActive ? 700 : 600 }}>
                {tool.label}
              </span>
            </button>
          );
        })}

        {/* More Settings / Price Pins Toggle */}
        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "6px 2px",
              borderRadius: "8px",
              border: "1.5px solid transparent",
              background: isMoreMenuOpen ? "#f1f5f9" : "transparent",
              color: "#64748b",
              cursor: "pointer",
              width: "100%",
            }}
          >
            <LayoutGrid style={{ width: 16, height: 16, marginBottom: "2px" }} />
            <span style={{ fontSize: "9.5px", fontWeight: 600 }}>More</span>
          </button>

          {/* More Options Popover */}
          {isMoreMenuOpen && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "64px",
                background: "#ffffff",
                borderRadius: "10px",
                padding: "8px 10px",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
                border: "1px solid #e2e8f0",
                width: "180px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                zIndex: 1100,
              }}
            >
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>
                Map Layers
              </div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#1e293b",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={showProperties}
                  onChange={(e) => setShowProperties(e.target.checked)}
                  style={{ accentColor: "#2563eb" }}
                />
                <span>Real Property Prices</span>
              </label>

              <div style={{ borderTop: "1px solid #f1f5f9", margin: "3px 0" }} />

              <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>
                Quick Locations
              </div>
              <button
                type="button"
                onClick={() => {
                  onSelectCoords(13.0827, 80.2107, "Anna Nagar, Chennai, Tamil Nadu");
                  setIsMoreMenuOpen(false);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  textAlign: "left",
                  fontSize: "11px",
                  color: "#334155",
                  cursor: "pointer",
                  padding: "3px 0",
                }}
              >
                • Anna Nagar
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectCoords(12.9010, 80.2279, "OMR Tech Corridor, Chennai, Tamil Nadu");
                  setIsMoreMenuOpen(false);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  textAlign: "left",
                  fontSize: "11px",
                  color: "#334155",
                  cursor: "pointer",
                  padding: "3px 0",
                }}
              >
                • OMR IT Corridor
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectCoords(13.0500, 80.2824, "Marina Coast, Chennai, Tamil Nadu");
                  setIsMoreMenuOpen(false);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  textAlign: "left",
                  fontSize: "11px",
                  color: "#334155",
                  cursor: "pointer",
                  padding: "3px 0",
                }}
              >
                • Marina Coastline
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. Floating Top-Right Legend Card matching reference */}
      <div
        style={{
          position: "absolute",
          top: "66px",
          right: "16px",
          zIndex: 1000,
          background: "rgba(255, 255, 255, 0.96)",
          backdropFilter: "blur(12px)",
          borderRadius: "10px",
          padding: "10px 14px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          boxShadow: "0 8px 24px -4px rgba(15, 23, 42, 0.16)",
          border: "1px solid rgba(226, 232, 240, 0.9)",
          fontSize: "11px",
          fontWeight: 600,
          color: "#1e293b",
          minWidth: "140px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              width: "14px",
              height: "10px",
              borderRadius: "2px",
              background: "#38bdf8",
              display: "inline-block",
              boxShadow: "0 0 6px rgba(56, 189, 248, 0.5)",
            }}
          />
          <span>Flood Risk Zone</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              width: "14px",
              height: "10px",
              borderRadius: "2px",
              background: "linear-gradient(to right, #f59e0b, #dc2626)",
              display: "inline-block",
              boxShadow: "0 0 6px rgba(220, 38, 38, 0.4)",
            }}
          />
          <span>High Heat Zone</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              width: "14px",
              height: "2px",
              background: "#eab308",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <span
              style={{
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                background: "#ca8a04",
                position: "absolute",
              }}
            />
          </span>
          <span>Cyclone Track</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              width: "14px",
              height: "2.5px",
              background: "#0284c7",
              display: "inline-block",
              boxShadow: "0 0 4px rgba(2, 132, 199, 0.6)",
            }}
          />
          <span>River</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#ef4444",
                border: "2px solid #ffffff",
                boxShadow: "0 0 4px rgba(239, 68, 68, 0.7)",
              }}
            />
          </div>
          <span>Property Location</span>
        </div>
      </div>

      {/* 5. Floating Bottom-Right Zoom & Center Controls */}
      <div
        style={{
          position: "absolute",
          bottom: "18px",
          right: "16px",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {/* Zoom Plus / Minus */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.96)",
            backdropFilter: "blur(10px)",
            borderRadius: "8px",
            border: "1px solid rgba(226, 232, 240, 0.9)",
            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(z + 1, 18))}
            style={{
              width: "34px",
              height: "34px",
              border: "none",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#334155",
              cursor: "pointer",
              borderBottom: "1px solid #f1f5f9",
              transition: "all 0.1s ease",
            }}
            title="Zoom In"
          >
            <Plus style={{ width: 16, height: 16 }} />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(z - 1, 4))}
            style={{
              width: "34px",
              height: "34px",
              border: "none",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#334155",
              cursor: "pointer",
              transition: "all 0.1s ease",
            }}
            title="Zoom Out"
          >
            <Minus style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* GPS Target Re-center Button */}
        <button
          type="button"
          onClick={() => {
            onSelectCoords(targetCoords[0], targetCoords[1], locationLabel);
            setZoomLevel(13);
          }}
          title="Re-center on Subject Property"
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "8px",
            border: "1px solid rgba(226, 232, 240, 0.9)",
            background: "rgba(255, 255, 255, 0.96)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#334155",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          <Crosshair style={{ width: 16, height: 16, color: "#2563eb" }} />
        </button>
      </div>


      {/* 7. Embedded Leaflet Map (Pure GIS Layer Engine with No Duplicate Controls) */}
      <MapComponent
        targetCoords={targetCoords}
        targetZoom={zoomLevel}
        locationLabel={locationLabel}
        onSelectCoords={onSelectCoords}
        onSelectProperty={onSelectProperty}
        activeCity={activeCity}
        activeHazard={activeHazard}
        onChangeHazard={onChangeHazard}
        activeBasemap={activeBasemap}
        onChangeBasemap={setActiveBasemap}
        hideInternalControls={true}
        showProperties={showProperties}
      />
    </div>
  );
};
