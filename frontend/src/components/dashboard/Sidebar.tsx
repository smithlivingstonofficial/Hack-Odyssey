"use client";

import React, { useState } from "react";
import {
  MapPin,
  Search,
  Sliders,
  Play,
  AlertCircle,
  TrendingDown,
  Layers,
  Shield,
  Activity,
  Compass,
} from "lucide-react";
import {
  PropertyInput,
  AnalysisResponse,
  geocodeAddress,
} from "@/lib/api";
import { ValuationCard } from "./ValuationCard";
import { RiskCards } from "./RiskCards";
import { ExplainabilityPanel } from "./ExplainabilityPanel";
import { ClimateFeaturesGrid } from "./ClimateFeaturesGrid";
import { ResilienceSimulator } from "./ResilienceSimulator";

interface SidebarProps {
  input: PropertyInput;
  onChangeInput: (updated: Partial<PropertyInput>) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  analysis: AnalysisResponse | null;
  error: string | null;
  onSelectCoordinates: (lat: number, lon: number, address?: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  input,
  onChangeInput,
  onAnalyze,
  isLoading,
  analysis,
  error,
  onSelectCoordinates,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedHazard, setSelectedHazard] = useState<string | null>("flood");
  const [activeTab, setActiveTab] = useState<"analysis" | "features" | "resilience">("analysis");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    try {
      const result = await geocodeAddress(searchQuery);
      onSelectCoordinates(result.latitude, result.longitude, result.display_name);
    } catch (err: any) {
      setSearchError(err.message || "Failed to locate address");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <aside className="sidebar">
      {/* Search & Location Section */}
      <div className="sidebar-section">
        <div className="section-title">
          <MapPin className="section-icon text-blue-600" />
          <span>Target Asset Location</span>
        </div>

        <form onSubmit={handleSearch} className="search-box-wrapper">
          <div className="search-input-group">
            <Search className="search-input-icon" />
            <input
              type="text"
              className="search-field"
              placeholder="Search locality, street, or PIN code (e.g. Mylapore)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-sm search-submit-btn"
            disabled={isSearching}
          >
            {isSearching ? "Locating..." : "Locate"}
          </button>
        </form>

        {searchError && (
          <div className="form-feedback-error">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{searchError}</span>
          </div>
        )}

        {/* Current Coordinates Banner */}
        <div className="coords-banner">
          <span className="coords-label">Coordinates</span>
          <span className="coords-value">
            {input.latitude.toFixed(4)}°N, {input.longitude.toFixed(4)}°E
          </span>
        </div>
      </div>

      {/* Property Specs Form */}
      <div className="sidebar-section">
        <div className="section-title">
          <Sliders className="section-icon text-slate-700" />
          <span>Asset Characteristics</span>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Asset Classification</label>
            <select
              className="form-select"
              value={input.property_type}
              onChange={(e) =>
                onChangeInput({ property_type: e.target.value as any })
              }
            >
              <option value="residential">Residential Villa / Independent</option>
              <option value="apartment">Multi-Family Apartment / Flat</option>
              <option value="commercial">Commercial / Corporate Office</option>
              <option value="industrial">Industrial / Warehouse</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Built-Up Area (sq.ft)</label>
            <input
              type="number"
              className="form-input"
              value={input.area_sqft}
              min={100}
              step={100}
              onChange={(e) =>
                onChangeInput({ area_sqft: parseFloat(e.target.value) || 0 })
              }
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Guideline Rate (₹ / sq.ft)</label>
            <input
              type="number"
              className="form-input"
              value={input.market_rate_per_sqft || ""}
              placeholder="Guideline rate (₹/sq.ft)"
              min={500}
              step={500}
              onChange={(e) =>
                onChangeInput({
                  market_rate_per_sqft: parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">Structure Age (Years)</label>
            <input
              type="number"
              className="form-input"
              value={input.building_age || ""}
              placeholder="e.g. 5"
              min={0}
              max={100}
              onChange={(e) =>
                onChangeInput({
                  building_age: parseInt(e.target.value) || 0,
                })
              }
            />
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary run-valuation-btn"
          onClick={onAnalyze}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Activity className="w-4 h-4 animate-spin" />
              <span>Orchestrating GIS & ML Pipeline...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Evaluate Climate Risk & Valuation</span>
            </>
          )}
        </button>

        {error && (
          <div className="form-feedback-error" style={{ marginTop: "10px" }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Loading State Overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
          <div className="loading-text">
            <strong>Orchestrating Earth Observation Pipeline</strong>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
              SRTM Elevation • CHIRPS Extreme Rainfall • MODIS Thermal • NOAA IBTrACS
            </div>
          </div>
        </div>
      )}

      {/* Evaluation Results Section */}
      {analysis && !isLoading && (
        <div className="sidebar-section results-section">
          {/* Tab Navigation Segmented Control */}
          <div className="segmented-tab-control">
            <button
              type="button"
              className={`segmented-tab-btn ${activeTab === "analysis" ? "active" : ""}`}
              onClick={() => setActiveTab("analysis")}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Valuation</span>
            </button>
            <button
              type="button"
              className={`segmented-tab-btn ${activeTab === "features" ? "active" : ""}`}
              onClick={() => setActiveTab("features")}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>GIS Features</span>
            </button>
            <button
              type="button"
              className={`segmented-tab-btn ${activeTab === "resilience" ? "active" : ""}`}
              onClick={() => setActiveTab("resilience")}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Resilience</span>
            </button>
          </div>

          {activeTab === "analysis" && (
            <>
              {/* Climate-Adjusted Valuation Card */}
              <ValuationCard valuation={analysis.valuation} />

              {/* Multi-hazard Risk Gauge and Cards */}
              <RiskCards
                riskScores={analysis.risk_scores}
                overallScore={analysis.overall_risk_score}
                overallCategory={analysis.overall_risk_category}
                selectedHazard={selectedHazard}
                onSelectHazard={(h) => setSelectedHazard(h)}
              />

              {/* Explainability attribution */}
              <ExplainabilityPanel
                riskScores={analysis.risk_scores}
                selectedHazard={selectedHazard}
                onSelectHazard={(h) => setSelectedHazard(h)}
              />
            </>
          )}

          {activeTab === "features" && (
            <ClimateFeaturesGrid features={analysis.climate_features} />
          )}

          {activeTab === "resilience" && (
            <ResilienceSimulator
              input={input}
              onChangeInput={onChangeInput}
              onApply={onAnalyze}
              isLoading={isLoading}
            />
          )}

          {/* Model Disclaimer */}
          <div className="disclaimer">
            <strong>Institutional Model:</strong> {analysis.analysis_disclaimer}
          </div>
        </div>
      )}

      {/* Empty State before first analysis */}
      {!analysis && !isLoading && (
        <div className="welcome-state">
          <div className="welcome-icon-box">
            <Compass className="w-8 h-8 text-blue-600" />
          </div>
          <div className="welcome-title">Tamil Nadu Climate Risk Ledger</div>
          <div className="welcome-desc">
            Select a macro hub above, search any locality or PIN code, or click directly on the interactive GIS map to begin multi-hazard physical risk appraisal.
          </div>
        </div>
      )}
    </aside>
  );
};
