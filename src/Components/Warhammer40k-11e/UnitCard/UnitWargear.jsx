import { MarkupText } from "./UnitAbilityDescription";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { localize } from "../../../Helpers/localization.helpers";

// 11th edition wargear is an array of language-keyed strings (often just "None").
// Render the section only when there are meaningful options.
export const UnitWargear = ({ unit }) => {
  const { settings } = useSettingsStorage();
  const lang = settings.language;

  const items = (unit.wargear || [])
    .map((entry) => localize(entry, lang))
    .filter((entry) => entry && entry.trim().toLowerCase() !== "none");

  if (items.length === 0) {
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
        </div>
      </div>
    </div>
  );
};
