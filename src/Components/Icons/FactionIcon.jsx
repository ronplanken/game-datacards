// Faction icon component for Warhammer 40k 10th edition cards
// Fetches SVG and renders inline to fix MacOS print-to-PDF rendering issues
import React, { useState, useEffect } from "react";
import { FACTION_SYMBOL_BASE_URL } from "../../Helpers/factionSymbol.helpers";

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

// Cache for fetched SVG content to avoid re-fetching. Misses are cached as null
// so a faction without a symbol is not re-requested on every render.
const svgCache = new Map();

const fetchSvg = async (factionId) => {
  const url = `${FACTION_SYMBOL_BASE_URL}/${factionId}.svg`;
  if (svgCache.has(url)) return svgCache.get(url);

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch");
    const cleaned = sanitizeSvg(await response.text());
    svgCache.set(url, cleaned);
    return cleaned;
  } catch {
    svgCache.set(url, null);
    return null;
  }
};

/**
 * Renders a faction symbol. `factionId` accepts a single code or an ordered list
 * of candidate codes: the first one that actually resolves to an SVG is used, so
 * a card whose faction id is not a legacy symbol code (11th edition UUIDs,
 * custom datasource slugs) can still fall back to a code resolved from its
 * faction name.
 */
export const FactionIcon = ({ factionId, className = "", style = {} }) => {
  const [svgContent, setSvgContent] = useState(null);
  const [error, setError] = useState(false);

  const candidates = (Array.isArray(factionId) ? factionId : [factionId]).filter(Boolean);
  // Effects key off the candidate list by value; the array identity changes on
  // every render because callers build it inline.
  const candidateKey = candidates.join("|");

  useEffect(() => {
    let cancelled = false;

    // Reset on every change so a previous miss never sticks to the next faction.
    setSvgContent(null);
    setError(false);

    if (!candidateKey) return undefined;

    const load = async () => {
      for (const candidate of candidateKey.split("|")) {
        const svg = await fetchSvg(candidate);
        if (cancelled) return;
        if (svg) {
          setSvgContent(svg);
          return;
        }
      }
      setError(true);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [candidateKey]);

  if (!candidateKey || error) return null;

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
