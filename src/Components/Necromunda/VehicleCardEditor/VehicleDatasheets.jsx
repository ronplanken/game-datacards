import { Card, Input } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";

export function VehicleDatasheet() {
  const { activeCard, updateActiveCard } = useCardStorage();

  const handleSheetChange = (event) => {
    const newDatasheet = { ...activeCard.datasheet };
    newDatasheet[event.target.name] = event.target.value;
    updateActiveCard({ ...activeCard, datasheet: newDatasheet });
  };

  return (
    <Card
      type={"inner"}
      size={"small"}
      title={activeCard.datasheet.name}
      bodyStyle={{ padding: 0 }}
      style={{ marginBottom: "0px" }}
      className="vehicle">
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
            <div>
              <Input type="text" value={activeCard.datasheet.M} name="M" onChange={(e) => handleSheetChange(e)} />
            </div>
          </div>
          <div className="toughness">
            <div>
              <Input
                type="text"
                value={activeCard.datasheet.FRONT}
                name="FRONT"
                onChange={(e) => handleSheetChange(e)}
              />
            </div>
            <div>
              <Input type="text" value={activeCard.datasheet.SIDE} name="SIDE" onChange={(e) => handleSheetChange(e)} />
            </div>
            <div>
              <Input type="text" value={activeCard.datasheet.REAR} name="REAR" onChange={(e) => handleSheetChange(e)} />
            </div>
          </div>
          <div className="stats">
            <div>
              <Input type="text" value={activeCard.datasheet.HP} name="HP" onChange={(e) => handleSheetChange(e)} />
            </div>
            <div>
              <Input type="text" value={activeCard.datasheet.HND} name="HND" onChange={(e) => handleSheetChange(e)} />
            </div>
            <div>
              <Input type="text" value={activeCard.datasheet.SV} name="SV" onChange={(e) => handleSheetChange(e)} />
            </div>
          </div>
          <div className="crew">
            <div>
              <Input type="text" value={activeCard.datasheet.BS} name="BS" onChange={(e) => handleSheetChange(e)} />
            </div>
            <div>
              <Input type="text" value={activeCard.datasheet.LD} name="LD" onChange={(e) => handleSheetChange(e)} />
            </div>
            <div>
              <Input type="text" value={activeCard.datasheet.CL} name="CL" onChange={(e) => handleSheetChange(e)} />
            </div>
            <div>
              <Input type="text" value={activeCard.datasheet.WIL} name="WIL" onChange={(e) => handleSheetChange(e)} />
            </div>
            <div>
              <Input type="text" value={activeCard.datasheet.INT} name="INT" onChange={(e) => handleSheetChange(e)} />
            </div>
            <div>
              <Input type="text" value={activeCard.datasheet.EXP} name="EXP" onChange={(e) => handleSheetChange(e)} />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
