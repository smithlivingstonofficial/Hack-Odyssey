"use client";

import React, { useState } from "react";
import { ValueImpactBreakdownCard } from "@/components/dashboard/ValueImpactBreakdownCard";
import { ClimateRiskOverTimeCard } from "@/components/dashboard/ClimateRiskOverTimeCard";
import { FutureScenarioCard } from "@/components/dashboard/FutureScenarioCard";
import { ResilienceSimulator } from "@/components/dashboard/ResilienceSimulator";
import { PropertyInput, ValuationResult, RiskScore, ClimateFeatures, formatINR } from "@/lib/api";

interface AnalyticsViewProps {
  input?: PropertyInput;
  onChangeInput?: (updated: Partial<PropertyInput>) => void;
  onApply?: () => void;
  isLoading?: boolean;
  valuation?: ValuationResult | null;
  riskScores?: RiskScore[];
  features?: ClimateFeatures | null;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  input,
  onChangeInput,
  onApply,
  isLoading = false,
  valuation,
  riskScores = [],
  features,
}) => {
  const [localInput, setLocalInput] = useState<PropertyInput>(
    input || {
      address: "Anna Nagar, Chennai, Tamil Nadu",
      latitude: 13.0827,
      longitude: 80.2198,
      property_type: "residential",
      area_sqft: 1200,
      market_rate_per_sqft: 6000,
      building_age: 5,
      num_floors: 2,
      has_basement: false,
      flood_protection: false,
      cool_roof: false,
      storm_resistant: false,
    }
  );

  const activeInput = input || localInput;
  const handleChange = onChangeInput || ((u: Partial<PropertyInput>) => setLocalInput((prev: PropertyInput) => ({ ...prev, ...u })));
  const handleApply = onApply || (() => {});

  const floodScore = riskScores.find((r) => r.hazard === "flood")?.score ?? 72;
  const heatScore = riskScores.find((r) => r.hazard === "heat")?.score ?? 58;
  const cycloneScore = riskScores.find((r) => r.hazard === "cyclone")?.score ?? 61;

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", paddingBottom: "40px", fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
          Institutional Risk Analytics & Modeling
        </h1>
        <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0 0" }}>
          Multi-decade projections, capital expenditure resilience ROI, and portfolio impairment modeling.
        </p>
      </div>

      {/* Row 1: Donut Breakdown + Future Scenarios */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "20px", marginBottom: "20px" }}>
        <ValueImpactBreakdownCard
          valuation={valuation}
          floodScore={floodScore}
          heatScore={heatScore}
          cycloneScore={cycloneScore}
        />

        <FutureScenarioCard />
      </div>

      {/* Row 2: Multi-Decade Projection Trend Line Chart */}
      <div style={{ marginBottom: "20px" }}>
        <ClimateRiskOverTimeCard />
      </div>

      {/* Row 3: Building Resilience Simulation */}
      <div>
        <ResilienceSimulator
          input={activeInput}
          onChangeInput={handleChange}
          onApply={handleApply}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
