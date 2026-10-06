import { MarkupText } from "./UnitAbilityDescription";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { localize } from "../../../Helpers/localization.helpers";

// An enhancement picked in the list builder lives on the list card as
// `selectedEnhancement`; it is never written into the datasheet's `abilities`
// and has no editor panel. It still has to show up on the card, so it is
// rendered here in the wide left column with the primarch ability styling.
//
// The name doubles as the block heading (upgrade names already carry their
// "(Upgrade)" suffix in the datasource, so no extra label is needed).
export const UnitSelectedEnhancement = ({ unit }) => {
  const { settings } = useSettingsStorage();
  const lang = settings.language;
  const enhancement = unit.selectedEnhancement;
  const name = localize(enhancement?.name, lang);

  if (!name) {
    return null;
  }

  const description = localize(enhancement?.description, lang);

  return (
    <div className="special primarch selected-enhancement">
      <div className="heading">
        <div className="title">{name}</div>
      </div>
      {description && (
        <div className="description-container">
          <span className="description">
            <MarkupText content={description} />
          </span>
        </div>
      )}
    </div>
  );
};
