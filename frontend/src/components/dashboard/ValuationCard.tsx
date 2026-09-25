"use client";

import React from "react";
import { ValuationResult, formatINR } from "@/lib/api";
import { Waves, ThermometerSun, Wind, TrendingDown } from "lucide-react";

interface ValuationCardProps {
  valuation: ValuationResult;
}

export const ValuationCard: React.FC<ValuationCardProps> = ({ valuation }) => {
  const retainedPct = Math.max(
    0,
    100 - valuation.total_climate_impact_percentage
  );

  return (
    <div className="valuation-card animate-in">
      <div className="valuation-header">
        <div className="valuation-label">Climate-Adjusted Property Value</div>
        <div className="valuation-amount">
          {formatINR(valuation.adjusted_value_inr)}
        </div>
        <div className="valuation-base">
          <span className="strikethrough">
            Baseline: {formatINR(valuation.base_value_inr)}
          </span>
          <span className="valuation-haircut-badge">
            -{valuation.total_climate_impact_percentage.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Visual Retained Equity Progress Bar */}
      <div className="equity-progress-section">
        <div className="equity-progress-labels">
          <span>Retained Equity: {retainedPct.toFixed(1)}%</span>
          <span>Climate Risk Discount: {valuation.total_climate_impact_percentage.toFixed(1)}%</span>
        </div>
        <div className="equity-progress-track">
          <div
            className="equity-progress-bar"
            style={{ width: `${retainedPct}%` }}
          />
        </div>
      </div>

      <div className="valuation-divider" />

      {/* Hazard Specific Impact Haircuts */}
      <div className="valuation-row">
        <span className="label">
          <Waves className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          <span>Flood Inundation Discount</span>
        </span>
        <span className="value negative">
          -{formatINR(valuation.flood_impact.impact_inr)} ({valuation.flood_impact.impact_percentage.toFixed(1)}%)
        </span>
      </div>

      <div className="valuation-row">
        <span className="label">
          <ThermometerSun className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          <span>Thermal & Heat Stress Discount</span>
        </span>
        <span className="value negative">
          -{formatINR(valuation.heat_impact.impact_inr)} ({valuation.heat_impact.impact_percentage.toFixed(1)}%)
        </span>
      </div>

      <div className="valuation-row">
        <span className="label">
          <Wind className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
          <span>Cyclone Gale & Surge Discount</span>
        </span>
        <span className="value negative">
          -{formatINR(valuation.cyclone_impact.impact_inr)} ({valuation.cyclone_impact.impact_percentage.toFixed(1)}%)
        </span>
      </div>

      <div className="valuation-row valuation-total">
        <span className="label total-label">
          <TrendingDown className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>Net Climate Risk Haircut</span>
        </span>
        <span className="value negative total-value">
          -{formatINR(valuation.total_climate_impact_inr)}
        </span>
      </div>
    </div>
  );
};
