"use client";

import React, { useState } from "react";
import { RiskScore } from "@/lib/api";
import { Waves, ThermometerSun, Wind, Cpu, ChevronDown, ChevronRight } from "lucide-react";

interface ExplainabilityPanelProps {
  riskScores: RiskScore[];
  selectedHazard: string | null;
  onSelectHazard: (hazard: string) => void;
}

const renderHazardIcon = (hazard: string) => {
  switch (hazard.toLowerCase()) {
    case "flood":
      return <Waves className="w-3.5 h-3.5 text-blue-600" />;
    case "heat":
      return <ThermometerSun className="w-3.5 h-3.5 text-amber-600" />;
    case "cyclone":
      return <Wind className="w-3.5 h-3.5 text-purple-600" />;
    default:
      return null;
  }
};

export const ExplainabilityPanel: React.FC<ExplainabilityPanelProps> = ({
  riskScores,
  selectedHazard,
  onSelectHazard,
}) => {
  // Keep open sections map
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    flood: true,
    heat: false,
    cyclone: false,
  });

  const toggleSection = (hazard: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [hazard]: !prev[hazard],
    }));
    onSelectHazard(hazard);
  };

  return (
    <div className="card animate-in" style={{ padding: "16px" }}>
      <div className="section-title" style={{ marginBottom: "8px" }}>
        <Cpu className="section-icon text-indigo-600" />
        <span>Explainable Risk Attribution</span>
      </div>
      <div
        style={{
          fontSize: "11px",
          color: "var(--text-muted)",
          marginBottom: "14px",
          lineHeight: 1.5,
        }}
      >
        Feature contribution vectors explaining the mathematical basis for hazard vulnerability and valuation impact.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {riskScores.map((r) => {
          const isOpen = openSections[r.hazard];
          return (
            <div key={r.hazard} className="explain-panel">
              <div
                className="explain-header"
                onClick={() => toggleSection(r.hazard)}
              >
                <div className="explain-title">
                  <span className="hazard-icon-wrapper">{renderHazardIcon(r.hazard)}</span>
                  <span style={{ textTransform: "capitalize", fontWeight: 600 }}>
                    {r.hazard} Drivers ({r.drivers.length})
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    {r.score.toFixed(1)}/100
                  </span>
                  {isOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
              </div>

              {isOpen && (
                <div className="explain-body">
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {r.drivers.map((d, idx) => (
                      <div key={idx} className="driver-row">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "11px" }}>
                            {d.factor}
                          </span>
                          <span
                            className={`driver-badge ${d.impact}`}
                            style={{ textTransform: "uppercase", fontSize: "10px", padding: "1px 6px", borderRadius: "3px" }}
                          >
                            {d.impact} impact
                          </span>
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                          Observed Value: <strong style={{ color: "var(--text-secondary)" }}>{d.value}</strong>
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px", lineHeight: 1.4 }}>
                          {d.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
