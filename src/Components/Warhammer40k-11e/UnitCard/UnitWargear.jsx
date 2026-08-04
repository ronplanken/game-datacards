import { MarkupText } from "./UnitAbilityDescription";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { localize } from "../../../Helpers/localization.helpers";
import { getWargearOptionGroups } from "../../../Helpers/listPoints.helpers";

// 11th edition carries wargear two ways, and the source data fills both with
// the same content:
//
//   `wargearOptions` — the structured groups the datasheet offers: an
//                      instruction plus the swaps it allows, some of which cost
//                      points.
//   `wargear`        — those same instructions flattened into sentences, or
//                      just "None" on the datasheets that offer nothing.
//
// Rendering both printed every instruction twice, so the structured groups win.
// The sentences are only a fallback, for cards that carry no groups at all
// (hand-made cards and older imports). The section disappears entirely when
// neither has anything to say.
export const UnitWargear = ({ unit }) => {
  const { settings } = useSettingsStorage();
  const lang = settings.language;

  const groups = getWargearOptionGroups(unit);

  const items = groups.length
    ? []
    : (unit.wargear || [])
        .map((entry) => localize(entry, lang))
        .filter((entry) => entry && entry.trim().toLowerCase() !== "none");

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
