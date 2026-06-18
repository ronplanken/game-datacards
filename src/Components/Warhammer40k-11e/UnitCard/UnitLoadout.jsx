import { MarkupText } from "./UnitAbilityDescription";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { localize } from "../../../Helpers/localization.helpers";

// 11th edition: composition is an array of language-keyed markdown lines, loadout
// and leader are single language-keyed markdown strings (leader uses ■ bullets).
export const UnitLoadout = ({ unit }) => {
  const { settings } = useSettingsStorage();
  const lang = settings.language;

  const composition = unit.composition?.map((entry) => localize(entry, lang)).filter(Boolean);
  const loadout = localize(unit.loadout, lang);
  const leader = localize(unit.leader, lang);

  return (
    <div className="extra">
      <div className="composition_container">
        {composition?.length > 0 && (
          <>
            <div className="heading">
              <div className="title">Unit Composition</div>
            </div>
            {composition.map((entry, index) => (
              <div className="composition" key={`composition-${index}`}>
                <span className="description">
                  <MarkupText content={entry} />
                </span>
              </div>
            ))}
          </>
        )}
        {loadout && (
          <div className="loadout">
            <div className="description">
              <MarkupText content={loadout} />
            </div>
          </div>
        )}
        {leader && (
          <>
            <div className="heading">
              <div className="title">Leader</div>
            </div>
            <div className="leader">
              <span className="description">
                <MarkupText content={leader} />
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
