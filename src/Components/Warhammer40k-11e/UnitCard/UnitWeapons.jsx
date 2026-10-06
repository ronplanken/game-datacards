import { UnitPrimarchAbilities } from "./UnitPrimarchAbilities";
import { UnitSelectedEnhancement } from "./UnitSelectedEnhancement";
import { UnitWeaponsType } from "./UnitWeaponsType";

// Render ranged and melee weapons whenever present, followed by any primarch
// ability groups and the list-selected enhancement (which share this wide
// column, as in 10e). The optional showWeapons flags let the editor hide a
// section without deleting the data; an absent flag means shown.
export const UnitWeapons = ({ unit }) => {
  const showRanged = unit.showWeapons?.rangedWeapons !== false;
  const showMelee = unit.showWeapons?.meleeWeapons !== false;
  // Weapon keyword lists wrap inside the name column by default. Cards that
  // turn the "Wrap Keywords" styling toggle off opt into one unbreakable line
  // per list instead; an absent flag means wrap.
  const wrapKeywords = unit.wrapKeywords !== false;
  return (
    <div className={`weapons${wrapKeywords ? "" : " keywords-nowrap"}`}>
      {showRanged && unit.rangedWeapons && unit.rangedWeapons.length > 0 && (
        <UnitWeaponsType
          weaponType={{ name: "Ranged weapons", class: "ranged", skill: "BS" }}
          weapons={unit.rangedWeapons}
        />
      )}
      {showMelee && unit.meleeWeapons && unit.meleeWeapons.length > 0 && (
        <UnitWeaponsType
          weaponType={{ name: "Melee weapons", class: "melee", skill: "WS" }}
          weapons={unit.meleeWeapons}
        />
      )}
      <UnitPrimarchAbilities unit={unit} />
      <UnitSelectedEnhancement unit={unit} />
    </div>
  );
};
