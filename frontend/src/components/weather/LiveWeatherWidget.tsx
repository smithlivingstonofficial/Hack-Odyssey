"use client";

import React, { useState, useEffect } from "react";
import {
  LiveWeatherData,
  fetchLiveWeather,
} from "@/lib/api";
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudDrizzle,
  CloudFog,
  Wind,
  Droplets,
  Gauge,
  Eye,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
} from "lucide-react";

interface LiveWeatherWidgetProps {
  currentCoords: [number, number];
  locationLabel?: string;
  onSelectCoords?: (lat: number, lon: number, label?: string) => void;
}

export const TN_WEATHER_HUBS = [
  { name: "Chennai", lat: 13.0827, lon: 80.2707 },
  { name: "Coimbatore", lat: 11.0168, lon: 76.9558 },
  { name: "Madurai", lat: 9.9252, lon: 78.1198 },
  { name: "Trichy", lat: 10.8285, lon: 78.6912 },
  { name: "Cuddalore", lat: 11.7500, lon: 79.7700 },
  { name: "Salem", lat: 11.6643, lon: 78.1460 },
  { name: "Ooty", lat: 11.4102, lon: 76.6950 },
  { name: "Kanyakumari", lat: 8.0883, lon: 77.5385 },
];

export const LiveWeatherWidget: React.FC<LiveWeatherWidgetProps> = ({
  currentCoords,
  locationLabel,
  onSelectCoords,
}) => {
  const [weather, setWeather] = useState<LiveWeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [collapsed, setCollapsed] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"current" | "hourly" | "daily">("current");
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const [lat, lon] = currentCoords;

  const loadWeather = async (targetLat: number, targetLon: number) => {
    setLoading(true);
    try {
      const data = await fetchLiveWeather(targetLat, targetLon);
      if (data) {
        setWeather(data);
        const now = new Date();
        setLastUpdated(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      }
    } catch (err) {
      console.error("Failed to load live weather:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather(lat, lon);
  }, [lat, lon]);

  const renderWeatherIcon = (code: number, isDay: boolean = true, size: number = 24) => {
    if (code === 0) return <Sun className={`w-${size} h-${size} text-amber-500`} style={{ width: size, height: size }} />;
    if (code >= 1 && code <= 3) return <CloudSun className="text-amber-500" style={{ width: size, height: size }} />;
    if (code === 45 || code === 48) return <CloudFog className="text-slate-400" style={{ width: size, height: size }} />;
    if (code >= 51 && code <= 55) return <CloudDrizzle className="text-blue-400" style={{ width: size, height: size }} />;
    if (code >= 61 && code <= 65 || (code >= 80 && code <= 82)) return <CloudRain className="text-blue-500" style={{ width: size, height: size }} />;
    if (code >= 95) return <CloudLightning className="text-purple-600" style={{ width: size, height: size }} />;
    return <Cloud className="text-slate-400" style={{ width: size, height: size }} />;
  };

  return (
    <div
      className="weather-floating-widget"
      style={{
        position: "absolute",
        top: "20px",
        right: "20px",
        zIndex: 1000,
        width: collapsed ? "auto" : "360px",
        maxWidth: "calc(100vw - 40px)",
        background: "rgba(255, 255, 255, 0.94)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(226, 232, 240, 0.85)",
        borderRadius: "16px",
        boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.12), 0 4px 6px -2px rgba(15, 23, 42, 0.05)",
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
          borderBottom: collapsed ? "none" : "1px solid #e2e8f0",
          cursor: "pointer",
        }}
        onClick={() => setCollapsed(!collapsed)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#2563eb",
            }}
          >
            <CloudSun style={{ width: 18, height: 18 }} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                Live Weather
              </span>
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  color: "#059669",
                  background: "#d1fae5",
                  padding: "1px 6px",
                  borderRadius: "10px",
                }}
              >
                OPEN-METEO
              </span>
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "1px" }}>
              {locationLabel || `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {weather && !collapsed && (
            <button
              type="button"
              title="Refresh live weather"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                borderRadius: "6px",
                color: "#64748b",
              }}
              onClick={(e) => {
                e.stopPropagation();
                loadWeather(lat, lon);
              }}
            >
              <RefreshCw style={{ width: 14, height: 14 }} className={loading ? "animate-spin" : ""} />
            </button>
          )}

          {collapsed && weather && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginRight: "4px" }}>
              {renderWeatherIcon(weather.current.weather_code, weather.current.is_day, 18)}
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
                {Math.round(weather.current.temperature)}°C
              </span>
            </div>
          )}

          <div style={{ color: "#94a3b8" }}>
            {collapsed ? <ChevronDown style={{ width: 16, height: 16 }} /> : <ChevronUp style={{ width: 16, height: 16 }} />}
          </div>
        </div>
      </div>

      {/* Expanded Body */}
      {!collapsed && (
        <div style={{ padding: "14px 16px" }}>
          {/* Quick Macro Hub Switchers */}
          <div style={{ marginBottom: "12px" }}>
            <div style={{ fontSize: "10px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
              Quick Weather Hubs:
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
              {TN_WEATHER_HUBS.map((hub) => {
                const isSelected =
                  Math.abs(hub.lat - lat) < 0.05 && Math.abs(hub.lon - lon) < 0.05;
                return (
                  <button
                    key={hub.name}
                    type="button"
                    style={{
                      fontSize: "11px",
                      fontWeight: isSelected ? 700 : 500,
                      padding: "3px 8px",
                      borderRadius: "6px",
                      border: isSelected ? "1px solid #2563eb" : "1px solid #e2e8f0",
                      background: isSelected ? "#eff6ff" : "#f8fafc",
                      color: isSelected ? "#1d4ed8" : "#475569",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onClick={() => {
                      if (onSelectCoords) {
                        onSelectCoords(hub.lat, hub.lon, hub.name);
                      } else {
                        loadWeather(hub.lat, hub.lon);
                      }
                    }}
                  >
                    {hub.name}
                  </button>
                );
              })}
            </div>
          </div>

          {loading && !weather ? (
            <div style={{ padding: "24px 0", textAlign: "center", color: "#64748b" }}>
              <RefreshCw className="animate-spin" style={{ width: 22, height: 22, margin: "0 auto 8px", color: "#2563eb" }} />
              <div style={{ fontSize: "12px", fontWeight: 600 }}>Fetching Live Metro Weather...</div>
            </div>
          ) : weather ? (
            <>
              {/* Tab Navigation */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "4px",
                  background: "#f1f5f9",
                  padding: "3px",
                  borderRadius: "8px",
                  marginBottom: "12px",
                }}
              >
                <button
                  type="button"
                  style={{
                    border: "none",
                    background: activeTab === "current" ? "#ffffff" : "transparent",
                    color: activeTab === "current" ? "#0f172a" : "#64748b",
                    fontWeight: activeTab === "current" ? 700 : 500,
                    fontSize: "11px",
                    padding: "5px 0",
                    borderRadius: "6px",
                    boxShadow: activeTab === "current" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                    cursor: "pointer",
                  }}
                  onClick={() => setActiveTab("current")}
                >
                  Current
                </button>
                <button
                  type="button"
                  style={{
                    border: "none",
                    background: activeTab === "hourly" ? "#ffffff" : "transparent",
                    color: activeTab === "hourly" ? "#0f172a" : "#64748b",
                    fontWeight: activeTab === "hourly" ? 700 : 500,
                    fontSize: "11px",
                    padding: "5px 0",
                    borderRadius: "6px",
                    boxShadow: activeTab === "hourly" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                    cursor: "pointer",
                  }}
                  onClick={() => setActiveTab("hourly")}
                >
                  Hourly (24h)
                </button>
                <button
                  type="button"
                  style={{
                    border: "none",
                    background: activeTab === "daily" ? "#ffffff" : "transparent",
                    color: activeTab === "daily" ? "#0f172a" : "#64748b",
                    fontWeight: activeTab === "daily" ? 700 : 500,
                    fontSize: "11px",
                    padding: "5px 0",
                    borderRadius: "6px",
                    boxShadow: activeTab === "daily" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                    cursor: "pointer",
                  }}
                  onClick={() => setActiveTab("daily")}
                >
                  7-Day Forecast
                </button>
              </div>

              {activeTab === "current" && (
                <>
                  {/* Current Temp and Status */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px",
                      background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                      borderRadius: "12px",
                      marginBottom: "12px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {renderWeatherIcon(weather.current.weather_code, weather.current.is_day, 38)}
                      </div>
                      <div>
                        <div style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", lineHeight: 1.1 }}>
                          {Math.round(weather.current.temperature)}°C
                        </div>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "#334155", marginTop: "2px" }}>
                          {weather.current.weather_description}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>Feels Like</div>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                        {Math.round(weather.current.apparent_temperature)}°C
                      </div>
                    </div>
                  </div>

                  {/* 4-Metric Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "10px" }}>
                    <div
                      style={{
                        padding: "8px 10px",
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#64748b" }}>
                        <Droplets style={{ width: 13, height: 13, color: "#0284c7" }} />
                        <span>Humidity</span>
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>
                        {weather.current.humidity}%
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "8px 10px",
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#64748b" }}>
                        <Wind style={{ width: 13, height: 13, color: "#7c3aed" }} />
                        <span>Wind Speed</span>
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>
                        {weather.current.wind_speed} km/h
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "8px 10px",
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#64748b" }}>
                        <Gauge style={{ width: 13, height: 13, color: "#d97706" }} />
                        <span>Air Pressure</span>
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>
                        {Math.round(weather.current.pressure)} hPa
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "8px 10px",
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#64748b" }}>
                        <Cloud style={{ width: 13, height: 13, color: "#64748b" }} />
                        <span>Cloud Cover</span>
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>
                        {weather.current.cloud_cover}%
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "hourly" && (
                <div
                  style={{
                    maxHeight: "220px",
                    overflowY: "auto",
                    paddingRight: "4px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  {weather.hourly.map((h, idx) => {
                    const timeStr = new Date(h.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                    return (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "6px 10px",
                          background: "#ffffff",
                          border: "1px solid #f1f5f9",
                          borderRadius: "6px",
                          fontSize: "11px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#475569" }}>
                          <Clock style={{ width: 12, height: 12, color: "#94a3b8" }} />
                          <span style={{ fontWeight: 600 }}>{timeStr}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {renderWeatherIcon(h.weather_code, true, 14)}
                          <span style={{ fontWeight: 700, color: "#0f172a" }}>
                            {h.temperature !== null ? `${Math.round(h.temperature)}°C` : "--"}
                          </span>
                          <span style={{ color: "#0284c7", fontSize: "10px" }}>
                            {h.precipitation_probability > 0 ? `${h.precipitation_probability}% rain` : "0%"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === "daily" && (
                <div
                  style={{
                    maxHeight: "220px",
                    overflowY: "auto",
                    paddingRight: "4px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  {weather.daily.map((d, idx) => {
                    const dayDate = new Date(d.time);
                    const dayName = idx === 0 ? "Today" : dayDate.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
                    return (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "6px 10px",
                          background: "#ffffff",
                          border: "1px solid #f1f5f9",
                          borderRadius: "6px",
                          fontSize: "11px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {renderWeatherIcon(d.weather_code, true, 15)}
                          <span style={{ fontWeight: 600, color: "#1e293b" }}>{dayName}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ color: "#d97706", fontWeight: 700 }}>
                            {d.temperature_max !== null ? `${Math.round(d.temperature_max)}°` : "--"}
                          </span>
                          <span style={{ color: "#64748b" }}>/</span>
                          <span style={{ color: "#0284c7", fontWeight: 600 }}>
                            {d.temperature_min !== null ? `${Math.round(d.temperature_min)}°` : "--"}
                          </span>
                          {d.precipitation_sum > 0 && (
                            <span style={{ color: "#2563eb", fontSize: "10px", fontWeight: 600 }}>
                              {d.precipitation_sum}mm
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Map Interaction Hint */}
              <div
                style={{
                  marginTop: "8px",
                  padding: "6px 8px",
                  borderRadius: "6px",
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "10px",
                  color: "#166534",
                }}
              >
                <MapPin style={{ width: 11, height: 11, flexShrink: 0 }} />
                <span>Tip: Click anywhere on the map to inspect real-time weather at that coordinate.</span>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};
