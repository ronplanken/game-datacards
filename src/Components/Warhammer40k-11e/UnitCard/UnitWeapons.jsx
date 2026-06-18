import { UnitWeaponsType } from "./UnitWeaponsType";

// 11th edition has no per-card show/hide flags and no separate primarch ability
// block; render ranged and melee weapons whenever present.
export const UnitWeapons = ({ unit }) => {
  return (
    <div className="weapons">
      {unit.rangedWeapons && unit.rangedWeapons.length > 0 && (
        <UnitWeaponsType
          weaponType={{ name: "Ranged weapons", class: "ranged", skill: "BS" }}
          weapons={unit.rangedWeapons}
        />
      )}
      {unit.meleeWeapons && unit.meleeWeapons.length > 0 && (
        <UnitWeaponsType
          weaponType={{ name: "Melee weapons", class: "melee", skill: "WS" }}
          weapons={unit.meleeWeapons}
        />
      )}
    </div>
  );
};
