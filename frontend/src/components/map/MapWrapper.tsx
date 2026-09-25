"use client";

import dynamic from "next/dynamic";
import React from "react";
import type { MapComponentProps } from "./MapComponent";

const MapComponent = dynamic(
  () => import("./MapComponent").then((mod) => mod.MapComponent),
  {
    ssr: false,
    loading: () => (
      <div
        className="map-container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f1f5f9",
          width: "100%",
          height: "100%",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div className="loading-spinner" style={{ margin: "0 auto 16px" }} />
          <div style={{ color: "#475569", fontSize: "14px", fontWeight: 600 }}>
            Loading Interactive GIS Map & Open-Meteo Layers...
          </div>
        </div>
      </div>
    ),
  }
);

export const MapWrapper: React.FC<MapComponentProps> = (props) => {
  return <MapComponent {...props} />;
};
