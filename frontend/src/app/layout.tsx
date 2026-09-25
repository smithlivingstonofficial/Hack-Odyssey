import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "TerraValue Tamil Nadu | AI & GIS Climate Property Valuation",
  description:
    "AI and GIS-powered climate-adjusted property valuation platform for Tamil Nadu State, India. Quantifying flood, heat, and cyclone risk impact on real estate value.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
