import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { localize } from "../../../Helpers/localization.helpers";

// 11th edition keywords are language-keyed objects; resolve before rendering.
export const UnitKeywords = ({ keywords, label }) => {
  const { settings } = useSettingsStorage();
  const resolved = keywords?.map((keyword) => localize(keyword, settings.language));
  return (
    <div className="keywords">
      <span className="title">{label || "keywords"}</span>
      <span className="value">
        {resolved?.map((keyword, i, { length }) => {
          if (keyword?.includes(":")) {
            return (
              <span key={keyword} style={{ fontWeight: 400, textTransform: "uppercase", fontSize: "0.9rem" }}>
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
