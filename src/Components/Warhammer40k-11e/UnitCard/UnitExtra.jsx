import { UnitAbility } from "./UnitAbility";
import { UnitAbilityDescription, MarkupText } from "./UnitAbilityDescription";
import { DamagedIcon } from "../../Icons/WeaponTypeIcon";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { localize } from "../../../Helpers/localization.helpers";

// 11th edition abilities:
//   core/faction -> arrays of { name: {lang} }  (rendered as a joined list)
//   other        -> array of { name: {lang}, description: {lang} }
//   damaged      -> { range, description } | null
//   invul        -> { value }  (rendered in the header, see UnitCardFront/Full)
export const UnitExtra = ({ unit }) => {
  const { settings } = useSettingsStorage();
  const lang = settings.language;
  const abilities = unit.abilities || {};

  // Optional visibility flags let the editor hide a block without deleting data;
  // an absent flag means shown.
  const core =
    unit.showAbilities?.core !== false
      ? abilities.core
          ?.map((a) => localize(a.name, lang))
          .filter(Boolean)
          .join(", ")
      : "";
  const faction =
    unit.showAbilities?.faction !== false
      ? abilities.faction
          ?.map((a) => localize(a.name, lang))
          .filter(Boolean)
          .join(", ")
      : "";
  const other = unit.showAbilities?.other !== false ? abilities.other || [] : [];
  const damaged = unit.showDamaged !== false ? abilities.damaged : null;

  const hasAbilities = core || faction || other.length > 0;

  return (
    <div className="extra">
      {hasAbilities && (
        <div className="abilities">
          <div className="heading">
            <div className="title">Abilities</div>
          </div>
          {core && <UnitAbility name={"core"} value={core} />}
          {faction && <UnitAbility name={"faction"} value={faction} />}
          {other.map((ability, index) => (
            <UnitAbilityDescription name={ability.name} description={ability?.description} key={`ability-${index}`} />
          ))}
        </div>
      )}
      {damaged && (damaged.range || damaged.description) && (
        <div className="damaged">
          <div className="heading">
            <div className="damaged-icon">
              <DamagedIcon color="white" />
            </div>
            <div className="title">Damaged: {localize(damaged.range, lang)}</div>
          </div>
          <div className="description">
            <MarkupText content={localize(damaged.description, lang)} />
          </div>
        </div>
      )}
    </div>
  );
};
