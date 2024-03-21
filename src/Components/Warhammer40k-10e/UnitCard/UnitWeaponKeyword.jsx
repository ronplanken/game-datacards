import { KeywordTooltip } from "./KeywordTooltip";

export const tooltipProps = {
  placement: "bottom",
  arrowPointAtCenter: true,
};

export const UnitWeaponKeywords = ({ keywords }) => {
  const tooltips = keywords.map((keyword, index) => {
    return <KeywordTooltip keyword={keyword} key={`${keyword}-${index}`} />;
  });

  return <span className="keyword">{tooltips}</span>;
};
