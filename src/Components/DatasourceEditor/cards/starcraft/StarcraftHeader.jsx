import React from "react";
import { sortStatFields, shouldHideField } from "../statFields";

// Faction emblems — abstracted geometric marks that evoke each faction's
// iconography without copying any specific IP. Picked by faction id; unknown
// ids fall back to the Terran mark.
//
// - Terran  : winged shield silhouette (eagle / dominion-style heraldry)
// - Protoss : tri-radial sigil with a central focus (Khalai-style three blades)
// - Zerg    : organic asymmetric burst (existing Swarm radial)

const TerranMark = (props) => (
  <svg viewBox="0 0 64 64" aria-hidden="true" {...props}>
    <g fill="currentColor">
      {/* Outer wing-shield silhouette */}
      <path d="M32 6 L42 12 L52 10 L50 22 L58 30 L50 32 L52 42 L42 38 L40 50 L32 44 L24 50 L22 38 L12 42 L14 32 L6 30 L14 22 L12 10 L22 12 Z" />
    </g>
    {/* Inner star/badge */}
    <path d="M32 18 L36 28 L46 28 L38 34 L42 44 L32 38 L22 44 L26 34 L18 28 L28 28 Z" fill="#0d1822" opacity="0.35" />
    <circle cx="32" cy="32" r="3" fill="currentColor" />
  </svg>
);

const ProtossMark = (props) => (
  <svg viewBox="0 0 64 64" aria-hidden="true" {...props}>
    <g fill="currentColor">
      {/* Three triangular blades radiating from the centre */}
      <path d="M32 4 L36 28 L60 32 L36 36 L32 60 L28 36 L4 32 L28 28 Z" />
    </g>
    {/* Central eye/focus */}
    <circle cx="32" cy="32" r="5" fill="#0d1822" opacity="0.45" />
    <circle cx="32" cy="32" r="2.4" fill="currentColor" />
  </svg>
);

const SwarmMark = (props) => (
  <svg viewBox="0 0 64 64" aria-hidden="true" {...props}>
    <g fill="currentColor">
      <path
        d="M32 6 C 22 14, 18 24, 22 34 C 14 30, 8 36, 10 44 C 18 42, 24 46, 28 52 C 30 44, 32 38, 32 32 C 32 38, 34 44, 36 52 C 40 46, 46 42, 54 44 C 56 36, 50 30, 42 34 C 46 24, 42 14, 32 6 Z"
        opacity="0.95"
      />
    </g>
  </svg>
);

// Aliases so older datasources (with `dominion`, `swarm`, …) still resolve
// to the right mark.
const FACTION_EMBLEM_MAP = {
  terran: TerranMark,
  dominion: TerranMark,
  raynor: TerranMark,
  protoss: ProtossMark,
  khalai: ProtossMark,
  nerazim: ProtossMark,
  zerg: SwarmMark,
  swarm: SwarmMark,
};

const FactionEmblem = ({ factionId }) => {
  const id = String(factionId || "").toLowerCase();
  const Emblem = FACTION_EMBLEM_MAP[id] || TerranMark;
  return <Emblem />;
};

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

/**
 * Top header bar: angled name block with subtitle, hex-cut stat tiles,
 * tiered Models/Supply (hex cells with dark supply pills), and faction emblem.
 *
 * Models / Supply tiers ride on top of the canonical Points cost editor for
 * Starcraft TMG — `card.points` is the source of truth (`{ active, models,
 * cost }`). Older data shapes (`card.sections.modelsSupply`, top-level
 * `card.modelsSupply`) are still accepted as fallbacks.
 *
 * @param {boolean} props.showSupply - When false, hide the Models / Supply
 *   tier block (driven by the editor's "Points" panel toggle).
 * @param {string} props.supplyCaption - Caption shown beneath the tier row;
 *   driven by `schema.metadata.pointsLabel`. Defaults to "Models / Supply".
 */
export const StarcraftHeader = ({ card, statFields, factionId, subtitle, showSupply = true, supplyCaption }) => {
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

      <div className="sc-header-stats">
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

      <div className="sc-header-symbol" data-faction={factionId || "unknown"}>
        <FactionEmblem factionId={factionId} />
      </div>
    </div>
  );
};
