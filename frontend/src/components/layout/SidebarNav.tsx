"use client";

import React from "react";
import {
  LayoutDashboard,
  Bookmark,
  GitCompare,
  Map,
  FileText,
  BarChart3,
  GraduationCap,
  Settings,
  Plus,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export type NavTabType =
  | "new-assessment"
  | "dashboard"
  | "saved"
  | "comparison"
  | "risk-maps"
  | "reports"
  | "analytics"
  | "learn"
  | "settings";

interface SidebarNavProps {
  activeNav: NavTabType;
  onChangeNav: (nav: NavTabType) => void;
  onNewAssessment?: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeNav,
  onChangeNav,
  onNewAssessment,
}) => {
  const navItems: {
    id: NavTabType;
    label: string;
    icon: React.ElementType;
    badge?: string;
    badgeColor?: string;
    badgeBg?: string;
  }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    {
      id: "saved",
      label: "Saved Properties",
      icon: Bookmark,
      badge: "3",
      badgeColor: "#64748b",
      badgeBg: "#f1f5f9",
    },
    { id: "comparison", label: "Comparison", icon: GitCompare },
    { id: "risk-maps", label: "Risk Maps", icon: Map },
    {
      id: "reports",
      label: "Reports",
      icon: FileText,
      badge: "PDF",
      badgeColor: "#2563eb",
      badgeBg: "#eff6ff",
    },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "learn", label: "Learn", icon: GraduationCap },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside
      style={{
        width: "250px",
        minWidth: "250px",
        height: "calc(100vh - 68px)",
        background: "#ffffff",
        borderRight: "1px solid #e2e8f0",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "20px 14px 28px 14px",
        position: "sticky",
        top: "68px",
        zIndex: 40,
        fontFamily: "var(--font-sans)",
        boxSizing: "border-box",
      }}
    >
      <div>
        {/* Primary Action CTA Button: + New Assessment */}
        <button
          type="button"
          onClick={() => {
            onChangeNav("new-assessment");
            if (onNewAssessment) onNewAssessment();
          }}
          style={{
            width: "100%",
            padding: "11px 16px",
            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            color: "#ffffff",
            border: "none",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            boxShadow: "0 4px 14px rgba(37, 99, 235, 0.28)",
            marginBottom: "20px",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 6px 18px rgba(37, 99, 235, 0.38)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 14px rgba(37, 99, 235, 0.28)";
          }}
        >
          <Plus style={{ width: 16, height: 16, strokeWidth: 2.5 }} />
          <span>New Assessment</span>
        </button>

        {/* Navigation List */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeNav(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: isActive ? "1px solid #bfdbfe" : "1px solid transparent",
                  background: isActive ? "#eff6ff" : "transparent",
                  color: isActive ? "#1d4ed8" : "#475569",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: "13px",
                  cursor: "pointer",
                  width: "100%",
                  transition: "all 0.15s ease",
                  boxSizing: "border-box",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "#f8fafc";
                    e.currentTarget.style.color = "#0f172a";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#475569";
                  }
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Icon
                    style={{
                      width: 17,
                      height: 17,
                      color: isActive ? "#2563eb" : "#64748b",
                      flexShrink: 0,
                    }}
                  />
                  <span>{item.label}</span>
                </div>

                {/* Optional Badge */}
                {item.badge && (
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      color: item.badgeColor,
                      background: item.badgeBg,
                      padding: "2px 6px",
                      borderRadius: "6px",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Promo Box (Elevated Glassmorphic Card, Zero External Images) */}
      <div
        style={{
          borderRadius: "14px",
          background: "linear-gradient(180deg, #f0fdf4 0%, #e0f2fe 100%)",
          border: "1px solid #bfdbfe",
          padding: "16px 14px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          position: "relative",
          marginBottom: "16px",
          boxShadow: "0 2px 6px rgba(37, 99, 235, 0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              background: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              flexShrink: 0,
            }}
          >
            <ShieldCheck style={{ width: 16, height: 16 }} />
          </div>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              background: "#ecfdf5",
              color: "#059669",
              border: "1px solid #a7f3d0",
              padding: "2px 6px",
              borderRadius: "6px",
            }}
          >
            ● Model v2.4
          </span>
        </div>

        <div>
          <div style={{ fontSize: "12px", fontWeight: 800, color: "#0f172a", lineHeight: "1.35", marginBottom: "4px" }}>
            Smarter Properties for a Safer Tomorrow
          </div>
          <div style={{ fontSize: "11px", color: "#64748b", lineHeight: "1.4" }}>
            Climate-adjusted financial valuations for Tamil Nadu real estate.
          </div>
        </div>
      </div>
    </aside>
  );
};
