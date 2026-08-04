import { KeywordTooltip } from "./KeywordTooltip";
import { normalizeKeywords } from "../../../Helpers/weaponProfile.helpers";

export const tooltipProps = {
  placement: "bottom",
  arrowPointAtCenter: true,
};

export const UnitWeaponKeywords = ({ keywords }) => {
  const tooltips = normalizeKeywords(keywords).map((keyword, index) => {
    return <KeywordTooltip keyword={keyword} key={`${keyword}-${index}`} />;
  });

  return <span className="keyword">{tooltips}</span>;
};
