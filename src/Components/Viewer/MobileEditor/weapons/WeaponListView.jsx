import { ChevronRight, Plus, Trash2 } from "lucide-react";
import { getWeaponsArray, setWeaponsOnCard } from "./weaponHelpers";

const usesProfiles = (config) => config?.format === "40k" || (config?.format === "custom" && config?.hasProfiles);

export const WeaponListView = ({ card, weaponTypeKey, config, replaceCard, onEditWeapon }) => {
  const { format, columns, label } = config;
  const weapons = getWeaponsArray(card, weaponTypeKey, format);
  const profileBased = usesProfiles(config);

  const setWeapons = (updated) => {
    replaceCard(setWeaponsOnCard(card, weaponTypeKey, updated, format));
  };

  const handleAdd = () => {
    if (profileBased) {
      // 10e/custom weapons and profiles carry an `active` flag and 40k weapons
      // an `abilities` array; 11e carries neither unless the weapon actually has
      // abilities, so the resolver supplies the keys a blank entry starts with.
      const profile = { ...(config.newProfileDefaults ?? { active: true }), name: "New Weapon", keywords: [] };
      columns?.forEach((col) => (profile[col.key] = ""));
      const weaponDefaults =
        config.newWeaponDefaults ?? (format === "40k" ? { active: true, abilities: [] } : { active: true });
      setWeapons([...weapons, { ...weaponDefaults, profiles: [profile] }]);
      return;
    }

    const blank = { name: "New Weapon", active: true };
    columns?.forEach((col) => (blank[col.key] = ""));
    if (config.hasKeywords) blank.keywords = [];
    setWeapons([...weapons, blank]);
  };

  const handleRemove = (index) => {
    setWeapons(weapons.filter((_, i) => i !== index));
  };

  const getWeaponDisplayName = (weapon) => {
    if (profileBased && weapon.profiles?.length) {
      return weapon.profiles[0]?.name || weapon.name || "Untitled weapon";
    }
    return weapon.name || "Untitled weapon";
  };

  const getWeaponSummary = (weapon) => {
    if (!profileBased) return "";
    const profileCount = weapon.profiles?.length || 0;
    if (profileCount <= 1) return "";
    if (config.profileRelation === "parent-child") {
      const childLabel = (config.profileChildLabel || "Upgrade").toLowerCase();
      const extras = profileCount - 1;
      return `${extras} ${childLabel}${extras === 1 ? "" : "s"}`;
    }
    return `${profileCount} profiles`;
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
