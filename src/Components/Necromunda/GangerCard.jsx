import { MarkdownDisplay } from "../MarkdownDisplay";

export const GangerCard = ({ unit, cardStyle, paddingTop = "32px" }) => {
  return (
    <div
      className="ganger"
      style={{
        paddingTop,
        justifyContent: "center",
        justifyItems: "center",
        display: "flex",
      }}>
      <div className={`page ${unit.variant || "card"}`} style={cardStyle}>
        <div style={{ display: "grid", gridTemplateColumns: "9fr 1fr", columnGap: "8px" }}>
          <div className="header">
            <span className="name">{unit.name}</span>
            <span className="type">{unit.type || ""}</span>
          </div>
          <div className="cost">{unit.cost}</div>
        </div>
        <div className="datasheet">
          <div className="legend">
            <div className="stats">
              <div>M</div>
              <div>WS</div>
              <div>BS</div>
              <div>S</div>
              <div>T</div>
              <div>W</div>
              <div>I</div>
              <div>A</div>
            </div>
            <div className="data">
              <div>LD</div>
              <div>CL</div>
              <div>WIL</div>
              <div>INT</div>
              <div>EXP</div>
            </div>
          </div>
          <div className="line">
            <div className="stats">
              <div>{unit.datasheet.M}</div>
              <div>{unit.datasheet.WS}</div>
              <div>{unit.datasheet.BS}</div>
              <div>{unit.datasheet.S}</div>
              <div>{unit.datasheet.T}</div>
              <div>{unit.datasheet.W}</div>
              <div>{unit.datasheet.I}</div>
              <div>{unit.datasheet.A}</div>
            </div>
            <div className="data">
              <div>{unit.datasheet.LD}</div>
              <div>{unit.datasheet.CL}</div>
              <div>{unit.datasheet.WIL}</div>
              <div>{unit.datasheet.INT}</div>
              <div>{unit.datasheet.EXP}</div>
            </div>
          </div>
        </div>

        <div className="weapons">
          {unit.weapons?.filter((sheet) => sheet.active).length > 0 && (
            <div className="legend">
              <div>Weapon</div>
              <div>S</div>
              <div>L</div>
              <div>S</div>
              <div>L</div>
              <div>Str</div>
              <div>Ap</div>
              <div>D</div>
              <div>Am</div>
              <div>Traits</div>
            </div>
          )}
          {unit.weapons.map((weapon, index) => {
            if (!weapon.active) {
              return <></>;
            }
            if (weapon.profiles.length > 1) {
              return weapon.profiles.map((profile, pIndex) => (
                <div className="line" key={`weapon-${index}-${pIndex}`}>
                  <div>{weapon.name}</div>
                  <div>{weapon.profiles[pIndex].S}</div>
                  <div>{weapon.profiles[pIndex].L}</div>
                  <div>{weapon.profiles[pIndex].S2}</div>
                  <div>{weapon.profiles[pIndex].L2}</div>
                  <div>{weapon.profiles[pIndex].STR}</div>
                  <div>{weapon.profiles[pIndex].AP}</div>
                  <div>{weapon.profiles[pIndex].D}</div>
                  <div>{weapon.profiles[pIndex].AM}</div>
                  <div>
                    {weapon.profiles[pIndex]?.traits
                      ?.filter((trait) => trait.active)
                      .map((trait) => trait.name)
                      .join(", ")}
                  </div>
                </div>
              ));
            } else if (weapon.profiles[0]) {
              return (
                <div className="line" key={`weapon-${index}`}>
                  <div>{weapon.name}</div>
                  <div>{weapon.profiles[0]?.S}</div>
                  <div>{weapon.profiles[0]?.L}</div>
                  <div>{weapon.profiles[0]?.S2}</div>
                  <div>{weapon.profiles[0]?.L2}</div>
                  <div>{weapon.profiles[0]?.STR}</div>
                  <div>{weapon.profiles[0]?.AP}</div>
                  <div>{weapon.profiles[0]?.D}</div>
                  <div>{weapon.profiles[0]?.AM}</div>
                  <div>
                    {weapon.profiles[0]?.traits
                      ?.filter((trait) => trait.active)
                      .map((trait) => trait.name)
                      .join(", ")}
                  </div>
                </div>
              );
            }
            return <></>;
          })}
        </div>
        <div className="divider" />
        {unit.wargear?.filter((wargear) => wargear.active).length > 0 && (
          <div className="wargear">
            <div className="title">Wargear</div>
            <div className="options">
              <MarkdownDisplay
                content={unit.wargear
                  ?.filter((wargear) => wargear.active)
                  .map((wargear) => wargear.description)
                  .join(", ")}
              />
            </div>
          </div>
        )}
        {unit.skills?.filter((skill) => skill.active).length > 0 && (
          <div className="abilities">
            <div className="title">abilities</div>
            <div className="options">
              <MarkdownDisplay
                content={unit.skills
                  ?.filter((skill) => skill.active)
                  .map((skill) => skill.description)
                  .join(", ")}
              />
            </div>
          </div>
        )}
        {unit.rules?.filter((rule) => rule.active).length > 0 && (
          <div className="rules">
            <div className="title">rules</div>
            <div className="options">
              <MarkdownDisplay
                content={unit.rules
                  ?.filter((rule) => rule.active)
                  .map((rule) => rule.description)
                  .join(", ")}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
