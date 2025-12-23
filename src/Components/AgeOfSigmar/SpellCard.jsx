import React from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { MarkdownDisplay } from "../MarkdownDisplay";

export const SpellCard = ({
  spell,
  loreName,
  faction,
  grandAlliance = "order",
  isMobile = false,
  onViewWarscroll,
  onBack,
}) => {
  if (!spell) return null;

  return (
    <div className={`spell-card ${grandAlliance} ${isMobile ? "mobile" : ""}`}>
      {/* Header */}
      <div className="spell-card-header">
        {/* Mobile Back Button */}
        {isMobile && onBack && (
          <button className="spell-back-button" onClick={onBack} type="button">
            <ArrowLeft size={20} />
          </button>
        )}
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

        {/* Linked Warscroll Button */}
        {spell.linkedWarscroll && onViewWarscroll && (
          <button className="linked-warscroll-button" onClick={() => onViewWarscroll(spell.linkedWarscroll)}>
            <span className="linked-warscroll-label">Summons:</span>
            <span className="linked-warscroll-name">{spell.linkedWarscroll}</span>
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
};
