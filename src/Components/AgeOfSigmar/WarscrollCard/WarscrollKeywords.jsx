import React from "react";

export const WarscrollKeywords = ({ keywords, factionKeywords, grandAlliance }) => {
  // Ensure we have arrays
  const unitKeywords = Array.isArray(keywords) ? keywords : [];
  const factionKws = Array.isArray(factionKeywords) ? factionKeywords : [];

  if (unitKeywords.length === 0 && factionKws.length === 0) return null;

  // Combine all keywords with bullet separators
  const allKeywords = [...factionKws, ...unitKeywords];
  const keywordsText = allKeywords.join(" • ");

  return (
    <div className={`keywords-footer ${grandAlliance}`}>
      <div className="keywords-badge">KEYWORDS</div>
      <div className="keywords-text">{keywordsText}</div>
    </div>
  );
};
