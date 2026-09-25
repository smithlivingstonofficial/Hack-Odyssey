"use client";

import React, { useState } from "react";
import {
  Search,
  Bell,
  MapPin,
  Crosshair,
  ChevronDown,
  Layers,
  Sparkles,
  TrendingDown,
  ShieldCheck,
} from "lucide-react";

interface TopHeaderProps {
  activeTopTab: string;
  onChangeTopTab: (tab: string) => void;
  onSearch: (query: string) => void;
  locationLabel?: string;
  isSearching?: boolean;
  activeCity?: string;
  onSelectCity?: (city: string) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTopTab,
  onChangeTopTab,
  onSearch,
  locationLabel = "Anna Nagar, Chennai, Tamil Nadu",
  isSearching = false,
  activeCity,
  onSelectCity,
}) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const topTabs = [
    { id: "home", label: "Home" },
    { id: "valuation", label: "Valuation" },
    { id: "map", label: "Map" },
    { id: "reports", label: "Reports" },
    { id: "about", label: "About" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleGpsCurrentLocation = () => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          onSearch(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
        },
        () => {
          console.warn("Geolocation permission not granted");
        },
        { timeout: 8000 }
      );
    }
  };

  return (
    <header
      style={{
        height: "68px",
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        position: "sticky",
        top: 0,
        zIndex: 100,
        fontFamily: "var(--font-sans)",
        boxSizing: "border-box",
      }}
    >
      {/* ── Brand Area (Left) ─────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
        {/* Layered Glassmorphic Brand Emblem */}
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #38bdf8 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            flexShrink: 0,
          }}
        >
          <Layers style={{ width: 20, height: 20, color: "#ffffff" }} />
        </div>

        {/* Wordmark with Micro Tag */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ fontSize: "19px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px", lineHeight: 1 }}>
            Climate<span style={{ color: "#2563eb" }}>Value</span>
          </div>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.4px",
              background: "#eff6ff",
              color: "#1d4ed8",
              border: "1px solid #bfdbfe",
              padding: "2px 7px",
              borderRadius: "6px",
              textTransform: "uppercase",
            }}
          >
            AI • GIS
          </span>
        </div>
      </div>

      {/* ── Modern High-End Search Bar (Center) ─────────────────────── */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          alignItems: "center",
          background: isFocused ? "#ffffff" : "#f8fafc",
          border: isFocused ? "1.5px solid #2563eb" : "1.5px solid #cbd5e1",
          boxShadow: isFocused
            ? "0 0 0 3px rgba(37, 99, 235, 0.12), 0 2px 6px rgba(0, 0, 0, 0.04)"
            : "0 1px 2px rgba(0, 0, 0, 0.04)",
          borderRadius: "30px",
          padding: "3px 4px 3px 14px",
          width: "100%",
          maxWidth: "460px",
          margin: "0 24px",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          boxSizing: "border-box",
        }}
      >
        <MapPin
          style={{
            width: 16,
            height: 16,
            color: isFocused ? "#2563eb" : "#94a3b8",
            marginRight: "8px",
            flexShrink: 0,
            transition: "color 0.15s ease",
          }}
        />

        <input
          type="text"
          placeholder="Enter property address, city or pin code..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: "13px",
            fontWeight: 500,
            color: "#0f172a",
            padding: "6px 0",
          }}
        />

        {/* GPS Locate Button */}
        <button
          type="button"
          onClick={handleGpsCurrentLocation}
          title="Auto-detect current location"
          style={{
            background: "transparent",
            border: "none",
            color: "#94a3b8",
            cursor: "pointer",
            padding: "6px 8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            transition: "color 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#2563eb";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#94a3b8";
          }}
        >
          <Crosshair style={{ width: 15, height: 15 }} />
        </button>

        {/* Integrated Gradient Search CTA Button */}
        <button
          type="submit"
          disabled={isSearching}
          style={{
            padding: "8px 20px",
            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            color: "#ffffff",
            border: "none",
            borderRadius: "24px",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(37, 99, 235, 0.3)",
            transition: "all 0.15s ease",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: "5px",
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
          {isSearching ? "Searching..." : "Search"}
        </button>
      </form>

      {/* ── Right Navigation & Utilities ─────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px", flexShrink: 0 }}>
        {/* Modern Segmented Navigation Tabs */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            background: "#f8fafc",
            padding: "3px 4px",
            borderRadius: "30px",
            border: "1px solid #e2e8f0",
          }}
        >
          {topTabs.map((tab) => {
            const isActive = activeTopTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChangeTopTab(tab.id)}
                style={{
                  background: isActive ? "#ffffff" : "transparent",
                  color: isActive ? "#2563eb" : "#475569",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: "12px",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  border: isActive ? "1px solid #bfdbfe" : "1px solid transparent",
                  boxShadow: isActive ? "0 1px 3px rgba(37, 99, 235, 0.1)" : "none",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = "#0f172a";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = "#475569";
                }}
              >
                {isActive && (
                  <span
                    style={{
                      width: "5px",
                      height: "5px",
                      borderRadius: "50%",
                      background: "#2563eb",
                    }}
                  />
                )}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Notification Bell with Badge */}
        <button
          type="button"
          title="System notifications"
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            border: "1px solid #e2e8f0",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#64748b",
            cursor: "pointer",
            position: "relative",
            transition: "all 0.15s ease",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f8fafc";
            e.currentTarget.style.borderColor = "#cbd5e1";
            e.currentTarget.style.color = "#1e293b";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#ffffff";
            e.currentTarget.style.borderColor = "#e2e8f0";
            e.currentTarget.style.color = "#64748b";
          }}
        >
          <Bell style={{ width: 17, height: 17 }} />
          <span
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              width: "7px",
              height: "7px",
              background: "#ef4444",
              border: "1.5px solid #ffffff",
              borderRadius: "50%",
            }}
          />
        </button>

        {/* User Profile Pill (Modern Institutional Style) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "4px 12px 4px 5px",
            borderRadius: "30px",
            border: "1px solid #e2e8f0",
            background: "#ffffff",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#cbd5e1";
            e.currentTarget.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.06)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#e2e8f0";
            e.currentTarget.style.boxShadow = "0 1px 2px rgba(0, 0, 0, 0.03)";
          }}
        >
          {/* Avatar with Status Dot */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: 700,
                boxShadow: "0 2px 4px rgba(234, 88, 12, 0.25)",
              }}
            >
              SR
            </div>
            {/* Green Online Dot */}
            <span
              style={{
                position: "absolute",
                bottom: "0px",
                right: "0px",
                width: "8px",
                height: "8px",
                background: "#10b981",
                border: "1.5px solid #ffffff",
                borderRadius: "50%",
              }}
            />
          </div>

          {/* User details */}
          <div style={{ textAlign: "left", lineHeight: "1.2" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>Sam Roy</div>
            <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 500 }}>User</div>
          </div>
        </div>
      </div>
    </header>
  );
};
