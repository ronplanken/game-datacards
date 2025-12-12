import React from "react";
import { MarkdownDisplay } from "../MarkdownDisplay";

export const SpellCard = ({ spell, loreName, faction, grandAlliance = "order", isMobile = false }) => {
  if (!spell) return null;

  return (
    <div className={`spell-card ${grandAlliance} ${isMobile ? "mobile" : ""}`}>
      {/* Header */}
      <div className="spell-card-header">
        <div className="spell-card-title-row">
          <h1 className="spell-card-name">{spell.name}</h1>
          {spell.castingValue && (
            <div className="spell-card-casting-value">
              <span className="casting-value-number">{spell.castingValue}</span>
              <span className="casting-value-plus">+</span>
            </div>
          )}
        </div>
        {loreName && <div className="spell-card-lore-name">{loreName}</div>}
      </div>

      {/* Body */}
      <div className="spell-card-body">
        {/* Spell Content */}
        <div className="spell-card-content">
          {spell.declare && (
            <div className="spell-card-section">
              <div className="spell-card-section-label">Declare</div>
              <div className="spell-card-section-text">
                <MarkdownDisplay content={spell.declare} />
              </div>
            </div>
          )}
          {spell.effect && (
            <div className="spell-card-section">
              <div className="spell-card-section-label">Effect</div>
              <div className="spell-card-section-text">
                <MarkdownDisplay content={spell.effect} />
              </div>
            </div>
          )}
        </div>

        {/* Keywords */}
        {spell.keywords && spell.keywords.length > 0 && (
          <div className="spell-card-keywords">
            <span className="spell-card-keywords-label">Keywords:</span>
            <span className="spell-card-keywords-list">{spell.keywords.join(", ")}</span>
          </div>
        )}
      </div>
    </div>
  );
};
