"use client";

import React, { useState, useCallback, useEffect } from "react";
import { TopHeader } from "@/components/layout/TopHeader";
import { SidebarNav, NavTabType } from "@/components/layout/SidebarNav";
import { EmbeddedMapCard } from "@/components/dashboard/EmbeddedMapCard";
import { HeroValuationCard } from "@/components/dashboard/HeroValuationCard";
import { PropertyOverviewCard } from "@/components/dashboard/PropertyOverviewCard";
import { SelectedPropertyCard } from "@/components/dashboard/SelectedPropertyCard";
import { ClimateValuationCard } from "@/components/dashboard/ClimateValuationCard";
import { ClimateRiskScoreCard } from "@/components/dashboard/ClimateRiskScoreCard";
import { KeyInsightsCard } from "@/components/dashboard/KeyInsightsCard";
import { ValueImpactBreakdownCard } from "@/components/dashboard/ValueImpactBreakdownCard";
import { ClimateRiskOverTimeCard } from "@/components/dashboard/ClimateRiskOverTimeCard";
import { MapLayersCard } from "@/components/dashboard/MapLayersCard";
import { FutureScenarioCard } from "@/components/dashboard/FutureScenarioCard";
import { ExecutiveReportModal } from "@/components/report/ExecutiveReportModal";
import { HazardLayerType } from "@/components/map/MapLayerControl";
import { SavedPropertiesView } from "@/components/views/SavedPropertiesView";
import { ComparisonView } from "@/components/views/ComparisonView";
import { RiskMapsView } from "@/components/views/RiskMapsView";
import { ReportsView } from "@/components/views/ReportsView";
import { AnalyticsView } from "@/components/views/AnalyticsView";
import { LearnView } from "@/components/views/LearnView";
import { SettingsView } from "@/components/views/SettingsView";
import {
  PropertyInput,
  AnalysisResponse,
  RealPropertyAsset,
  analyzeProperty,
  geocodeAddress,
  reverseGeocodeAddress,
  resolveTamilNaduLocality,
} from "@/lib/api";
import { X, Play, Loader2, Sliders } from "lucide-react";

