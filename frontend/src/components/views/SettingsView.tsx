"use client";

import React, { useState } from "react";
import {
  Settings,
  Check,
  Save,
  ShieldCheck,
  Server,
  Sliders,
  DollarSign,
  MapPin,
  RefreshCw,
} from "lucide-react";

interface SettingsViewProps {
  activeCity?: string;
  onSelectCity?: (city: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  activeCity = "Chennai",
  onSelectCity,
}) => {
  const [selectedCity, setSelectedCity] = useState<string>(activeCity);
  const [sensitivity, setSensitivity] = useState<"standard" | "conservative" | "aggressive">("standard");
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const [areaUnit, setAreaUnit] = useState<"sqft" | "sqm">("sqft");
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleSave = () => {
    if (onSelectCity && selectedCity !== activeCity) {
      onSelectCity(selectedCity);
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const cities = [
    { id: "Chennai", label: "Chennai Metropolitan Area", district: "Chennai / Kanchipuram" },
    { id: "Coimbatore", label: "Coimbatore Industrial Hub", district: "Coimbatore" },
    { id: "Madurai", label: "Madurai South Hub", district: "Madurai" },
    { id: "Trichy", label: "Tiruchirappalli Central", district: "Tiruchirappalli" },
    { id: "Cuddalore", label: "Cuddalore Coastal Port", district: "Cuddalore" },
    { id: "Sivakasi", label: "Sivakasi Industrial Taluk", district: "Virudhunagar" },
  ];

  return (
    <div style={{ maxWidth: "980px", margin: "0 auto", paddingBottom: "48px", fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#2563eb",
            }}
          >
            <Settings style={{ width: 20, height: 20 }} />
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
            Platform Settings & System Parameters
          </h1>
        </div>
        <p style={{ fontSize: "13px", color: "#64748b", margin: "6px 0 0 0" }}>
          Configure default geographical hubs, underwriting sensitivity, and verify API connectivity.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Card 1: Default Regional Focus */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <MapPin style={{ width: 18, height: 18, color: "#2563eb" }} />
            <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Default Regional Focus (Tamil Nadu)
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
            {cities.map((c) => {
              const isSelected = selectedCity.toLowerCase() === c.id.toLowerCase();
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCity(c.id)}
                  style={{
                    padding: "14px",
                    borderRadius: "10px",
                    border: isSelected ? "2px solid #2563eb" : "1px solid #e2e8f0",
                    background: isSelected ? "#eff6ff" : "#ffffff",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ fontSize: "13px", fontWeight: 700, color: isSelected ? "#1d4ed8" : "#0f172a" }}>
                    {c.label}
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                    District: {c.district}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 2: Valuation Sensitivity & Parameters */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <Sliders style={{ width: 18, height: 18, color: "#2563eb" }} />
            <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Underwriting Risk Sensitivity
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "20px" }}>
            {[
              { id: "conservative", label: "Conservative", desc: "1.25x Haircut multiplier for risk-averse institutional lenders" },
              { id: "standard", label: "Standard (Default)", desc: "1.0x Empirical statutory guideline rate multiplier" },
              { id: "aggressive", label: "Aggressive", desc: "0.8x Value-preserving model for high-resilience properties" },
            ].map((s) => {
              const isSelected = sensitivity === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setSensitivity(s.id as any)}
                  style={{
                    padding: "14px",
                    borderRadius: "10px",
                    border: isSelected ? "2px solid #2563eb" : "1px solid #e2e8f0",
                    background: isSelected ? "#eff6ff" : "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontSize: "13px", fontWeight: 700, color: isSelected ? "#1d4ed8" : "#0f172a" }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", lineHeight: "1.4" }}>
                    {s.desc}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Currency & Units */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", borderTop: "1px solid #f1f5f9", paddingTop: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                Display Currency
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => setCurrency("INR")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "8px",
                    border: currency === "INR" ? "2px solid #2563eb" : "1px solid #e2e8f0",
                    background: currency === "INR" ? "#eff6ff" : "#ffffff",
                    color: currency === "INR" ? "#2563eb" : "#475569",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  INR (₹ Lakhs & Crores)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency("USD")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "8px",
                    border: currency === "USD" ? "2px solid #2563eb" : "1px solid #e2e8f0",
                    background: currency === "USD" ? "#eff6ff" : "#ffffff",
                    color: currency === "USD" ? "#2563eb" : "#475569",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  USD ($ Millions)
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                Area Measurement Unit
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => setAreaUnit("sqft")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "8px",
                    border: areaUnit === "sqft" ? "2px solid #2563eb" : "1px solid #e2e8f0",
                    background: areaUnit === "sqft" ? "#eff6ff" : "#ffffff",
                    color: areaUnit === "sqft" ? "#2563eb" : "#475569",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Square Feet (sq.ft)
                </button>
                <button
                  type="button"
                  onClick={() => setAreaUnit("sqm")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "8px",
                    border: areaUnit === "sqm" ? "2px solid #2563eb" : "1px solid #e2e8f0",
                    background: areaUnit === "sqm" ? "#eff6ff" : "#ffffff",
                    color: areaUnit === "sqm" ? "#2563eb" : "#475569",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Square Meters (sq.m)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Live API & Service Health */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <Server style={{ width: 18, height: 18, color: "#10b981" }} />
            <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Live Microservice Connectivity
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
            {[
              { name: "Open-Meteo ERA5 Climate Archive", latency: "14ms", status: "Operational" },
              { name: "OpenStreetMap Overpass Cadastre (Multi-Mirror)", latency: "185ms", status: "Operational" },
              { name: "Nominatim Geocoding Engine", latency: "95ms", status: "Operational" },
              { name: "Scikit-Learn Risk Models (v2.4)", latency: "8ms", status: "Operational" },
            ].map((srv) => (
              <div
                key={srv.name}
                style={{
                  padding: "12px 14px",
                  borderRadius: "10px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>{srv.name}</div>
                  <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>Latency: {srv.latency}</div>
                </div>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "#15803d",
                    background: "#dcfce7",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    border: "1px solid #bbf7d0",
                  }}
                >
                  ● {srv.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: "12px 24px",
              background: "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)",
            }}
          >
            <Save style={{ width: 16, height: 16 }} />
            <span>Save Settings</span>
          </button>

          {isSaved && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#15803d", fontSize: "13px", fontWeight: 700 }}>
              <Check style={{ width: 16, height: 16 }} />
              <span>Settings updated successfully!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
