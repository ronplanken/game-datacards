import React from "react";
import { sortStatFields, shouldHideField } from "../statFields";

const renderStatValue = (field, stat) => {
  if (!stat) return "-";
  const raw = stat[field.key];
  if (raw === undefined || raw === null || raw === "") return "-";
  if (field.type === "boolean") return raw ? field.onValue || "Yes" : field.offValue || "No";
  return String(raw);
};

const isDashValue = (value) => value === "-" || value === "—" || value === "–";

// Normalise a tier source into `{ models, supply }`. Accepts:
// - Points-shape: `{ active, models, cost }` (current canonical shape — Models /
//   Supply rides on top of the Points cost editor for Starcraft TMG)
// - Section-shape: `{ models, supply }` (legacy modelsSupplyTiers section)
// - Plain string: "1-3" or "1-3/0" (very-old section format)
const normaliseTier = (tier) => {
  if (tier && typeof tier === "object") {
    return {
      models: tier.models ?? "",
      // `cost` (points) takes precedence over `supply` (legacy section)
      supply: tier.cost ?? tier.supply ?? "0",
    };
  }
  if (typeof tier === "string") {
    const match = tier.match(/^\s*([^\/|:]+?)\s*[\/|:]\s*(.+?)\s*$/);
    if (match) return { models: match[1], supply: match[2] };
    return { models: tier, supply: "0" };
  }
  return { models: "", supply: "0" };
};

const SupplyTiers = ({ tiers, caption = "Models / Supply" }) => {
  if (!tiers?.length) return null;
  const normalised = tiers.map(normaliseTier).filter((t) => t.models || t.supply);
  if (!normalised.length) return null;
  return (
    <div className="sc-header-supply">
      <div className="sc-supply-tiers">
        {normalised.map((tier, idx) => (
          <div key={idx} className="sc-supply-tier">
            <div className="sc-supply-models">{tier.models || "-"}</div>
            <div className="sc-supply-value">{tier.supply || "0"}</div>
          </div>
        ))}
      </div>
      <div className="sc-supply-caption">{caption}</div>
    </div>
  );
};

export const StarcraftHeader = ({ card, statFields, subtitle, showSupply = true, supplyCaption }) => {
  const allStats = Array.isArray(card.stats) ? card.stats : card.stats ? [card.stats] : [];
  const sortedFields = sortStatFields(statFields).filter((f) => !shouldHideField(f, allStats));
  const statLine = allStats[0] || {};
  // Points is the canonical source. Filter out inactive entries so toggling
  // a single tier off in the editor immediately drops it from the card.
  const activePoints = Array.isArray(card.points) ? card.points.filter((p) => p?.active !== false) : [];
  const tiers = activePoints.length ? activePoints : card.sections?.modelsSupply || card.modelsSupply || [];

  return (
    <div className="sc-header">
      <div className="sc-header-name-block">
        <div>
          <div className="sc-header-name">{card.name || "Untitled Unit"}</div>
          {card.combatRole || card.armySlot ? (
            <div className="sc-header-badges">
              {card.combatRole ? (
                <div className="sc-header-badge">
                  <span className="sc-header-badge-label">Combat Role</span>
                  <span className="sc-header-badge-value">{card.combatRole}</span>
                </div>
              ) : null}
              {card.armySlot ? (
                <div className="sc-header-badge">
                  <span className="sc-header-badge-label">Army Slot</span>
                  <span className="sc-header-badge-value">{card.armySlot}</span>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="sc-header-subtitle">{subtitle || "UNIT PROFILE · CORE"}</div>
          )}
        </div>
      </div>

      <div className="sc-header-stats" style={{ "--sc-stat-count": sortedFields.length }}>
        {sortedFields.map((field) => {
          const value = renderStatValue(field, statLine);
          const dash = isDashValue(value);
          return (
            <div key={field.key} className={`sc-stat${dash ? " sc-stat-dash" : ""}`}>
              <div className="sc-stat-pill">
                <div className="sc-stat-value">{value}</div>
                <div className="sc-stat-label">{field.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {showSupply && <SupplyTiers tiers={tiers} caption={supplyCaption} />}
    </div>
  );
};
