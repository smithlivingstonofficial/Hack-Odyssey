"use client";

import React, { useState } from "react";
import { EmbeddedMapCard } from "@/components/dashboard/EmbeddedMapCard";
import { MapLayersCard } from "@/components/dashboard/MapLayersCard";
import { HazardLayerType } from "@/components/map/MapLayerControl";
import { RealPropertyAsset } from "@/lib/api";

interface RiskMapsViewProps {
  targetCoords: [number, number];
  locationLabel: string;
  onSelectCoords: (lat: number, lon: number, label?: string) => void;
  onSelectProperty?: (property: RealPropertyAsset) => void;
  activeCity?: string;
  activeHazard: HazardLayerType;
  onChangeHazard: (hazard: HazardLayerType) => void;
}

export const RiskMapsView: React.FC<RiskMapsViewProps> = ({
  targetCoords,
  locationLabel,
  onSelectCoords,
  onSelectProperty,
  activeCity,
  activeHazard,
  onChangeHazard,
}) => {
  return (
    <div style={{ maxWidth: "1500px", margin: "0 auto", paddingBottom: "32px", fontFamily: "var(--font-sans)" }}>
      {/* Top Header */}
      <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
            Risk Maps & Spatial Cadastre
          </h1>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0 0" }}>
            High-resolution physical hazard overlays, cadastral guideline valuations, and flood basin contours.
          </p>
        </div>
      </div>

      {/* Main Large Map Canvas (620px) */}
      <div style={{ marginBottom: "18px" }}>
        <EmbeddedMapCard
          targetCoords={targetCoords}
          locationLabel={locationLabel}
          onSelectCoords={onSelectCoords}
          onSelectProperty={onSelectProperty}
          activeCity={activeCity}
          activeHazard={activeHazard}
          onChangeHazard={onChangeHazard}
        />
      </div>

      {/* Bottom Layer Selector matching reference mockup */}
      <div>
        <MapLayersCard
          activeHazard={activeHazard}
          onChangeHazard={onChangeHazard}
        />
      </div>
    </div>
  );
};
