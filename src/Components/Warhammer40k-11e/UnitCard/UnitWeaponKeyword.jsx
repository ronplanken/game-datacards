import { Fragment } from "react";
import { Button } from "antd";
import { Tooltip } from "../../Tooltip/Tooltip";
import { LocalizedMarkup } from "./UnitAbilityDescription";
import { resolve11eKeywordEntry } from "../../../Helpers/keyword11eGlossary.helpers";
import { use11eKeywordGlossary } from "../../../Hooks/use11eKeywordGlossary";

// 11th edition weapon keywords. When the datasource ships a keyword glossary,
// keywords that resolve to an entry get a hover tooltip with the localised
// explanation (and a "has info" affordance); keywords with no match render as
// plain keyword buttons, exactly as before.
export const UnitWeaponKeywords = ({ keywords }) => {
  const glossary = use11eKeywordGlossary();

  return (
    <span className="keyword">
      {keywords?.map((keyword, index) => {
        const entry = resolve11eKeywordEntry(keyword, glossary, "weapon");
        const button = (
          <Button type="text" size="small" className={`keyword-button${entry ? " keyword-button--has-info" : ""}`}>
            {keyword}
          </Button>
        );

        // The keyed wrapper is the array child, so the button itself needs no key.
        return (
          <Fragment key={`${keyword}-${index}`}>
            {entry ? (
              <Tooltip placement="bottom" content={<LocalizedMarkup value={entry.description} />}>
                {button}
              </Tooltip>
            ) : (
              button
            )}
          </Fragment>
        );
      })}
    </span>
  );
};
