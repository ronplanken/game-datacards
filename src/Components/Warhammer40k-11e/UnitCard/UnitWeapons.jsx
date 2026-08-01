import { UnitPrimarchAbilities } from "./UnitPrimarchAbilities";
import { UnitWeaponsType } from "./UnitWeaponsType";

// Render ranged and melee weapons whenever present, followed by any primarch
// ability groups (which share this wide column, as in 10e). The optional
// showWeapons flags let the editor hide a section without deleting the data; an
// absent flag means shown.
export const UnitWeapons = ({ unit }) => {
  const showRanged = unit.showWeapons?.rangedWeapons !== false;
  const showMelee = unit.showWeapons?.meleeWeapons !== false;
  return (
    <div className="weapons">
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
    </div>
  );
};
