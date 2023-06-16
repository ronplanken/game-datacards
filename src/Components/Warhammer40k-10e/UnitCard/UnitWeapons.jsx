import { UnitAbilityDescription } from "./UnitAbilityDescription";
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
      {unit.abilities.primarch && unit.abilities.primarch.length > 0 && (
        <>
          {unit.abilities.primarch
            ?.filter((ability) => ability.showAbility)
            .map((primarchAbility, index) => {
              return (
                <div className="special" key={`special-${primarchAbility.name}`}>
                  <div className="heading">
                    <div className="title">{primarchAbility.name}</div>
                  </div>
                  {primarchAbility.abilities
                    ?.filter((ability) => ability.showAbility)
                    ?.map((ability, index) => {
                      return (
                        <UnitAbilityDescription
                          name={ability.name}
                          description={ability.description}
                          showDescription={ability.showDescription}
                          key={`ability-${index}`}
                        />
                      );
                    })}
                </div>
              );
            })}
        </>
      )}
    </div>
  );
};
