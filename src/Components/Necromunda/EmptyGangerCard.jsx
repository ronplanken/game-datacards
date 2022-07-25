export const EmptyGangerCard = ({ paddingTop = "32px" }) => {
  return (
    <div
      className="ganger"
      style={{
        paddingTop,
        justifyContent: "center",
        justifyItems: "center",
        display: "flex",
      }}>
      <div className="page">
        <div style={{ display: "grid", gridTemplateColumns: "9fr 1fr", columnGap: "8px" }}>
          <div className="header">
            <span className="name"></span>
            <span className="type"></span>
          </div>
          <div className="cost"></div>
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
              <div>&nbsp;</div>
              <div>&nbsp;</div>
              <div>&nbsp;</div>
              <div>&nbsp;</div>
              <div>&nbsp;</div>
              <div>&nbsp;</div>
              <div>&nbsp;</div>
              <div>&nbsp;</div>
            </div>
            <div className="data">
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
