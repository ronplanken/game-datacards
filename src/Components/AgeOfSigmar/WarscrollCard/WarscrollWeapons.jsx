import React from "react";

export const WarscrollWeapons = ({ weapons, type, grandAlliance }) => {
  if (!weapons || weapons.length === 0) return null;

  const activeWeapons = weapons.filter((w) => w.active !== false);
  if (activeWeapons.length === 0) return null;

  const isRanged = type === "ranged";
  const headerText = isRanged ? "Ranged Weapons" : "Melee Weapons";

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
            {Array.isArray(weapon.abilities) ? weapon.abilities.join(", ") : weapon.abilities || "-"}
          </span>
        </div>
      ))}
    </div>
  );
};
