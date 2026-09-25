"use client";

import React from "react";
import { RiskScore, getRiskClass, getRiskColor } from "@/lib/api";
import { Waves, ThermometerSun, Wind, AlertTriangle, ShieldCheck } from "lucide-react";

interface RiskCardsProps {
  riskScores: RiskScore[];
  overallScore: number;
  overallCategory: string;
  selectedHazard: string | null;
  onSelectHazard: (hazard: string) => void;
}

const renderHazardIcon = (hazard: string) => {
  switch (hazard.toLowerCase()) {
    case "flood":
      return <Waves className="w-4 h-4 text-blue-600 flex-shrink-0" />;
    case "heat":
      return <ThermometerSun className="w-4 h-4 text-amber-600 flex-shrink-0" />;
    case "cyclone":
      return <Wind className="w-4 h-4 text-purple-600 flex-shrink-0" />;
    default:
      return <AlertTriangle className="w-4 h-4 text-slate-600 flex-shrink-0" />;
  }
};

export const RiskCards: React.FC<RiskCardsProps> = ({
  riskScores,
  overallScore,
  overallCategory,
  selectedHazard,
  onSelectHazard,
}) => {
  // SVG circular meter calculations
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;
  const overallColor = getRiskColor(overallCategory);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Overall Score Dial */}
      <div className="card overall-risk animate-in">
        <div className="risk-meter">
          <svg viewBox="0 0 120 120">
            <circle
              className="risk-meter-bg"
              cx="60"
              cy="60"
              r={radius}
            />
            <circle
              className="risk-meter-fill"
              cx="60"
              cy="60"
              r={radius}
              stroke={overallColor}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <div className="risk-meter-text">
            <div className="risk-meter-score" style={{ color: overallColor }}>
              {overallScore.toFixed(0)}
            </div>
            <div className="risk-meter-label">Risk Index</div>
          </div>
        </div>

        <div
          className={`risk-category ${getRiskClass(overallCategory)}`}
          style={{ display: "inline-block", padding: "4px 14px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.04em" }}
        >
          {overallCategory} RISK PROFILE
        </div>
        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px" }}>
          Composite XGBoost multi-hazard vulnerability index
        </div>
      </div>

      {/* Individual Hazard Cards */}
      <div className="risk-cards">
        {riskScores.map((r) => {
          const isSelected = selectedHazard === r.hazard;
          return (
            <div
              key={r.hazard}
              className={`risk-card ${r.hazard} animate-in ${isSelected ? "selected-card" : ""}`}
              onClick={() => onSelectHazard(r.hazard)}
            >
              <div className="risk-card-header">
                <div className="risk-card-title">
                  <span className="hazard-icon-wrapper">{renderHazardIcon(r.hazard)}</span>
                  <span style={{ textTransform: "capitalize", fontWeight: 600 }}>
                    {r.hazard} Vulnerability
                  </span>
                </div>
                <span className={`risk-category ${getRiskClass(r.category)}`}>
                  {r.category}
                </span>
              </div>

              <div className="risk-score-bar">
                <div
                  className="risk-score-fill"
                  style={{ width: `${r.score}%` }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "11px",
                  color: "var(--text-muted)",
                }}
              >
                <span>Confidence: {(r.confidence * 100).toFixed(0)}%</span>
                <span className="risk-score-value">
                  Score: <strong>{r.score.toFixed(1)}</strong> / 100
                </span>
              </div>

              {/* Primary Risk Driver snippet */}
              {r.drivers.length > 0 && (
                <div className="risk-driver-preview">
                  <span
                    className="risk-driver-dot"
                    style={{
                      backgroundColor:
                        r.drivers[0].impact === "high"
                          ? "var(--risk-high)"
                          : "var(--risk-moderate)",
                    }}
                  />
                  <span>
                    Driver: <strong>{r.drivers[0].factor}</strong> ({r.drivers[0].value})
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
