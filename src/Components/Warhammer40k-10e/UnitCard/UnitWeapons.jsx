import { UnitAbilityDescription } from "./UnitAbilityDescription";
import { UnitWeaponsType } from "./UnitWeaponsType";

export const UnitWeapons = ({ unit }) => {
  // Weapon keyword lists wrap inside the name column by default. Cards that
  // turn the "Wrap Keywords" styling toggle off opt into one unbreakable line
  // per list instead; an absent flag means wrap.
  const wrapKeywords = unit.wrapKeywords !== false;

  return (
    <div className={`weapons${wrapKeywords ? "" : " keywords-nowrap"}`}>
      {unit.showWeapons?.["rangedWeapons"] !== false && unit.rangedWeapons && unit.rangedWeapons.length > 0 && (
        <UnitWeaponsType
          weaponType={{ name: "Ranged weapons", class: "ranged", skill: "BS" }}
          weapons={unit.rangedWeapons}
        />
      )}
      {unit.showWeapons?.["meleeWeapons"] !== false && unit.meleeWeapons && unit.meleeWeapons.length > 0 && (
        <UnitWeaponsType
          weaponType={{ name: "Melee weapons", class: "melee", skill: "WS" }}
          weapons={unit.meleeWeapons}
        />
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
