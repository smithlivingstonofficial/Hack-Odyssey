"use client";

import React from "react";
import { AnalysisResponse, formatINR } from "@/lib/api";
import {
  FileText,
  Printer,
  X,
  Waves,
  ThermometerSun,
  Wind,
  ShieldCheck,
  Building,
  CheckCircle2,
} from "lucide-react";

interface ExecutiveReportModalProps {
  analysis: AnalysisResponse;
  onClose: () => void;
}

const renderHazardIcon = (hazard: string) => {
  switch (hazard.toLowerCase()) {
    case "flood":
      return <Waves className="w-4 h-4 text-blue-600 inline mr-1.5" />;
    case "heat":
      return <ThermometerSun className="w-4 h-4 text-amber-600 inline mr-1.5" />;
    case "cyclone":
      return <Wind className="w-4 h-4 text-purple-600 inline mr-1.5" />;
    default:
      return null;
  }
};

export const ExecutiveReportModal: React.FC<ExecutiveReportModalProps> = ({
  analysis,
  onClose,
}) => {
  const {
    property_input,
    climate_features,
    risk_scores,
    valuation,
    overall_risk_score,
    overall_risk_category,
  } = analysis;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(6px)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "850px",
          maxHeight: "90vh",
          backgroundColor: "#ffffff",
          color: "#0f172a",
          border: "1px solid #cbd5e1",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#f8fafc",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: 32, height: 32, borderRadius: 6, background: "#eff6ff", border: "1px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb" }}>
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                Climate Property Valuation Assessment Memorandum
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500 }}>
                TerraValue Tamil Nadu • Geospatial & Physical Climate Risk Ledger
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handlePrint}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Export PDF</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onClose}
              style={{ padding: "6px" }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Report Printable Content */}
        <div
          style={{
            padding: "28px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            backgroundColor: "#ffffff",
          }}
        >
          {/* Certificate Header Banner */}
          <div
            style={{
              padding: "18px 22px",
              borderRadius: "var(--radius-md)",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: "20px",
            }}
          >
            <div>
              <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", fontWeight: 700 }}>
                Evaluated Real Estate Asset
              </div>
              <div style={{ fontSize: "18px", fontWeight: 700, marginTop: "4px", color: "#0f172a" }}>
                {property_input.address || "Target Asset Coordinates"}
              </div>
              <div style={{ fontSize: "12px", color: "#475569", marginTop: "4px" }}>
                Classification: <strong style={{ textTransform: "capitalize", color: "#0f172a" }}>{property_input.property_type}</strong> • Floor Area:{" "}
                <strong style={{ color: "#0f172a" }}>{property_input.area_sqft.toLocaleString()} sq.ft</strong> • Position:{" "}
                <span style={{ fontFamily: "var(--font-mono)", color: "#2563eb", fontWeight: 600 }}>
                  {property_input.latitude.toFixed(4)}°N, {property_input.longitude.toFixed(4)}°E
                </span>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", fontWeight: 700 }}>
                Composite Risk Rating
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 800,
                  marginTop: "4px",
                  color:
                    overall_risk_score > 60
                      ? "#e11d48"
                      : overall_risk_score > 35
                      ? "#d97706"
                      : "#059669",
                }}
              >
                {overall_risk_category}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>
                Index: {overall_risk_score}/100
              </div>
            </div>
          </div>

          {/* Financial Valuation Balance Sheet */}
          <div>
            <div style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px", borderBottom: "1.5px solid #e2e8f0", paddingBottom: "6px", color: "#0f172a" }}>
              1. Financial Valuation Adjustment Schedule
            </div>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "12px",
              }}
            >
              <thead>
                <tr style={{ background: "#f8fafc", textAlign: "left" }}>
                  <th style={{ padding: "8px 10px", borderBottom: "1px solid #cbd5e1", color: "#334155" }}>Valuation Metric</th>
                  <th style={{ padding: "8px 10px", borderBottom: "1px solid #cbd5e1", color: "#334155" }}>Reference / Observed Factor</th>
                  <th style={{ padding: "8px 10px", borderBottom: "1px solid #cbd5e1", textAlign: "right", color: "#334155" }}>Financial Impact (INR)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: "10px", borderBottom: "1px solid #e2e8f0", fontWeight: 600, color: "#0f172a" }}>
                    Unadjusted Base Value
                  </td>
                  <td style={{ padding: "10px", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
                    {property_input.area_sqft} sq.ft @ ₹{property_input.market_rate_per_sqft ? property_input.market_rate_per_sqft.toLocaleString('en-IN') : Math.round(valuation.base_value_inr / (property_input.area_sqft || 1)).toLocaleString('en-IN')}/sq.ft benchmark
                  </td>
                  <td style={{ padding: "10px", borderBottom: "1px solid #e2e8f0", textAlign: "right", fontWeight: 700, color: "#0f172a" }}>
                    {formatINR(valuation.base_value_inr)}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "10px", borderBottom: "1px solid #e2e8f0", fontWeight: 600 }}>
                    <Waves className="w-3.5 h-3.5 text-blue-600 inline mr-1.5" />
                    Flood Inundation Haircut
                  </td>
                  <td style={{ padding: "10px", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
                    {valuation.flood_impact.explanation}
                  </td>
                  <td style={{ padding: "10px", borderBottom: "1px solid #e2e8f0", textAlign: "right", color: "#e11d48", fontWeight: 600 }}>
                    -{formatINR(valuation.flood_impact.impact_inr)} (-{valuation.flood_impact.impact_percentage}%)
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "10px", borderBottom: "1px solid #e2e8f0", fontWeight: 600 }}>
                    <ThermometerSun className="w-3.5 h-3.5 text-amber-600 inline mr-1.5" />
                    Heat & Thermal Stress Haircut
                  </td>
                  <td style={{ padding: "10px", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
                    {valuation.heat_impact.explanation}
                  </td>
                  <td style={{ padding: "10px", borderBottom: "1px solid #e2e8f0", textAlign: "right", color: "#e11d48", fontWeight: 600 }}>
                    -{formatINR(valuation.heat_impact.impact_inr)} (-{valuation.heat_impact.impact_percentage}%)
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "10px", borderBottom: "1px solid #e2e8f0", fontWeight: 600 }}>
                    <Wind className="w-3.5 h-3.5 text-purple-600 inline mr-1.5" />
                    Cyclone Gale & Surge Haircut
                  </td>
                  <td style={{ padding: "10px", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
                    {valuation.cyclone_impact.explanation}
                  </td>
                  <td style={{ padding: "10px", borderBottom: "1px solid #e2e8f0", textAlign: "right", color: "#e11d48", fontWeight: 600 }}>
                    -{formatINR(valuation.cyclone_impact.impact_inr)} (-{valuation.cyclone_impact.impact_percentage}%)
                  </td>
                </tr>
                <tr style={{ background: "#ecfdf5", fontWeight: 700 }}>
                  <td style={{ padding: "12px 10px", color: "#065f46", fontSize: "13px" }}>
                    Climate-Adjusted Fair Market Value
                  </td>
                  <td style={{ padding: "12px 10px", color: "#047857" }}>
                    Total physical hazard discount: -{valuation.total_climate_impact_percentage.toFixed(1)}%
                  </td>
                  <td style={{ padding: "12px 10px", textAlign: "right", color: "#065f46", fontSize: "16px", fontWeight: 800 }}>
                    {formatINR(valuation.adjusted_value_inr)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Hazard Attribution Details */}
          <div>
            <div style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px", borderBottom: "1.5px solid #e2e8f0", paddingBottom: "6px", color: "#0f172a" }}>
              2. Scientific Hazard Attribution & Drivers
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
              {risk_scores.map((r) => (
                <div
                  key={r.hazard}
                  style={{
                    padding: "14px",
                    background: "#f8fafc",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", fontWeight: 700, textTransform: "capitalize", color: "#0f172a", fontSize: "12px" }}>
                      {renderHazardIcon(r.hazard)}
                      <span>{r.hazard}</span>
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "1px 6px",
                        borderRadius: "3px",
                        background: r.score > 60 ? "#fee2e2" : r.score > 35 ? "#fef3c7" : "#dcfce7",
                        color: r.score > 60 ? "#991b1b" : r.score > 35 ? "#92400e" : "#166534",
                      }}
                    >
                      {r.score.toFixed(0)}/100
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "11px", color: "#475569" }}>
                    {r.drivers.slice(0, 3).map((d, i) => (
                      <div key={i}>
                        • <strong>{d.factor}:</strong> {d.value}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regulatory Disclaimer */}
          <div className="disclaimer" style={{ marginTop: "4px" }}>
            <strong>Institutional Valuation Notice:</strong> {analysis.analysis_disclaimer} Spatial analysis calibrated against
            Tamil Nadu State Disaster Management Authority (TNSDMA) flood hazard maps, Open-Meteo observations, NOAA IBTrACS historical cyclone tracks,
            and CMDA / DTCP urban resilience baselines.
          </div>
        </div>
      </div>
    </div>
  );
};
