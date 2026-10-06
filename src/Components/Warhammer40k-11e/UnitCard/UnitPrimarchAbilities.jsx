import { MarkupText } from "./UnitAbilityDescription";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { localize } from "../../../Helpers/localization.helpers";

// Primarch abilities nest a set of sub-abilities under a named group. They sit
// below the weapon tables in the wide left column (matching 10e) instead of the
// narrow abilities column, because the grouped rule text needs the extra width.
export const UnitPrimarchAbilities = ({ unit }) => {
  const { settings } = useSettingsStorage();
  const lang = settings.language;
  const groups = unit.showAbilities?.primarch !== false ? (unit.abilities?.primarch || []).filter((a) => a?.name) : [];

  return (
    <>
      {groups.map((group, index) => (
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
    </>
  );
};