export default function DashboardPage() {
  const [activeNav, setActiveNav] = useState<NavTabType>("dashboard");
  const [activeTopTab, setActiveTopTab] = useState<string>("valuation");
  const [activeHazard, setActiveHazard] = useState<HazardLayerType>("thermal");

  const [input, setInput] = useState<PropertyInput>({
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
  });

  const [locationLabel, setLocationLabel] = useState<string>("Anna Nagar, Chennai, Tamil Nadu");
  const [activeCity, setActiveCity] = useState<string>("Chennai");
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // Run full climate risk analysis on mount or update
  const runAnalysis = useCallback(async (currentInput: PropertyInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeProperty(currentInput);
      setAnalysis(result);
    } catch (err: any) {
      console.warn("Valuation analysis notice:", err);
      // Keep running gracefully with calculated estimates
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial analysis on first load
  useEffect(() => {
    runAnalysis(input);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Search location handler
  const handleSearchLocation = async (query: string) => {
    setIsSearching(true);
    try {
      const geo = await geocodeAddress(query);
      const label = geo.display_name || query;
      setLocationLabel(label);

      let marketRate = input.market_rate_per_sqft;
      const lower = label.toLowerCase();
      if (lower.includes("madurai")) marketRate = 5285;
      else if (lower.includes("anna nagar")) marketRate = 6000;
      else if (lower.includes("coimbatore")) marketRate = 6500;
      else if (lower.includes("trichy") || lower.includes("tiruchirappalli")) marketRate = 4500;
      else if (lower.includes("cuddalore")) marketRate = 3600;
      else if (lower.includes("omr") || lower.includes("sholinganallur")) marketRate = 7000;
      else if (lower.includes("velachery")) marketRate = 8000;
      else if (lower.includes("marina") || lower.includes("triplicane")) marketRate = 12000;
      else if (lower.includes("t nagar")) marketRate = 13000;

      const updated: PropertyInput = {
        ...input,
        latitude: geo.latitude,
        longitude: geo.longitude,
        address: label,
        market_rate_per_sqft: marketRate,
      };
      setInput(updated);
      runAnalysis(updated);
    } catch (err: any) {
      console.warn("Search location fallback:", err);
    } finally {
      setIsSearching(false);
    }
  };

  // Select coordinates from map click
  const handleSelectCoordinates = useCallback((lat: number, lon: number, label?: string) => {
    // If no label or label is raw coordinate string, resolve real Tamil Nadu locality
    const isCoordOnly = !label || /^\s*\d+\.\d+\s*°?\s*[NSEW]?/i.test(label) || label.includes("°N") || label.includes("°E");
    const localResolved = resolveTamilNaduLocality(lat, lon);
    const initialDisplay = isCoordOnly ? localResolved.display_name : label;

    setLocationLabel(initialDisplay);

    let marketRate = input.market_rate_per_sqft;
    const lower = initialDisplay.toLowerCase();
    if (lower.includes("madurai")) marketRate = 5285;
    else if (lower.includes("kovilpatti") || lower.includes("sattur")) marketRate = 5285;
    else if (lower.includes("sivakasi")) marketRate = 3200;
    else if (lower.includes("anna nagar")) marketRate = 6000;
    else if (lower.includes("coimbatore")) marketRate = 6500;
    else if (lower.includes("trichy") || lower.includes("tiruchirappalli")) marketRate = 4500;
    else if (lower.includes("cuddalore")) marketRate = 3600;
    else if (lower.includes("omr") || lower.includes("sholinganallur")) marketRate = 7000;
    else if (lower.includes("velachery")) marketRate = 8000;
    else if (lower.includes("marina") || lower.includes("triplicane")) marketRate = 12000;
    else if (lower.includes("t nagar")) marketRate = 13000;

    const updated: PropertyInput = {
      ...input,
      latitude: lat,
      longitude: lon,
      address: initialDisplay,
      market_rate_per_sqft: marketRate,
    };
    setInput(updated);
    runAnalysis(updated);

    // Asynchronously refine with detailed reverse geocoding from backend / Nominatim
    if (isCoordOnly) {
      reverseGeocodeAddress(lat, lon)
        .then((geo) => {
          if (geo && geo.display_name && !geo.display_name.includes("°N")) {
            setLocationLabel(geo.display_name);
            setInput((prev) => ({
              ...prev,
              address: geo.display_name,
            }));
          }
        })
        .catch((e) => console.warn("Reverse geocode async notice:", e));
    }
  }, [input, runAnalysis]);

  // Select real property asset from map cadastre badges
  const handleSelectProperty = useCallback((prop: RealPropertyAsset) => {
    const label = `${prop.name}, Tamil Nadu`;
    setLocationLabel(label);
    const updated: PropertyInput = {
      ...input,
      address: label,
      latitude: prop.latitude,
      longitude: prop.longitude,
      property_type: prop.property_type,
      area_sqft: prop.estimated_area_sqft,
      market_rate_per_sqft: prop.guideline_rate_per_sqft,
      num_floors: prop.num_floors,
    };
    setInput(updated);
    runAnalysis(updated);
  }, [input, runAnalysis]);

  // City preset selection
  const handleSelectCity = async (city: string) => {
    setActiveCity(city);
    const cityCoords: Record<string, [number, number]> = {
      chennai: [13.0827, 80.2707],
      coimbatore: [11.0168, 76.9558],
      madurai: [9.9252, 78.1198],
      trichy: [10.8285, 78.6912],
      cuddalore: [11.7500, 79.7700],
    };
    const coords = cityCoords[city.toLowerCase()] || [13.0827, 80.2707];
    const label = `${city}, Tamil Nadu`;
    setLocationLabel(label);
    const updated: PropertyInput = {
      ...input,
      latitude: coords[0],
      longitude: coords[1],
      address: label,
    };
    setInput(updated);
    runAnalysis(updated);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column" }}>
      {/* Top Header Bar */}
      <TopHeader
        activeTopTab={activeTopTab}
        onChangeTopTab={(tab) => {
          setActiveTopTab(tab);
          if (tab === "home" || tab === "valuation") {
            setActiveNav("dashboard");
          } else if (tab === "map") {
            setActiveNav("risk-maps");
          } else if (tab === "reports") {
            setActiveNav("reports");
          } else if (tab === "about") {
            setActiveNav("learn");
          }
        }}
        onSearch={handleSearchLocation}
        locationLabel={locationLabel}
        isSearching={isSearching}
        activeCity={activeCity}
        onSelectCity={handleSelectCity}
      />

      {/* Main Body: Sidebar + Dashboard Canvas */}
      <div style={{ display: "flex", flex: 1 }}>
        {/* Left Navigation Sidebar */}
        <SidebarNav
          activeNav={activeNav}
          onChangeNav={(nav) => {
            if (nav === "new-assessment") {
              setIsEditModalOpen(true);
              return;
            }
            setActiveNav(nav);
            if (nav === "dashboard") setActiveTopTab("valuation");
            else if (nav === "risk-maps") setActiveTopTab("map");
            else if (nav === "reports") setActiveTopTab("reports");
            else if (nav === "learn") setActiveTopTab("about");
          }}
          onNewAssessment={() => setIsEditModalOpen(true)}
        />

        {/* Main Canvas Workspace */}
        <main
          style={{
            flex: 1,
            padding: "20px 24px 32px 24px",
            overflowY: "auto",
            maxWidth: "1600px",
            margin: "0 auto",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {activeNav === "saved" && (
            <SavedPropertiesView
              onSelectProperty={(propInput) => {
                setInput(propInput);
                setLocationLabel(propInput.address || "Anna Nagar, Chennai, Tamil Nadu");
                setActiveNav("dashboard");
                setActiveTopTab("valuation");
                runAnalysis(propInput);
              }}
              onViewOnMap={(lat, lon, address) => {
                handleSelectCoordinates(lat, lon, address);
                setActiveNav("risk-maps");
                setActiveTopTab("map");
              }}
              onCompare={() => {
                setActiveNav("comparison");
              }}
              onNewAssessment={() => setIsEditModalOpen(true)}
            />
          )}

          {activeNav === "comparison" && (
            <ComparisonView
              onSelectProperty={(propInput) => {
                setInput(propInput);
                setLocationLabel(propInput.address || "Anna Nagar, Chennai, Tamil Nadu");
                setActiveNav("dashboard");
                setActiveTopTab("valuation");
                runAnalysis(propInput);
              }}
            />
          )}

          {activeNav === "risk-maps" && (
            <RiskMapsView
              targetCoords={[input.latitude, input.longitude]}
              locationLabel={locationLabel}
              onSelectCoords={handleSelectCoordinates}
              onSelectProperty={handleSelectProperty}
              activeCity={activeCity}
              activeHazard={activeHazard}
              onChangeHazard={setActiveHazard}
            />
          )}

          {activeNav === "reports" && (
            <ReportsView
              input={input}
              valuation={analysis?.valuation}
              riskScores={analysis?.risk_scores}
              locationLabel={locationLabel}
              onBackToDashboard={() => {
                setActiveNav("dashboard");
                setActiveTopTab("valuation");
              }}
            />
          )}

          {activeNav === "analytics" && (
            <AnalyticsView
              input={input}
              onChangeInput={(updated) => setInput((prev) => ({ ...prev, ...updated }))}
              onApply={() => runAnalysis(input)}
              isLoading={isLoading}
              valuation={analysis?.valuation}
              riskScores={analysis?.risk_scores}
              features={analysis?.climate_features}
            />
          )}

          {activeNav === "learn" && <LearnView />}

          {activeNav === "settings" && (
            <SettingsView
              activeCity={activeCity}
              onSelectCity={handleSelectCity}
            />
          )}

          {activeNav === "dashboard" && (
            <>
              {/* SECTION 1: TOP ROW (Embedded Satellite Map on Left + Find Valuation Card on Right) */}
              <section
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.25fr 1.05fr",
                  gap: "18px",
                  marginBottom: "18px",
                  alignItems: "stretch",
                }}
              >
                {/* Left: Interactive Satellite GIS Map */}
                <EmbeddedMapCard
                  targetCoords={[input.latitude, input.longitude]}
                  locationLabel={locationLabel}
                  onSelectCoords={handleSelectCoordinates}
                  onSelectProperty={handleSelectProperty}
                  activeCity={activeCity}
                  activeHazard={activeHazard}
                  onChangeHazard={setActiveHazard}
                />

                {/* Right: Find Climate-Adjusted Value Form */}
                <HeroValuationCard
                  input={input}
                  onChangeInput={(updated) => setInput((prev) => ({ ...prev, ...updated }))}
                  onAnalyze={() => runAnalysis(input)}
                  isLoading={isLoading}
                  onSelectCoordinates={handleSelectCoordinates}
                />
              </section>

              {/* SECTION 2: MIDDLE ROW (3 Equal Cards: Property Overview, Climate Risk Score, Value Estimation) */}
              <section
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "18px",
                  marginBottom: "18px",
                  alignItems: "stretch",
                }}
              >
                {/* Middle 1: Property Overview with Architectural Vector Illustration */}
                <PropertyOverviewCard
                  input={input}
                  locationLabel={locationLabel}
                />

                {/* Middle 2: Overall Climate Risk Score (SVG Radial Gauge + Progress Bars) */}
                <ClimateRiskScoreCard
                  overallScore={analysis?.overall_risk_score ?? 72}
                  overallCategory={analysis?.overall_risk_category ?? "High Risk"}
                  riskScores={analysis?.risk_scores}
                  elevationM={analysis?.climate_features?.elevation_m ?? 8}
                />

                {/* Middle 3: Value Estimation Card */}
                <ClimateValuationCard
                  valuation={analysis?.valuation}
                  baseRate={input.market_rate_per_sqft}
                  areaSqft={input.area_sqft}
                />
              </section>

              {/* SECTION 3: THIRD ROW (Risk Layers on Left + Key Insights on Right) */}
              <section
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.55fr 1fr",
                  gap: "18px",
                  marginBottom: "18px",
                  alignItems: "stretch",
                }}
              >
                {/* Left: Risk Layers with 4 Textured GIS Cards */}
                <MapLayersCard
                  activeHazard={activeHazard}
                  onChangeHazard={setActiveHazard}
                  onViewAll={() => {
                    setActiveNav("risk-maps");
                    setActiveTopTab("map");
                  }}
                />

                {/* Right: Key Insights with Colored Vector Icons */}
                <KeyInsightsCard
                  features={analysis?.climate_features}
                  floodScore={analysis?.risk_scores?.find((r) => r.hazard === "flood")?.score ?? 72}
                  heatScore={analysis?.risk_scores?.find((r) => r.hazard === "heat")?.score ?? 58}
                  cycloneScore={analysis?.risk_scores?.find((r) => r.hazard === "cyclone")?.score ?? 61}
                />
              </section>

              {/* SECTION 4: ADVANCED PREDICTIVE VALUATION & SCENARIO MODELING */}
              <section
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1.15fr 1fr",
                  gap: "18px",
                  alignItems: "stretch",
                }}
              >
                {/* Value Impact Breakdown Donut Chart */}
                <ValueImpactBreakdownCard
                  valuation={analysis?.valuation}
                  floodScore={analysis?.risk_scores?.find((r) => r.hazard === "flood")?.score ?? 72}
                  heatScore={analysis?.risk_scores?.find((r) => r.hazard === "heat")?.score ?? 58}
                  cycloneScore={analysis?.risk_scores?.find((r) => r.hazard === "cyclone")?.score ?? 61}
                />

                {/* Climate Risk Over Time Line Projection */}
                <ClimateRiskOverTimeCard />

                {/* Future Scenarios Delta Card */}
                <FutureScenarioCard />
              </section>
            </>
          )}
        </main>
      </div>

      {/* QUICK ASSESSMENT & PROPERTY EDIT MODAL */}
      {isEditModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "480px",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              border: "1px solid #e2e8f0",
              fontFamily: "var(--font-sans)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Sliders style={{ width: 18, height: 18, color: "#2563eb" }} />
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Edit Property Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94a3b8" }}
              >
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>
                  Location Address / Locality
                </label>
                <input
                  type="text"
                  value={input.address}
                  onChange={(e) => setInput({ ...input, address: e.target.value })}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>
                    Built-Up Area (sq.ft)
                  </label>
                  <input
                    type="number"
                    value={input.area_sqft}
                    onChange={(e) => setInput({ ...input, area_sqft: parseFloat(e.target.value) || 0 })}
                    style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>
                    Property Type
                  </label>
                  <select
                    value={input.property_type}
                    onChange={(e) => setInput({ ...input, property_type: e.target.value as any })}
                    style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px" }}
                  >
                    <option value="residential">Residential</option>
                    <option value="apartment">Apartment</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industrial</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>
                    Market Rate (₹ / sq.ft)
                  </label>
                  <input
                    type="number"
                    value={input.market_rate_per_sqft || 6000}
                    onChange={(e) => setInput({ ...input, market_rate_per_sqft: parseFloat(e.target.value) || 0 })}
                    style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>
                    Structure Floors
                  </label>
                  <input
                    type="number"
                    value={input.num_floors || 2}
                    onChange={(e) => setInput({ ...input, num_floors: parseInt(e.target.value) || 1 })}
                    style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                setIsEditModalOpen(false);
                runAnalysis(input);
              }}
              style={{
                width: "100%",
                padding: "10px",
                background: "#2563eb",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              {isLoading ? <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> : <Play style={{ width: 14, height: 14 }} />}
              <span>Re-Evaluate Climate Valuation</span>
            </button>
          </div>
        </div>
      )}

      {/* Printable Executive Memorandum Modal */}
      {isReportOpen && analysis && (
        <ExecutiveReportModal
          analysis={analysis}
          onClose={() => setIsReportOpen(false)}
        />
      )}
    </div>
  );
}
