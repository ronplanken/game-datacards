import { ChevronRight } from "lucide-react";
import { EditorAccordion } from "../shared/EditorAccordion";

/**
 * Weapons summary section with drill-down triggers.
 * Shows weapon types as tappable cards.
 */
export const WeaponsSection = ({ card, config, label, icon, onDrillDown }) => {
  const { types, format } = config;

  const getWeapons = (typeKey) => {
    if (format === "40k") return card[typeKey] || [];
    if (format === "aos") return card.weapons?.[typeKey] || [];
    return card.weapons?.[typeKey] || card[typeKey] || [];
  };

  const getWeaponCount = () => {
    return types.reduce((sum, t) => sum + getWeapons(t.key).length, 0);
  };

  return (
    <EditorAccordion title={label} icon={icon} badge={getWeaponCount()}>
      {types.map((weaponType) => {
        const weapons = getWeapons(weaponType.key);
        return (
          <div
            key={weaponType.key}
            className="mobile-editor-weapon-row"
            onClick={() =>
              onDrillDown({
                view: "weaponList",
                weaponTypeKey: weaponType.key,
                config: { ...weaponType, format },
              })
            }>
            <div className="mobile-editor-weapon-info">
              <div className="mobile-editor-weapon-name">{weaponType.label}</div>
              <div className="mobile-editor-weapon-meta">
                {weapons.length} {weapons.length === 1 ? "weapon" : "weapons"}
              </div>
            </div>
            <ChevronRight size={20} className="mobile-editor-weapon-arrow" />
          </div>
        );
      })}
    </EditorAccordion>
  );
};
