import { UnitWeaponsType } from "./UnitWeaponsType";

export const UnitWeapons = ({ unit }) => {
  return (
    <div className="weapons">
      {unit.rangedWeapons && unit.rangedWeapons.length > 0 && (
        <UnitWeaponsType weaponType={{ name: "Ranged weapons", class: "ranged" }} weapons={unit.rangedWeapons} />
      )}
      {unit.meleeWeapons && unit.meleeWeapons.length > 0 && (
        <UnitWeaponsType weaponType={{ name: "Melee weapons", class: "melee" }} weapons={unit.meleeWeapons} />
      )}
    </div>
  );
};
