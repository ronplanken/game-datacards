import { UnitAbility } from "./UnitAbility";
import { UnitAbilityDescription, replaceKeywords } from "./UnitAbilityDescription";
import { UnitInvul } from "./UnitInvul";
import { DamagedIcon } from "../../Icons/WeaponTypeIcon";

export const UnitExtra = ({ unit }) => {
  return (
    <div className="extra">
      {(unit?.showAbilities?.["core"] !== false ||
        unit?.showAbilities?.["faction"] !== false ||
        unit?.showAbilities?.["other"] !== false) && (
        <div className="abilities">
          <div className="heading">
            <div className="title">Abilities</div>
          </div>
          {unit?.showAbilities?.["core"] !== false && (
            <UnitAbility name={"core"} value={unit.abilities?.core?.join(", ")} />
          )}
          {unit?.showAbilities?.["faction"] !== false && (
            <UnitAbility name={"faction"} value={unit.abilities?.faction?.join(", ")} />
          )}
          {unit?.showAbilities?.["other"] !== false &&
            unit.abilities?.other
              ?.filter((ability) => ability.showAbility)
              ?.map((ability, index) => {
                return (
                  <UnitAbilityDescription
                    name={ability.name}
                    description={ability?.description}
                    showDescription={ability?.showDescription}
                    key={`ability-${index}`}
                  />
                );
              })}
        </div>
      )}
      {unit?.showAbilities?.["wargear"] !== false &&
        unit.abilities?.wargear?.filter((ability) => ability.showAbility)?.length > 0 && (
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
            <div className="damaged-icon">
              <DamagedIcon color="white" />
            </div>
            <div className="title">Damaged: {unit.abilities?.damaged?.range}</div>
          </div>
          {unit.abilities?.damaged.showDescription && (
            <div className="description">{replaceKeywords(unit.abilities?.damaged?.description)}</div>
          )}
        </div>
      )}
      {unit?.showAbilities?.["special"] !== false && unit.abilities?.special && (
        <>
          {unit.abilities?.special
            ?.filter((ability) => ability.showAbility)
            ?.map((ability, index) => {
              return (
                <div className="special" key={`special-${ability.name}`}>
                  <div className="heading">
                    <div className="title">{ability.name}</div>
                  </div>
                  {ability.showDescription && (
                    <div className="description-container">
                      <span className="description">{replaceKeywords(ability.description)}</span>
                    </div>
                  )}
                </div>
              );
            })}
        </>
      )}
      {unit.abilities?.invul?.showInvulnerableSave && !unit.abilities?.invul?.showAtTop && (
        <UnitInvul invul={unit.abilities?.invul} />
      )}
    </div>
  );
};
