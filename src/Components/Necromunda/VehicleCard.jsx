export const VehicleCard = ({ vehicle, cardStyle, paddingTop = "32px" }) => {
  return (
    <div
      style={{
        paddingTop,
        justifyContent: "center",
        justifyItems: "center",
        display: "flex",
      }}
      className="vehicle">
      <div className={`page ${vehicle.variant || "card"}`} style={cardStyle}>
        <div style={{ display: "grid", gridTemplateColumns: "5fr 4fr 1fr", columnGap: "8px" }}>
          <div className="header">
            <span className="name">{vehicle.name}</span>
          </div>
          <div className="header">
            <span className="type">{vehicle.type || ""}</span>
          </div>
            
          <div className="cost">{vehicle.cost}</div>
        </div>
        <div className="datasheet">
          <div className="categories">
            <div></div>
            <div>VEHICLE</div>
            <div>CREW NAME</div>
          </div>
          <div className="legend">
            <div className="movement">
              <div>M</div>
            </div>
            <div className="toughness">
              <div>FRONT</div>
              <div>SIDE</div>
              <div>REAR</div>
            </div>
            <div className="stats">
              <div>HP</div>
              <div>HND</div>
              <div>SV</div>
            </div>
            <div className="crew">
              <div>BS</div>
              <div>LD</div>
              <div>CL</div>
              <div>WIL</div>
              <div>INT</div>
              <div>EXP</div>
            </div>
          </div>
          <div className="line">
            <div className="movement">
              <div>{vehicle.datasheet.M}</div>
            </div>
            <div className="toughness">
              <div>{vehicle.datasheet.FRONT}</div>
              <div>{vehicle.datasheet.SIDE}</div>
              <div>{vehicle.datasheet.REAR}</div>
            </div>
            <div className="stats">
              <div>{vehicle.datasheet.HP}</div>
              <div>{vehicle.datasheet.HND}</div>
              <div>{vehicle.datasheet.SV}</div>
            </div>
            <div className="crew">
              <div>{vehicle.datasheet.BS}</div>
              <div>{vehicle.datasheet.LD}</div>
              <div>{vehicle.datasheet.CL}</div>
              <div>{vehicle.datasheet.WIL}</div>
              <div>{vehicle.datasheet.INT}</div>
              <div>{vehicle.datasheet.EXP}</div>
            </div>
          </div>
        </div>
        <div className="weapons">
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
          {vehicle.weapons.map((weapon, index) => {
            if (weapon.profiles.length > 1) {
              return weapon.profiles.map((profile, pIndex) => (
                <div className="line" key={`weapon-${index}-${pIndex}`}>
                  <div>{weapon.name}</div>
                  <div>4</div>
                  <div>4</div>
                  <div>4</div>
                  <div>5</div>
                  <div>5</div>
                  <div>5</div>
                  <div>5</div>
                  <div>5</div>
                  <div>Ranged</div>
                </div>
              ));
            } else {
              return (
                <div className="line" key={`weapon-${index}`}>
                  <div>{weapon.name}</div>
                  <div>{weapon.profiles[0].S}</div>
                  <div>{weapon.profiles[0].L}</div>
                  <div>{weapon.profiles[0].S2}</div>
                  <div>{weapon.profiles[0].L2}</div>
                  <div>{weapon.profiles[0].STR}</div>
                  <div>{weapon.profiles[0].AP}</div>
                  <div>{weapon.profiles[0].D}</div>
                  <div>{weapon.profiles[0].AM}</div>
                  <div>
                    {weapon.profiles[0]?.traits
                      ?.filter((trait) => trait.active)
                      .map((trait) => trait.name)
                      .join(", ")}
                  </div>
                </div>
              );
            }
          })}
        </div>
        <div className="wargear">
          <div className="title">Wargear</div>
          <div className="title">
            {vehicle.wargear
              ?.filter((wargear) => wargear.active)
              .map((wargear) => wargear.name)
              .join(", ")}
          </div>
        </div>
        <div className="abilities">
          <div className="title">abilities</div>
          <div className="title">
            {vehicle.skills
              ?.filter((skill) => skill.active)
              .map((skill) => skill.name)
              .join(", ")}
          </div>
        </div>
        <div className="rules">
          <div className="title">rules</div>
          <div className="title">
            {vehicle.rules
              ?.filter((rule) => rule.active)
              .map((rule) => rule.name)
              .join(", ")}
          </div>
        </div>
      </div>
    </div>
  );
};
