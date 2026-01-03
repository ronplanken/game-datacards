// Faction icon component for Warhammer 40k 10th edition cards
// Fetches SVG and renders inline to fix MacOS print-to-PDF rendering issues
import React, { useState, useEffect } from "react";

// Cache for fetched SVG content to avoid re-fetching
const svgCache = new Map();

export const FactionIcon = ({ factionId, className = "", style = {} }) => {
  const [svgContent, setSvgContent] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!factionId) return;

    const url = `https://raw.githubusercontent.com/ronplanken/40k-Data-Card/master/src/dc/${factionId}.svg`;

    // Check cache first
    if (svgCache.has(url)) {
      setSvgContent(svgCache.get(url));
      return;
    }

    // Fetch the SVG
    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch");
        return response.text();
      })
      .then((svgText) => {
        // Cache the result
        svgCache.set(url, svgText);
        setSvgContent(svgText);
      })
      .catch(() => {
        setError(true);
      });
  }, [factionId]);

  if (!factionId || error) return null;

  if (!svgContent) {
    // Loading state - render placeholder
    return <div className={className} style={{ width: "100%", height: "100%", ...style }} />;
  }

  // Render the SVG inline
  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};

export default FactionIcon;
