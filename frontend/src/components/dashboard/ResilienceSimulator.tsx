"use client";

import React from "react";
import { PropertyInput } from "@/lib/api";
import { ShieldCheck, Waves, SunMedium, Wind, CheckCircle2 } from "lucide-react";

interface ResilienceSimulatorProps {
  input: PropertyInput;
  onChangeInput: (updated: Partial<PropertyInput>) => void;
  onApply: () => void;
  isLoading: boolean;
}

export const ResilienceSimulator: React.FC<ResilienceSimulatorProps> = ({
  input,
  onChangeInput,
  onApply,
  isLoading,
}) => {
  return (
    <div className="card animate-in" style={{ padding: "16px" }}>
      <div className="section-title" style={{ marginBottom: "8px" }}>
        <ShieldCheck className="section-icon text-emerald-600" />
        <span>Resilience & Retrofit Simulation</span>
      </div>

      <div
        style={{
          fontSize: "11px",
          color: "var(--text-muted)",
          marginBottom: "14px",
          lineHeight: 1.5,
        }}
      >
        Simulate engineering retrofits and nature-based defenses to evaluate valuation recovery and risk haircut reduction.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <label className="form-checkbox">
          <input
            type="checkbox"
            checked={!!input.flood_protection}
            onChange={(e) =>
              onChangeInput({ flood_protection: e.target.checked })
            }
          />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 600, color: "var(--text-primary)", fontSize: "12px" }}>
              <Waves className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
              <span>Perimeter Flood Barrier & Sump Drainage</span>
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
              Reduces flood vulnerability haircut by up to 30%
            </div>
          </div>
        </label>

        <label className="form-checkbox">
          <input
            type="checkbox"
            checked={!!input.cool_roof}
            onChange={(e) => onChangeInput({ cool_roof: e.target.checked })}
          />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 600, color: "var(--text-primary)", fontSize: "12px" }}>
              <SunMedium className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <span>High-Albedo Cool Roof & Thermal Insulation</span>
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
              Decreases indoor thermal heat stress index by up to 25%
            </div>
          </div>
        </label>

        <label className="form-checkbox">
          <input
            type="checkbox"
            checked={!!input.storm_resistant}
            onChange={(e) =>
              onChangeInput({ storm_resistant: e.target.checked })
            }
          />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 600, color: "var(--text-primary)", fontSize: "12px" }}>
              <Wind className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
              <span>Impact Glazing & Reinforced Roofing Anchors</span>
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
              Mitigates high-velocity cyclone gale damage vulnerability
            </div>
          </div>
        </label>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          style={{ width: "100%", marginTop: "8px", fontWeight: 600, fontSize: "12px" }}
          onClick={onApply}
          disabled={isLoading}
        >
          {isLoading ? "Recalculating..." : "Apply Retrofits & Re-Evaluate Value"}
        </button>
      </div>
    </div>
  );
};
