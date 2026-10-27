import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { localize } from "../../../Helpers/localization.helpers";
import { getKeywordGroups } from "../../../Helpers/unitKeywords.helpers";

const LABEL_STYLE = { fontWeight: 400, textTransform: "uppercase", fontSize: "0.9rem" };

// 11th edition keywords are language-keyed objects; resolve before rendering.
export const UnitKeywords = ({ keywords, modelKeywords, label }) => {
  const { settings } = useSettingsStorage();
  const groups = getKeywordGroups(keywords, modelKeywords);
  if (groups) {
    return (
      <div className="keywords">
        <span className="title">{label || "keywords"}</span>
        <span className="value">
          {groups.map((group, i) => (
            <span key={i} className="keyword-group">
              <span style={LABEL_STYLE}>
                {group.name ? localize(group.name, settings.language) : "All models"}:&nbsp;
              </span>
              {group.keywords.map((keyword) => localize(keyword, settings.language)).join(", ")}
              {i < groups.length - 1 ? " " : ""}
            </span>
          ))}
        </span>
      </div>
    );
  }
  const resolved = keywords?.map((keyword) => localize(keyword, settings.language));
  return (
    <div className="keywords">
      <span className="title">{label || "keywords"}</span>
      <span className="value">
        {resolved?.map((keyword, i, { length }) => {
          if (keyword?.includes(":")) {
            return (
              <span key={keyword} style={LABEL_STYLE}>
                {keyword}&nbsp;
              </span>
            );
          }
          return `${keyword}${length - 1 !== i ? "," : ""} `;
        })}
      </span>
    </div>
  );
};
