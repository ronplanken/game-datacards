import { MarkupText } from "./UnitAbilityDescription";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { localize } from "../../../Helpers/localization.helpers";
import { getWargearOptionGroups } from "../../../Helpers/listPoints.helpers";

// 11th edition carries wargear two ways:
//
//   `wargear`       — an array of language-keyed sentences, which in the 11e
//                     data is usually just "None".
//   `wargearOptions` — the structured groups the datasheet really offers:
//                     an instruction plus the swaps it allows, some of which
//                     cost points.
//
// Both are rendered when both have content (the sentences first), and "None"
// alone is dropped so a datasheet with real options is not described as having
// none. The section disappears entirely when neither has anything to say.
export const UnitWargear = ({ unit }) => {
  const { settings } = useSettingsStorage();
  const lang = settings.language;

  const items = (unit.wargear || [])
    .map((entry) => localize(entry, lang))
    .filter((entry) => entry && entry.trim().toLowerCase() !== "none");

  const groups = getWargearOptionGroups(unit);

  // An absent showWargear flag means shown.
  if (unit.showWargear === false || (items.length === 0 && groups.length === 0)) {
    return <div className="wargear_container" />;
  }

  return (
    <div className="wargear_container">
      <div className="wargear">
        <div className="heading">
          <div className="title">Wargear Options</div>
        </div>
        <div className="content">
          {items.map((item, index) => (
            <div className="item" key={`wargear-${index}`}>
              <span className="description">
                <MarkupText content={item} />
              </span>
            </div>
          ))}
          {groups.map((group, index) => {
            const instruction = localize(group.instruction, lang);
            return (
              <div className="item wargear-group" key={`wargear-group-${index}`}>
                {instruction && (
                  <span className="description">
                    <MarkupText content={instruction} />
                  </span>
                )}
                <div className="wargear-options">
                  {group.options.map((option, optionIndex) => (
                    <div className="wargear-option" key={`wargear-option-${optionIndex}`}>
                      <span className="description">
                        {localize(option.name, lang)}
                        {option.cost > 0 ? ` (+${option.cost} pts)` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
