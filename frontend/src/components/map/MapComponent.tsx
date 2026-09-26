"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  useMap,
  useMapEvents,
  Polyline,
  CircleMarker,
} from "react-leaflet";
import L from "leaflet";
import {
  fetchThermalHeatmap,
  fetchFloodHeatmap,
  fetchCycloneHeatmap,
  fetchRadarTileUrl,
  fetchNearbyRealProperties,
  RealPropertyAsset,
  formatINR,
} from "@/lib/api";
import { LiveWeatherWidget } from "@/components/weather/LiveWeatherWidget";
import {
  MapLayerControl,
  HazardLayerType,
  BasemapType,
} from "@/components/map/MapLayerControl";

// Map flyTo updater
interface MapUpdaterProps {
  center: [number, number];
  zoom: number;
}

const MapUpdater: React.FC<MapUpdaterProps> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
};

// Map click listener component
interface MapClickListenerProps {
  onMapClick: (lat: number, lon: number) => void;
}

const MapClickListener: React.FC<MapClickListenerProps> = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// Leaflet Heatmap Layer subcomponent with clean unmount handling
interface HeatLayerProps {
  points: [number, number, number][];
  options?: {
    minOpacity?: number;
    maxZoom?: number;
    max?: number;
    radius?: number;
    blur?: number;
    gradient?: { [key: number]: string };
  };
}

const HeatmapLayerComponent: React.FC<HeatLayerProps> = ({ points, options }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !points || points.length === 0) return;

    let isMounted = true;
    let heatLayer: any = null;

    const initHeatLayer = async () => {
      try {
        if (typeof window !== "undefined") {
          (window as any).L = L;
          await import("leaflet.heat");
          if (!isMounted) return;
          if ((L as any).heatLayer) {
            heatLayer = (L as any).heatLayer(points, options);
            heatLayer.addTo(map);
          }
        }
      } catch (err) {
        console.warn("Leaflet.heat initialization notice:", err);
      }
    };

    initHeatLayer();

    return () => {
      isMounted = false;
      if (heatLayer && map) {
        try {
          map.removeLayer(heatLayer);
        } catch {
          // ignore unmount errors
        }
      }
    };
  }, [map, points, options]);

  return null;
};

// Custom modern marker for selected property location (Teardrop Red Pin from reference design)
const createPropertyPinIcon = () => {
  return L.divIcon({
    className: "custom-property-pin",
    html: `
      <div style="
        position: relative;
        width: 36px;
        height: 44px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
      ">
        <!-- Radar Pulse wave on the ground -->
        <div style="
          position: absolute;
          bottom: 2px;
          left: 50%;
          transform: translateX(-50%);
          width: 22px;
          height: 10px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.4);
          filter: blur(2px);
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <!-- High-contrast Red Teardrop Vector Pin matching reference -->
        <svg width="30" height="38" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 10px rgba(0,0,0,0.5)); z-index: 2; transform: translateY(-4px);">
          <path d="M16 0C7.163 0 0 7.163 0 16C0 27 16 40 16 40C16 40 32 27 32 16C32 7.163 24.837 0 16 0Z" fill="#ef4444"/>
          <circle cx="16" cy="15" r="5.5" fill="#ffffff"/>
        </svg>
      </div>
    `,
    iconSize: [36, 44],
    iconAnchor: [18, 40],
    popupAnchor: [0, -38],
  });
};

