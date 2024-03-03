import { UnitAbility } from "./UnitAbility";
import { UnitAbilityDescription } from "./UnitAbilityDescription";
import { UnitInvul } from "./UnitInvul";

export const UnitExtra = ({ unit }) => {
  return (
    <div className="extra">
      <div className="abilities">
        <div className="heading">
          <div className="title">Abilities</div>
        </div>
        <UnitAbility name={"core"} value={unit.abilities?.core?.join(", ")} />
        <UnitAbility name={"faction"} value={unit.abilities?.faction?.join(", ")} />
        {unit.abilities?.other
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
      {unit.abilities?.wargear?.filter((ability) => ability.showAbility).length > 0 && (
        <div className="abilities">
          <div className="heading">
            <div className="title">Wargear abilities</div>
          </div>
          {unit.abilities?.wargear
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
      )}
      {unit.abilities?.damaged && unit.abilities?.damaged.showDamagedAbility && (
        <div className="damaged">
          <div className="heading">
            <div className="title">Damaged: {unit.abilities?.damaged?.range}</div>
          </div>
          {unit.abilities?.damaged.showDescription && (
            <div className="description">{unit.abilities?.damaged?.description}</div>
          )}
        </div>
      )}
      {unit.abilities?.special && (
        <>
          {unit.abilities?.special
            ?.filter((ability) => ability.showAbility)
            ?.map((ability, index) => {
              return (
                <div className="special" key={`special-${ability.name}`}>
                  <div className="heading">
                    <div className="title">{ability.name}</div>
                  </div>
                  <div className="description">{ability.description}</div>
                </div>
              );
            })}
        </>
      )}
      {unit.abilities?.invul && unit.abilities?.invul.showInvulnerableSave && (
        <UnitInvul invul={unit.abilities?.invul} />
      )}
    </div>
  );
};
