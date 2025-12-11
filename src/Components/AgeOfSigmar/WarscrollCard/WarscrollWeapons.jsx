import React from "react";
import { MarkdownDisplay } from "../../MarkdownDisplay";

export const WarscrollWeapons = ({ weapons, type, grandAlliance, isMobile = false }) => {
  if (!weapons || weapons.length === 0) return null;

  const activeWeapons = weapons.filter((w) => w.active !== false);
  if (activeWeapons.length === 0) return null;

  const isRanged = type === "ranged";
  const headerText = isRanged ? "Ranged Weapons" : "Melee Weapons";

  // Mobile layout - card-based display
  if (isMobile) {
    return (
      <div className={`section-block ${type} ${grandAlliance}`}>
        <div className="section-title-banner">{headerText}</div>

        {activeWeapons.map((weapon, index) => (
          <div key={weapon.id || index} className={`weapon-card ${index % 2 === 1 ? "alt-bg" : ""}`}>
            <div className="weapon-card-name">{weapon.name}</div>
            <div className="weapon-card-stats">
              <div className="weapon-card-stat">
                <span className="stat-label">Rng</span>
                <span className="stat-value">{weapon.range || "-"}</span>
              </div>
              <div className="weapon-card-stat">
                <span className="stat-label">Atk</span>
                <span className="stat-value">{weapon.attacks || "-"}</span>
              </div>
              <div className="weapon-card-stat">
                <span className="stat-label">Hit</span>
                <span className="stat-value">{weapon.hit || "-"}</span>
              </div>
              <div className="weapon-card-stat">
                <span className="stat-label">Wnd</span>
                <span className="stat-value">{weapon.wound || "-"}</span>
              </div>
              <div className="weapon-card-stat">
                <span className="stat-label">Rnd</span>
                <span className="stat-value">{weapon.rend || "-"}</span>
              </div>
              <div className="weapon-card-stat">
                <span className="stat-label">Dmg</span>
                <span className="stat-value">{weapon.damage || "-"}</span>
              </div>
            </div>
            {weapon.abilities && (
              <div className="weapon-card-ability">
                <MarkdownDisplay
                  content={Array.isArray(weapon.abilities) ? weapon.abilities.join(", ") : weapon.abilities}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Desktop layout - table display
  return (
    <div className={`section-block ${type} ${grandAlliance}`}>
      <div className="section-title-banner">{headerText}</div>

      {/* Header Row */}
      <div className="weapon-row header-row">
        <span className="w-name">Weapon</span>
        <span className="w-stat">Rng</span>
        <span className="w-stat">Atk</span>
        <span className="w-stat">Hit</span>
        <span className="w-stat">Wnd</span>
        <span className="w-stat">Rnd</span>
        <span className="w-stat">Dmg</span>
        <span className="w-ability">Ability</span>
      </div>

      {/* Weapon Rows */}
      {activeWeapons.map((weapon, index) => (
        <div key={weapon.id || index} className={`weapon-row ${index % 2 === 1 ? "alt-bg" : ""}`}>
          <span className="w-name">{weapon.name}</span>
          <span className="w-stat">{weapon.range || "-"}</span>
          <span className="w-stat">{weapon.attacks || "-"}</span>
          <span className="w-stat">{weapon.hit || "-"}</span>
          <span className="w-stat">{weapon.wound || "-"}</span>
          <span className="w-stat">{weapon.rend || "-"}</span>
          <span className="w-stat">{weapon.damage || "-"}</span>
          <span className="w-ability">
            {weapon.abilities ? (
              <MarkdownDisplay
                content={Array.isArray(weapon.abilities) ? weapon.abilities.join(", ") : weapon.abilities}
              />
            ) : (
              "-"
            )}
          </span>
        </div>
      ))}
    </div>
  );
};
