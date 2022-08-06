export const EmptyVehicleCard = ({ vehicle, cardStyle, paddingTop = "32px" }) => {
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
            <span className="name"></span>
          </div>
          <div className="header">
            <span className="type"></span>
          </div>

          <div className="cost"></div>
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
              <div>&nbsp;</div>
            </div>
            <div className="toughness">
              <div>&nbsp;</div>
              <div>&nbsp;</div>
              <div>&nbsp;</div>
            </div>
            <div className="stats">
              <div>&nbsp;</div>
              <div>&nbsp;</div>
              <div>&nbsp;</div>
            </div>
            <div className="crew">
              <div>&nbsp;</div>
              <div>&nbsp;</div>
              <div>&nbsp;</div>
              <div>&nbsp;</div>
              <div>&nbsp;</div>
              <div>&nbsp;</div>
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
          <div className="line">
            <div>&nbsp;</div>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
          </div>
          <div className="line">
            <div>&nbsp;</div>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
          </div>
          <div className="line">
            <div>&nbsp;</div>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
          </div>
          <div className="line">
            <div>&nbsp;</div>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
          </div>
        </div>
        <div className="wargear">
          <div className="title">Wargear</div>
          <div className="title">&nbsp;</div>
        </div>
        <div className="abilities">
          <div className="title">abilities</div>
          <div className="title">&nbsp;</div>
        </div>
        <div className="rules">
          <div className="title">rules</div>
          <div className="title">&nbsp;</div>
        </div>
      </div>
    </div>
  );
};
