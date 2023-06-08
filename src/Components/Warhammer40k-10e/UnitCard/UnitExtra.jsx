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
      {unit.abilities?.invul && <UnitInvul invul={unit.abilities?.invul} />}
    </div>
  );
};
