import { Card, Input } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";

export function GangerDatasheets() {
  const { activeCard, updateActiveCard } = useCardStorage();

  const handleSheetChange = (event) => {
    const newDatasheet = { ...activeCard.datasheet };
    console.log(newDatasheet);
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
      className="ganger">
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
            <div>
              <Input
                type="text"
                value={activeCard.datasheet.M}
                name="M"
                onChange={(e) => handleSheetChange(e)}
              />
            </div>
            <div>
              <Input
                type="text"
                value={activeCard.datasheet.WS}
                name="WS"
                onChange={(e) => handleSheetChange(e)}
              />
            </div>
            <div>
              <Input
                type="text"
                value={activeCard.datasheet.BS}
                name="BS"
                onChange={(e) => handleSheetChange(e)}
              />
            </div>
            <div>
              <Input
                type="text"
                value={activeCard.datasheet.S}
                name="S"
                onChange={(e) => handleSheetChange(e)}
              />
            </div>
            <div>
              <Input
                type="text"
                value={activeCard.datasheet.T}
                name="T"
                onChange={(e) => handleSheetChange(e)}
              />
            </div>
            <div>
              <Input
                type="text"
                value={activeCard.datasheet.W}
                name="W"
                onChange={(e) => handleSheetChange(e)}
              />
            </div>
            <div>
              <Input
                type="text"
                value={activeCard.datasheet.I}
                name="I"
                onChange={(e) => handleSheetChange(e)}
              />
            </div>
            <div>
              <Input
                type="text"
                value={activeCard.datasheet.A}
                name="A"
                onChange={(e) => handleSheetChange(e)}
              />
            </div>
          </div>
          <div className="data">
            <div>
              <Input
                type="text"
                value={activeCard.datasheet.LD}
                name="LD"
                onChange={(e) => handleSheetChange(e)}
              />
            </div>
            <div>
              <Input
                type="text"
                value={activeCard.datasheet.CL}
                name="CL"
                onChange={(e) => handleSheetChange(e)}
              />
            </div>
            <div>
              <Input
                type="text"
                value={activeCard.datasheet.WIL}
                name="WIL"
                onChange={(e) => handleSheetChange(e)}
              />
            </div>
            <div>
              <Input
                type="text"
                value={activeCard.datasheet.INT}
                name="INT"
                onChange={(e) => handleSheetChange(e)}
              />
            </div>
            <div>
              <Input
                type="text"
                value={activeCard.datasheet.EXP}
                name="EXP"
                onChange={(e) => handleSheetChange(e)}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
