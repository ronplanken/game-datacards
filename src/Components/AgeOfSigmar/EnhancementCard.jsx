import React from "react";
import { ArrowLeft } from "lucide-react";
import { MarkdownDisplay } from "../MarkdownDisplay";
import { getEnhancementCost } from "../../Helpers/faction.helpers";

/**
 * An Age of Sigmar enhancement — an artefact of power, heroic trait or other
 * battletome enhancement. Shares the spell card's layout and styling: the data
 * has the same declare/effect shape, with a points or command point cost in
 * place of a casting value.
 */
export const EnhancementCard = ({
  enhancement,
  groupName,
  faction,
  grandAlliance = "order",
  isMobile = false,
  onBack,
}) => {
  if (!enhancement) return null;

  const cost = getEnhancementCost(enhancement);

  return (
    <div className={`spell-card enhancement-card ${grandAlliance} ${isMobile ? "mobile" : ""}`}>
      {/* Header */}
      <div className="spell-card-header">
        {/* Mobile Back Button */}
        {isMobile && onBack && (
          <button className="spell-back-button" onClick={onBack} type="button">
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="spell-card-title-row">
          <h1 className="spell-card-name">{enhancement.name}</h1>
          {cost && (
            <div className="enhancement-card-cost">
              <span className="enhancement-cost-number">{cost.value}</span>
              <span className="enhancement-cost-label">{cost.label}</span>
            </div>
          )}
        </div>
        {groupName && <div className="spell-card-lore-name">{groupName}</div>}
      </div>

      {/* Body */}
      <div className="spell-card-body">
        <div className="spell-card-content">
          {enhancement.phaseDetails && <div className="enhancement-card-phase">{enhancement.phaseDetails}</div>}
          {enhancement.declare && (
            <div className="spell-card-section">
              <div className="spell-card-section-label">Declare</div>
              <div className="spell-card-section-text">
                <MarkdownDisplay content={enhancement.declare} />
              </div>
            </div>
          )}
          {enhancement.effect && (
            <div className="spell-card-section">
              <div className="spell-card-section-label">Effect</div>
              <div className="spell-card-section-text">
                <MarkdownDisplay content={enhancement.effect} />
              </div>
            </div>
          )}
          {/* Custom datasources and older exports keep a single description */}
          {!enhancement.declare && !enhancement.effect && enhancement.description && (
            <div className="spell-card-section">
              <div className="spell-card-section-text">
                <MarkdownDisplay content={enhancement.description} />
              </div>
            </div>
          )}
        </div>

        {/* Keywords */}
        {enhancement.keywords?.length > 0 && (
          <div className="spell-card-keywords">
            <span className="spell-card-keywords-label">Keywords:</span>
            <span className="spell-card-keywords-list">{enhancement.keywords.join(", ")}</span>
          </div>
        )}
      </div>
    </div>
  );
};
