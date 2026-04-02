import { ChevronRight, Plus, Trash2 } from "lucide-react";
import { getWeaponsArray, setWeaponsOnCard } from "./weaponHelpers";

export const WeaponListView = ({ card, weaponTypeKey, config, replaceCard, onEditWeapon }) => {
  const { format, columns, label } = config;
  const weapons = getWeaponsArray(card, weaponTypeKey, format);

  const setWeapons = (updated) => {
    replaceCard(setWeaponsOnCard(card, weaponTypeKey, updated, format));
  };

  const handleAdd = () => {
    const blank = { name: "New Weapon", active: true };
    if (format === "40k") {
      const profile = { name: "New Weapon", active: true };
      columns?.forEach((col) => (profile[col.key] = ""));
      blank.profiles = [profile];
      blank.abilities = [];
    } else {
      columns?.forEach((col) => (blank[col.key] = ""));
    }
    setWeapons([...weapons, blank]);
  };

  const handleRemove = (index) => {
    setWeapons(weapons.filter((_, i) => i !== index));
  };

  const getWeaponDisplayName = (weapon) => {
    if (format === "40k" && weapon.profiles?.length) {
      return weapon.profiles[0]?.name || weapon.name || "Untitled weapon";
    }
    return weapon.name || "Untitled weapon";
  };

  const getWeaponSummary = (weapon) => {
    if (format === "40k") {
      const profileCount = weapon.profiles?.length || 0;
      return profileCount > 1 ? `${profileCount} profiles` : "";
    }
    return "";
  };

  return (
    <div>
      {weapons.map((weapon, index) => (
        <div key={index} className="mobile-editor-weapon-row">
          <div className="mobile-editor-weapon-info" onClick={() => onEditWeapon(index, 0)}>
            <div className="mobile-editor-weapon-name">{getWeaponDisplayName(weapon)}</div>
            {getWeaponSummary(weapon) && <div className="mobile-editor-weapon-meta">{getWeaponSummary(weapon)}</div>}
          </div>
          <button
            className="mobile-editor-weapon-delete"
            onClick={(e) => {
              e.stopPropagation();
              handleRemove(index);
            }}
            type="button">
            <Trash2 size={16} />
          </button>
          <ChevronRight size={18} className="mobile-editor-weapon-arrow" onClick={() => onEditWeapon(index, 0)} />
        </div>
      ))}
      <button className="mobile-editor-add-btn" onClick={handleAdd} type="button">
        <Plus size={14} />
        <span>Add {label?.replace(/s$/, "") || "Weapon"}</span>
      </button>
    </div>
  );
};
