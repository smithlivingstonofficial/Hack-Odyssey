"use client";

import React from "react";
import {
  Layers,
  FileText,
  Activity,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

interface NavbarProps {
  onSelectPreset: (city: string) => void;
  activeCity?: string;
  onOpenReport?: () => void;
  hasResult?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSelectPreset,
  activeCity,
  onOpenReport,
  hasResult,
}) => {
  return (
    <header className="navbar">
      {/* Brand & Identity */}
      <div className="navbar-brand">
        <div className="navbar-logo-icon">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
        </div>
        <div>
          <div className="navbar-title">
            <span>TerraValue</span>
            <span className="navbar-title-tag">Tamil Nadu</span>
          </div>
          <div className="navbar-subtitle">
            GIS & AI Climate-Adjusted Property Valuation
          </div>
        </div>
      </div>

      <div className="navbar-actions">
        {/* Tamil Nadu Hub Presets */}
        <div className="navbar-hubs-container">
          <span className="navbar-hubs-label">Macro Hubs:</span>
          {[
            { name: "Chennai", label: "Chennai", color: "#2563eb" },
            { name: "Coimbatore", label: "Coimbatore", color: "#059669" },
            { name: "Madurai", label: "Madurai", color: "#d97706" },
            { name: "Cuddalore", label: "Cuddalore", color: "#7c3aed" },
            { name: "Trichy", label: "Trichy", color: "#0284c7" },
          ].map((c) => {
            const isActive = activeCity?.toLowerCase() === c.name.toLowerCase();
            return (
              <button
                key={c.name}
                type="button"
                className={`hub-pill-btn ${isActive ? "active" : ""}`}
                onClick={() => onSelectPreset(c.name)}
              >
                {c.name}
              </button>
            );
          })}
        </div>

        {/* Live GIS Engine Status Badge */}
        <div className="status-indicator-badge">
          <span className="status-indicator-dot" />
          <span className="status-indicator-text">TNSDMA & Geospatial APIs Active</span>
        </div>

        {/* Executive Valuation Report Button */}
        {hasResult && onOpenReport && (
          <button
            type="button"
            className="btn btn-primary btn-sm btn-report-action"
            onClick={onOpenReport}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Executive Report</span>
          </button>
        )}
      </div>
    </header>
  );
};
