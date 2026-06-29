import { Fragment } from "react";
import { Tooltip } from "../../Tooltip/Tooltip";
import { LocalizedMarkup } from "./UnitAbilityDescription";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { localize } from "../../../Helpers/localization.helpers";
import { resolve11eKeywordEntry } from "../../../Helpers/keyword11eGlossary.helpers";
import { use11eKeywordGlossary } from "../../../Hooks/use11eKeywordGlossary";

// Core abilities row (e.g. "Deadly Demise D3, Deep Strike, Feel No Pain 5+").
// `abilities` is the raw array of { name: {lang} }. Each ability is displayed in
// the selected language but matched against the glossary in its canonical English
// form, so a matched core ability gets a hover tooltip with its localised rule.
// Falls back to the plain comma-joined list when nothing matches.
export const UnitCoreAbilities = ({ abilities }) => {
  const glossary = use11eKeywordGlossary();
  const { settings } = useSettingsStorage();

  const items = (abilities || []).map((ability) => ability?.name).filter(Boolean);
  if (items.length === 0) return null;

  return (
    <div className="ability" data-name="core">
      <span className="title">core</span>
      <span className="value">
        {items.map((name, index) => {
          const display = localize(name, settings.language);
          const entry = resolve11eKeywordEntry(localize(name, "en"), glossary, "core");
          return (
            <Fragment key={`core-ability-${index}`}>
              {index > 0 && ", "}
              {entry ? (
                <Tooltip placement="bottom" content={<LocalizedMarkup value={entry.description} />}>
                  <span className="keyword-info">{display}</span>
                </Tooltip>
              ) : (
                <span>{display}</span>
              )}
            </Fragment>
          );
        })}
      </span>
    </div>
  );
};
