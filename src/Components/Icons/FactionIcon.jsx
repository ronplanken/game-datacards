// Faction icon component for Warhammer 40k 10th edition cards
// Fetches SVG and renders inline to fix MacOS print-to-PDF rendering issues
import React, { useState, useEffect } from "react";

// Sanitize fetched SVG to prevent XSS and strip rendering artifacts
const DANGEROUS_ELEMENTS = ["script", "foreignobject"];
const BLOAT_ELEMENTS = ["metadata"];
const STRIP_NS_ATTRS = ["xmlns:dc", "xmlns:cc", "xmlns:rdf", "xmlns:sodipodi", "xmlns:inkscape"];

const sanitizeSvg = (raw) => {
  const stripped = raw
    .replace(/<\?xml[^?]*\?>/gi, "")
    .replace(/<!DOCTYPE[^[>]*\[[\s\S]*?\]>/gi, "")
    .replace(/<!DOCTYPE[^>]*>/gi, "");

  const doc = new DOMParser().parseFromString(stripped, "image/svg+xml");
  const svg = doc.querySelector("svg");
  if (!svg) return "";

  const all = svg.querySelectorAll("*");
  for (const el of all) {
    const tag = el.tagName.toLowerCase();
    if (DANGEROUS_ELEMENTS.includes(tag) || BLOAT_ELEMENTS.includes(tag) || tag.includes("namedview")) {
      el.remove();
      continue;
    }
    for (const attr of [...el.attributes]) {
      if (
        attr.name.startsWith("on") ||
        attr.name.startsWith("inkscape:") ||
        attr.name.startsWith("sodipodi:") ||
        STRIP_NS_ATTRS.includes(attr.name)
      ) {
        el.removeAttribute(attr.name);
      }
      if (
        (attr.name === "href" || attr.name === "xlink:href") &&
        attr.value.trim().toLowerCase().startsWith("javascript:")
      ) {
        el.removeAttribute(attr.name);
      }
    }
  }

  for (const ns of STRIP_NS_ATTRS) svg.removeAttribute(ns);
  for (const attr of [...svg.attributes]) {
    if (attr.name.startsWith("inkscape:") || attr.name.startsWith("sodipodi:")) {
      svg.removeAttribute(attr.name);
    }
  }

  return svg.outerHTML;
};

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
        const cleaned = sanitizeSvg(svgText);
        svgCache.set(url, cleaned);
        setSvgContent(cleaned);
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
