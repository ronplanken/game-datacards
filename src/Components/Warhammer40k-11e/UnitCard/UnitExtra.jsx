import { UnitAbility } from "./UnitAbility";
import { UnitAbilityDescription, MarkupText } from "./UnitAbilityDescription";
import { UnitCoreAbilities } from "./UnitCoreAbilities";
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
  // Core abilities keep their raw multilingual shape so UnitCoreAbilities can
  // match each against the keyword glossary while still displaying them localised.
  const coreAbilities = unit.showAbilities?.core !== false ? (abilities.core || []).filter((a) => a?.name) : [];
  const faction =
    unit.showAbilities?.faction !== false
      ? abilities.faction
          ?.map((a) => localize(a.name, lang))
          .filter(Boolean)
          .join(", ")
      : "";
  const other = unit.showAbilities?.other !== false ? abilities.other || [] : [];
  // Wargear-granted and datasheet-special abilities share the { name, description }
  // shape of `other`; the 11e data has no per-ability UI flags.
  const wargear = unit.showAbilities?.wargear !== false ? (abilities.wargear || []).filter((a) => a?.name) : [];
  const special = unit.showAbilities?.special !== false ? (abilities.special || []).filter((a) => a?.name) : [];
  // Primarch abilities nest a set of sub-abilities under a named group.
  const primarch = unit.showAbilities?.primarch !== false ? (abilities.primarch || []).filter((a) => a?.name) : [];
  const damaged = unit.showDamaged !== false ? abilities.damaged : null;

  const hasAbilities = coreAbilities.length > 0 || faction || other.length > 0;

  return (
    <div className="extra">
      {hasAbilities && (
        <div className="abilities">
          <div className="heading">
            <div className="title">Abilities</div>
          </div>
          <UnitCoreAbilities abilities={coreAbilities} />
          {faction && <UnitAbility name={"faction"} value={faction} />}
          {other.map((ability, index) => (
            <UnitAbilityDescription name={ability.name} description={ability?.description} key={`ability-${index}`} />
          ))}
        </div>
      )}
      {wargear.length > 0 && (
        <div className="abilities">
          <div className="heading">
            <div className="title">Wargear abilities</div>
          </div>
          {wargear.map((ability, index) => (
            <UnitAbilityDescription name={ability.name} description={ability?.description} key={`wargear-${index}`} />
          ))}
        </div>
      )}
      {special.map((ability, index) => (
        <div className="special" key={`special-${index}`}>
          <div className="heading">
            <div className="title">{localize(ability.name, lang)}</div>
          </div>
          {ability?.description && (
            <div className="description-container">
              <span className="description">
                <MarkupText content={localize(ability.description, lang)} />
              </span>
            </div>
          )}
        </div>
      ))}
      {primarch.map((group, index) => (
        <div className="special primarch" key={`primarch-${index}`}>
          <div className="heading">
            <div className="title">{localize(group.name, lang)}</div>
          </div>
          {(group.abilities || []).map((ability, aIndex) => (
            <div className="description-container" key={`primarch-${index}-${aIndex}`}>
              <span className="description">
                <MarkupText
                  content={`<k>${localize(ability.name, lang)}:</k> ${localize(ability.description, lang)}`}
                />
              </span>
            </div>
          ))}
        </div>
      ))}
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
