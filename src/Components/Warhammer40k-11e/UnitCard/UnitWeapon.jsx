import { Grid } from "antd";
import { UnitWeaponKeywords } from "./UnitWeaponKeyword";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { localize } from "../../../Helpers/localization.helpers";
import { normalizeKeywords } from "../../../Helpers/weaponProfile.helpers";

const { useBreakpoint } = Grid;

// 11th edition weapon profiles carry no `active` flag (all are shown) and the
// profile name is language-keyed.
export const UnitWeapon = ({ weapon }) => {
  const screens = useBreakpoint();
  const { settings } = useSettingsStorage();

  return (
    <>
      {weapon.profiles?.map((line, index, profiles) => {
        const name = localize(line.name, settings.language);
        // Saved cards can carry a string here (see normalizeKeywords).
        const keywords = normalizeKeywords(line.keywords);
        return (
          <div
            className={`weapon${profiles.length > 1 ? " multi-line" : ""}`}
            key={`weapon-line-${index}`}
            data-name={name}>
            <div className="line">
              <div className="value" style={{ display: "flex", flexWrap: "wrap" }}>
                <span>{name}</span>
                {keywords.length > 0 && !screens.xs && (
                  <span style={{ paddingLeft: "4px" }}>
                    <UnitWeaponKeywords keywords={keywords} />
                  </span>
                )}
              </div>
              <div className="value center">{line.range}</div>
              <div className="value center">{line.attacks}</div>
              <div className="value center">{line.skill}</div>
              <div className="value center">{line.strength}</div>
              <div className="value center">{line.ap}</div>
              <div className="value center">{line.damage}</div>
              {keywords.length > 0 && screens.xs && <UnitWeaponKeywords keywords={keywords} />}
            </div>
          </div>
        );
      })}
    </>
  );
};
