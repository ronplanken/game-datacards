import { UnitWeaponsType } from "./UnitWeaponsType";

// 11th edition has no separate primarch ability block; render ranged and melee
// weapons whenever present. The optional showWeapons flags let the editor hide a
// section without deleting the data; an absent flag means shown.
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
    </div>
  );
};
