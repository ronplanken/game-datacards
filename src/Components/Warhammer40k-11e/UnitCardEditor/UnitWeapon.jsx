import { Trash2 } from "lucide-react";
import { Button, Card, Divider, Input, Popconfirm, Space, Typography } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { localize, setLocalizedField } from "../../../Helpers/localization.helpers";

// 11th edition weapons have profiles only (no weapon-level abilities) and no
// per-profile `active` flag. The profile name is language-keyed; range/attacks/
// skill/strength/ap/damage and keywords are plain values.
export function UnitWeapon({ weapon, index, type }) {
  const { activeCard, updateActiveCard } = useCardStorage();
  const { settings } = useSettingsStorage();
  const lang = settings.language;

  const handleSheetChange = (event, pIndex) => {
    const newWeapons = [...activeCard[type]];
    const profiles = [...newWeapons[index].profiles];
    profiles[pIndex] = { ...profiles[pIndex], [event.target.name]: event.target.value };
    newWeapons[index] = { ...newWeapons[index], profiles };
    updateActiveCard({ ...activeCard, [type]: newWeapons });
  };

  return (
    <>
      {weapon?.profiles?.map((line, pIndex) => {
        return (
          <Card
            key={`line-${index}-${pIndex}`}
            type={"inner"}
            size={"small"}
            title={
              <Typography.Text
                editable={{
                  onChange: (value) => {
                    const newWeapons = [...activeCard[type]];
                    const profiles = [...newWeapons[index].profiles];
                    profiles[pIndex] = {
                      ...profiles[pIndex],
                      name: setLocalizedField(profiles[pIndex].name, lang, value),
                    };
                    newWeapons[index] = { ...newWeapons[index], profiles };
                    updateActiveCard({ ...activeCard, [type]: newWeapons });
                  },
                }}>
                {localize(line.name, lang)}
              </Typography.Text>
            }
            bodyStyle={{ padding: 0 }}
            style={{ marginBottom: "0px" }}
            extra={
              <Space>
                <Popconfirm
                  title={"Are you sure you want to delete this weapon?"}
                  placement="topRight"
                  onConfirm={() =>
                    updateActiveCard(() => {
                      const newWeapons = [...activeCard[type]];
                      const profiles = [...newWeapons[index].profiles];
                      profiles.splice(pIndex, 1);
                      if (profiles.length === 0) {
                        newWeapons.splice(index, 1);
                      } else {
                        newWeapons[index] = { ...newWeapons[index], profiles };
                      }
                      return { ...activeCard, [type]: newWeapons };
                    })
                  }>
                  <Button type="icon" shape="circle" size="small" icon={<Trash2 size={14} />}></Button>
                </Popconfirm>
              </Space>
            }>
            <div className="header">
              <div className="weapons_header">
                <div className="weapon">
                  <div className="caption double">Range</div>
                </div>
                <div className="weapon">
                  <div className="caption">A</div>
                </div>
                <div className="weapon">
                  <div className="caption">Skill</div>
                </div>
                <div className="weapon">
                  <div className="caption">S</div>
                </div>
                <div className="weapon">
                  <div className="caption">AP</div>
                </div>
                <div className="weapon">
                  <div className="caption">D</div>
                </div>
              </div>
              <div className="weapons_container" style={{ paddingBottom: "4px", paddingTop: "4px" }}>
                <div className="weapon">
                  <div className="value_container">
                    <div className="value double">
                      <Input
                        type="text"
                        value={line.range}
                        name="range"
                        onChange={(e) => handleSheetChange(e, pIndex)}
                      />
                    </div>
                  </div>
                </div>
                <div className="weapon">
                  <div className="value_container">
                    <div className="value">
                      <Input
                        type="text"
                        value={line.attacks}
                        name="attacks"
                        onChange={(e) => handleSheetChange(e, pIndex)}
                      />
                    </div>
                  </div>
                </div>
                <div className="weapon">
                  <div className="value_container">
                    <div className="value">
                      <Input
                        type="text"
                        value={line.skill}
                        name="skill"
                        onChange={(e) => handleSheetChange(e, pIndex)}
                      />
                    </div>
                  </div>
                </div>
                <div className="weapon">
                  <div className="value_container">
                    <div className="value">
                      <Input
                        type="text"
                        value={line.strength}
                        name="strength"
                        onChange={(e) => handleSheetChange(e, pIndex)}
                      />
                    </div>
                  </div>
                </div>
                <div className="weapon">
                  <div className="value_container">
                    <div className="value">
                      <Input type="text" value={line.ap} name="ap" onChange={(e) => handleSheetChange(e, pIndex)} />
                    </div>
                  </div>
                </div>
                <div className="weapon">
                  <div className="value_container">
                    <div className="value">
                      <Input
                        type="text"
                        value={line.damage}
                        name="damage"
                        onChange={(e) => handleSheetChange(e, pIndex)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="keywords_header">Keywords</div>
              <div className="keywords_container" style={{ paddingBottom: "4px", paddingTop: "4px" }}>
                {(line.keywords || []).map((keyword, kIndex) => {
                  return (
                    <div className="keyword_container" key={`keyword-${index}-${pIndex}-${kIndex}`}>
                      <Typography.Text
                        editable={{
                          onChange: (value) => {
                            const newWeapons = [...activeCard[type]];
                            const profiles = [...newWeapons[index].profiles];
                            const keywords = [...(profiles[pIndex].keywords || [])];
                            keywords[kIndex] = value;
                            profiles[pIndex] = { ...profiles[pIndex], keywords };
                            newWeapons[index] = { ...newWeapons[index], profiles };
                            updateActiveCard({ ...activeCard, [type]: newWeapons });
                          },
                        }}>
                        {keyword}
                      </Typography.Text>
                      <Button
                        type="text"
                        size="small"
                        icon={<Trash2 size={14} />}
                        onClick={() =>
                          updateActiveCard(() => {
                            const newWeapons = [...activeCard[type]];
                            const profiles = [...newWeapons[index].profiles];
                            const keywords = [...(profiles[pIndex].keywords || [])];
                            keywords.splice(kIndex, 1);
                            profiles[pIndex] = { ...profiles[pIndex], keywords };
                            newWeapons[index] = { ...newWeapons[index], profiles };
                            return { ...activeCard, [type]: newWeapons };
                          })
                        }></Button>
                    </div>
                  );
                })}
                <Button
                  type="dashed"
                  size="small"
                  style={{ width: "100%" }}
                  onClick={() =>
                    updateActiveCard(() => {
                      const newWeapons = [...activeCard[type]];
                      const profiles = [...newWeapons[index].profiles];
                      const keywords = [...(profiles[pIndex].keywords || [])];
                      keywords.push(`keyword ${keywords.length + 1}`);
                      profiles[pIndex] = { ...profiles[pIndex], keywords };
                      newWeapons[index] = { ...newWeapons[index], profiles };
                      return { ...activeCard, [type]: newWeapons };
                    })
                  }>
                  Add keyword
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
      <Button
        type="dashed"
        style={{ width: "100%", marginTop: 4, marginBottom: 4, borderColor: "#898989" }}
        onClick={() =>
          updateActiveCard(() => {
            const newWeapons = [...activeCard[type]];
            const profiles = [...newWeapons[index].profiles];
            profiles.push({
              name: { [lang]: `Profile ${profiles.length + 1}` },
              range: "",
              attacks: "",
              skill: "",
              strength: "",
              ap: "",
              damage: "",
              keywords: [],
            });
            newWeapons[index] = { ...newWeapons[index], profiles };
            return { ...activeCard, [type]: newWeapons };
          })
        }>
        Add profile
      </Button>
      <Divider />
    </>
  );
}