// Custom DivIcon for real property price badges (Prop-Tech Pill)
const createPropertyPriceIcon = (property: RealPropertyAsset, isSelected: boolean = false) => {
  const priceText = property.estimated_price_inr
    ? formatINR(property.estimated_price_inr)
    : "₹--";
  const typeEmoji =
    property.property_type === "commercial" ? "🏢"
    : property.property_type === "apartment" ? "🏢"
    : property.property_type === "industrial" ? "🏭"
    : "🏡";
  const haircut = property.climate_haircut_estimate ? `-${property.climate_haircut_estimate}%` : "";

  return L.divIcon({
    className: "custom-property-price-badge",
    html: `
      <div style="
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: ${isSelected ? "rgba(16, 185, 129, 0.96)" : "rgba(15, 23, 42, 0.90)"};
        backdrop-filter: blur(8px);
        color: #ffffff;
        padding: 4px 10px;
        border-radius: 20px;
        border: ${isSelected ? "2px solid #ffffff" : "1.5px solid rgba(52, 211, 153, 0.65)"};
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
        cursor: pointer;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 11px;
        font-weight: 700;
        white-space: nowrap;
        transform: translate(-50%, -100%);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      ">
        <span style="font-size: 12px;">${typeEmoji}</span>
        <span style="color: ${isSelected ? "#ffffff" : "#6ee7b7"}; letter-spacing: -0.2px;">${priceText}</span>
        ${haircut ? `<span style="font-size: 9px; background: rgba(239, 68, 68, 0.35); color: #fca5a5; padding: 1px 5px; border-radius: 6px; font-weight: 700; border: 1px solid rgba(239, 68, 68, 0.4);">${haircut}</span>` : ""}
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -28],
  });
};

const BASEMAP_TILES: Record<
  BasemapType,
  { url: string; attribution: string; maxZoom: number }
> = {
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
    maxZoom: 18,
  },
  topographic: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: "Map data: &copy; OpenTopoMap",
    maxZoom: 17,
  },
  streets: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 19,
  },
};

export interface MapComponentProps {
  targetCoords?: [number, number];
  targetZoom?: number;
  locationLabel?: string;
  onSelectCoords?: (lat: number, lon: number, label?: string) => void;
  onSelectProperty?: (property: RealPropertyAsset) => void;
  activeCity?: string;
  activeHazard?: HazardLayerType;
  onChangeHazard?: (hazard: HazardLayerType) => void;
  activeBasemap?: BasemapType;
  onChangeBasemap?: (basemap: BasemapType) => void;
  hideInternalControls?: boolean;
  showProperties?: boolean;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  targetCoords: propCoords,
  targetZoom: propZoom,
  locationLabel: propLabel,
  onSelectCoords,
  onSelectProperty,
  activeCity,
  activeHazard: propHazard,
  onChangeHazard: propSetHazard,
  activeBasemap: propBasemap,
  onChangeBasemap: propSetBasemap,
  hideInternalControls = false,
  showProperties: propShowProperties = false,
}) => {
  const [internalHazard, setInternalHazard] = useState<HazardLayerType>("thermal");
  const [internalBasemap, setInternalBasemap] = useState<BasemapType>("satellite");

  const activeHazard = propHazard !== undefined ? propHazard : internalHazard;
  const setActiveHazard = propSetHazard || setInternalHazard;

  const activeBasemap = propBasemap !== undefined ? propBasemap : internalBasemap;
  const setActiveBasemap = propSetBasemap || setInternalBasemap;

  const [internalShowProperties, setInternalShowProperties] = useState<boolean>(false);
  const showProperties = propShowProperties !== undefined ? propShowProperties : internalShowProperties;
  const setShowProperties = setInternalShowProperties;

  const [thermalPoints, setThermalPoints] = useState<[number, number, number][]>([]);
  const [floodPoints, setFloodPoints] = useState<[number, number, number][]>([]);
  const [cyclonePoints, setCyclonePoints] = useState<[number, number, number][]>([]);
  const [radarTileUrl, setRadarTileUrl] = useState<string | null>(null);
  const [isLoadingLayer, setIsLoadingLayer] = useState<boolean>(false);

  // Real Property Prices & Cadastre Layer State
  const [nearbyProperties, setNearbyProperties] = useState<RealPropertyAsset[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [isLoadingProperties, setIsLoadingProperties] = useState<boolean>(false);

  const [internalCoords, setInternalCoords] = useState<[number, number]>([13.0827, 80.2707]);
  const [internalZoom, setInternalZoom] = useState<number>(11);
  const [internalLabel, setInternalLabel] = useState<string>("Anna Nagar, Chennai, Tamil Nadu");

  const currentCoords = propCoords || internalCoords;
  const currentZoom = propZoom || internalZoom;
  const currentLabel = propLabel || internalLabel;

  // Dynamic Hazard Layer Points / Radar Tile Loader
  useEffect(() => {
    let isMounted = true;

    const loadLayerData = async () => {
      if (activeHazard === "thermal") {
        if (thermalPoints.length > 0) return;
        setIsLoadingLayer(true);
        try {
          const pts = await fetchThermalHeatmap(11.1271, 78.6569);
          if (isMounted && pts && pts.length > 0) {
            setThermalPoints(pts);
          }
        } catch (err) {
          console.warn("Notice: Thermal heatmap loading notice:", err);
        } finally {
          if (isMounted) setIsLoadingLayer(false);
        }
      } else if (activeHazard === "flood") {
        if (floodPoints.length > 0) return;
        setIsLoadingLayer(true);
        try {
          const pts = await fetchFloodHeatmap(currentCoords[0], currentCoords[1]);
          if (isMounted && pts && pts.length > 0) {
            setFloodPoints(pts);
          }
        } catch (err) {
          console.warn("Notice: Flood heatmap loading notice:", err);
        } finally {
          if (isMounted) setIsLoadingLayer(false);
        }
      } else if (activeHazard === "cyclone") {
        if (cyclonePoints.length > 0) return;
        setIsLoadingLayer(true);
        try {
          const pts = await fetchCycloneHeatmap(currentCoords[0], currentCoords[1]);
          if (isMounted && pts && pts.length > 0) {
            setCyclonePoints(pts);
          }
        } catch (err) {
          console.warn("Notice: Cyclone heatmap loading notice:", err);
        } finally {
          if (isMounted) setIsLoadingLayer(false);
        }
      } else if (activeHazard === "radar") {
        if (radarTileUrl) return;
        setIsLoadingLayer(true);
        try {
          const res = await fetchRadarTileUrl();
          if (isMounted && res?.tile_url) {
            setRadarTileUrl(res.tile_url);
          }
        } catch (err) {
          console.warn("Notice: Radar tile loading notice:", err);
        } finally {
          if (isMounted) setIsLoadingLayer(false);
        }
      }
    };

    loadLayerData();

    return () => {
      isMounted = false;
    };
  }, [activeHazard, currentCoords, thermalPoints.length, floodPoints.length, cyclonePoints.length, radarTileUrl]);

  // Load Real Nearby Properties & Cadastral Valuations
  useEffect(() => {
    let isMounted = true;

    const loadProperties = async () => {
      if (!showProperties) return;
      setIsLoadingProperties(true);
      try {
        const props = await fetchNearbyRealProperties(currentCoords[0], currentCoords[1], 1200);
        if (isMounted && props) {
          setNearbyProperties(props);
        }
      } catch (err) {
        console.warn("Notice: Real properties loading notice:", err);
      } finally {
        if (isMounted) setIsLoadingProperties(false);
      }
    };

    loadProperties();

    return () => {
      isMounted = false;
    };
  }, [showProperties, currentCoords[0], currentCoords[1]]);

  // Continuous Thermal Heatmap Configuration
  const thermalHeatOptions = useMemo(
    () => ({
      radius: 40,
      blur: 26,
      maxZoom: 15,
      max: 0.85,
      minOpacity: 0.28,
      gradient: {
        0.15: "#fef08a",
        0.40: "#f59e0b",
        0.65: "#ea580c",
        0.85: "#dc2626",
        1.0: "#991b1b",
      },
    }),
    []
  );

  // Flood Inundation Heatmap Configuration
  const floodHeatOptions = useMemo(
    () => ({
      radius: 38,
      blur: 24,
      maxZoom: 15,
      max: 0.9,
      minOpacity: 0.32,
      gradient: {
        0.2: "#bae6fd",
        0.4: "#38bdf8",
        0.6: "#0284c7",
        0.8: "#1d4ed8",
        1.0: "#1e3a8a",
      },
    }),
    []
  );

  // Cyclone Storm Surge Heatmap Configuration
  const cycloneHeatOptions = useMemo(
    () => ({
      radius: 42,
      blur: 28,
      maxZoom: 15,
      max: 0.9,
      minOpacity: 0.3,
      gradient: {
        0.2: "#fef9c3",
        0.4: "#fde047",
        0.6: "#eab308",
        0.8: "#ca8a04",
        1.0: "#a16207",
      },
    }),
    []
  );

  const handleMapClick = (clickLat: number, clickLon: number) => {
    const label = `${clickLat.toFixed(4)}°N, ${clickLon.toFixed(4)}°E`;
    setInternalCoords([clickLat, clickLon]);
    setInternalLabel(label);
    if (onSelectCoords) {
      onSelectCoords(clickLat, clickLon, label);
    }
  };

  const handleSelectHub = (hubLat: number, hubLon: number, hubName?: string) => {
    const label = hubName ? `${hubName}, Tamil Nadu` : `${hubLat.toFixed(4)}°N, ${hubLon.toFixed(4)}°E`;
    setInternalCoords([hubLat, hubLon]);
    setInternalZoom(11);
    setInternalLabel(label);
    if (onSelectCoords) {
      onSelectCoords(hubLat, hubLon, label);
    }
  };

  const propertyPinIcon = useMemo(() => createPropertyPinIcon(), []);

  return (
    <div
      className="map-container"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#0f172a",
      }}
    >
      {/* Floating Interactive Hazard Layer, Basemap & Real Property Prices Control Bar (Only when standalone) */}
      {!hideInternalControls && (
        <MapLayerControl
          activeHazard={activeHazard}
          onChangeHazard={setActiveHazard}
          activeBasemap={activeBasemap}
          onChangeBasemap={setActiveBasemap}
          isLoadingLayer={isLoadingLayer}
        />
      )}

      {/* Floating Live Metro Weather Widget (Only when standalone) */}
      {!hideInternalControls && (
        <LiveWeatherWidget
          currentCoords={currentCoords}
          locationLabel={currentLabel}
          onSelectCoords={handleSelectHub}
        />
      )}

      <MapContainer
        center={[13.0827, 80.2707]}
        zoom={currentZoom}
        zoomControl={false}
        attributionControl={false}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", background: "#0b1329" }}
      >
        {!hideInternalControls && <ZoomControl position="bottomleft" />}
        <MapUpdater center={currentCoords} zoom={currentZoom} />
        <MapClickListener onMapClick={handleMapClick} />

        {/* Dynamic Basemap Layer (Satellite Imagery default) */}
        <TileLayer
          key={activeBasemap}
          url={BASEMAP_TILES[activeBasemap].url}
          attribution={BASEMAP_TILES[activeBasemap].attribution}
          maxZoom={BASEMAP_TILES[activeBasemap].maxZoom}
        />

        {/* Transparent Boundaries & Places Reference Labels on Satellite */}
        {activeBasemap === "satellite" && (
          <TileLayer
            key="satellite-reference-labels"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
            opacity={0.8}
            zIndex={300}
          />
        )}

        {/* Continuous Thermal Heatmap Layer */}
        {activeHazard === "thermal" && thermalPoints.length > 0 && (
          <HeatmapLayerComponent
            key="thermal"
            points={thermalPoints}
            options={thermalHeatOptions}
          />
        )}

        {/* Flood Basin Inundation Heatmap Layer */}
        {activeHazard === "flood" && floodPoints.length > 0 && (
          <HeatmapLayerComponent
            key="flood"
            points={floodPoints}
            options={floodHeatOptions}
          />
        )}

        {/* Cyclone Storm Surge Heatmap Layer */}
        {activeHazard === "cyclone" && cyclonePoints.length > 0 && (
          <HeatmapLayerComponent
            key="cyclone"
            points={cyclonePoints}
            options={cycloneHeatOptions}
          />
        )}

        {/* Cyclone Storm Track with Waypoint Markers (NOAA IBTrACS Coastal Approach Vector) */}
        {(activeHazard === "cyclone" || activeHazard === "none") && (
          <>
            <Polyline
              positions={[
                [12.60, 80.85],
                [12.85, 80.60],
                [13.10, 80.40],
                [13.38, 80.25],
                [13.72, 80.15],
              ]}
              pathOptions={{
                color: "#eab308",
                weight: 3.5,
                dashArray: "6, 8",
                opacity: 0.95,
              }}
            />
            {[
              [12.60, 80.85],
              [12.85, 80.60],
              [13.10, 80.40],
              [13.38, 80.25],
              [13.72, 80.15],
            ].map((pos, idx) => (
              <CircleMarker
                key={`cyclone-node-${idx}`}
                center={pos as [number, number]}
                radius={4.5}
                pathOptions={{
                  color: "#ca8a04",
                  fillColor: "#fef08a",
                  fillOpacity: 1,
                  weight: 2,
                }}
              />
            ))}
          </>
        )}

        {/* River Vectors (Cooum River & Adyar River Flowing to Bay of Bengal) */}
        {(activeHazard === "radar" || activeHazard === "flood" || activeHazard === "none") && (
          <>
            {/* Cooum River */}
            <Polyline
              positions={[
                [13.063, 80.125],
                [13.069, 80.165],
                [13.076, 80.205],
                [13.073, 80.245],
                [13.068, 80.282],
              ]}
              pathOptions={{
                color: "#0284c7",
                weight: 3.5,
                opacity: 0.9,
              }}
            />
            {/* Adyar River */}
            <Polyline
              positions={[
                [12.985, 80.080],
                [13.010, 80.140],
                [13.018, 80.195],
                [13.014, 80.240],
                [13.009, 80.272],
              ]}
              pathOptions={{
                color: "#0284c7",
                weight: 4,
                opacity: 0.9,
              }}
            />
          </>
        )}

        {/* Live Doppler Weather Radar Tile Layer */}
        {activeHazard === "radar" && radarTileUrl && (
          <TileLayer
            key={radarTileUrl}
            url={radarTileUrl}
            opacity={0.65}
            zIndex={400}
          />
        )}

        {/* Real Property Prices & Cadastral Building Markers */}
        {showProperties &&
          nearbyProperties.map((prop) => {
            const isSelected = selectedPropertyId === prop.id;
            const propIcon = createPropertyPriceIcon(prop, isSelected);

            return (
              <Marker
                key={prop.id}
                position={[prop.latitude, prop.longitude]}
                icon={propIcon}
                eventHandlers={{
                  click: () => setSelectedPropertyId(prop.id),
                }}
              >
                <Popup className="cadastre-property-popup" minWidth={260}>
                  <div style={{ padding: "6px 2px", fontFamily: "system-ui, sans-serif" }}>
                    {/* Header with Type and Haircut */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "6px",
                        marginBottom: "6px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          background: "#eff6ff",
                          border: "1px solid #bfdbfe",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          color: "#1d4ed8",
                        }}
                      >
                        {prop.property_type}
                      </span>
                      {prop.climate_haircut_estimate ? (
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            color: "#dc2626",
                            background: "#fee2e2",
                            border: "1px solid #fecaca",
                            padding: "2px 6px",
                            borderRadius: "4px",
                          }}
                        >
                          -{prop.climate_haircut_estimate}% Haircut
                        </span>
                      ) : null}
                    </div>

                    {/* Building Name */}
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "13px",
                        color: "#0f172a",
                        marginBottom: "8px",
                        lineHeight: "1.35",
                      }}
                    >
                      {prop.name}
                    </div>

                    {/* Detailed Valuation & Spec Ledger */}
                    <div
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        padding: "8px 10px",
                        marginBottom: "10px",
                        fontSize: "11px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "4px",
                          color: "#64748b",
                        }}
                      >
                        <span>Built-Up Area:</span>
                        <strong style={{ color: "#1e293b" }}>
                          {prop.estimated_area_sqft.toLocaleString()} sq.ft ({prop.num_floors} flr)
                        </strong>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "4px",
                          color: "#64748b",
                        }}
                      >
                        <span>TN Guideline Rate:</span>
                        <strong style={{ color: "#1e293b" }}>
                          ₹{prop.guideline_rate_per_sqft.toLocaleString()} / sq.ft
                        </strong>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "4px",
                          color: "#64748b",
                        }}
                      >
                        <span>Market Base Value:</span>
                        <strong style={{ color: "#0f172a", fontWeight: 700 }}>
                          {prop.estimated_price_inr ? formatINR(prop.estimated_price_inr) : "—"}
                        </strong>
                      </div>
                      {prop.adjusted_price_inr && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            paddingTop: "5px",
                            marginTop: "2px",
                            borderTop: "1px dashed #cbd5e1",
                            color: "#059669",
                            fontWeight: 700,
                          }}
                        >
                          <span>Climate-Adjusted:</span>
                          <span style={{ fontSize: "12px" }}>{formatINR(prop.adjusted_price_inr)}</span>
                        </div>
                      )}
                    </div>

                    {/* One-Click Action Button to Run Full Appraisal in Sidebar */}
                    <button
                      type="button"
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        background: "#2563eb",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        boxShadow: "0 2px 6px rgba(37, 99, 235, 0.3)",
                        transition: "all 0.15s ease",
                      }}
                      onClick={() => {
                        if (onSelectProperty) {
                          onSelectProperty(prop);
                        }
                      }}
                    >
                      <span>⚡ Evaluate in Valuation Panel</span>
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* Selected Property Teardrop Red Pin matching reference mockup */}
        <Marker position={currentCoords} icon={propertyPinIcon}>
          <Popup>
            <div style={{ textAlign: "center", padding: "6px 4px", fontFamily: "system-ui, sans-serif" }}>
              <div style={{ display: "inline-block", background: "#fee2e2", color: "#dc2626", fontSize: "10px", fontWeight: 700, padding: "2px 6px", borderRadius: "4px", marginBottom: "4px" }}>
                Target Subject Property
              </div>
              <div style={{ fontWeight: 700, fontSize: "13px", color: "#0f172a" }}>
                {currentLabel}
              </div>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "3px" }}>
                {currentCoords[0].toFixed(4)}°N, {currentCoords[1].toFixed(4)}°E
              </div>
              <div style={{ fontSize: "10px", color: "#059669", marginTop: "4px", fontWeight: 600 }}>
                ● Real-Time Climate AI Appraisal Active
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};
