import { DeleteFilled } from "@ant-design/icons";
import { Button, Card, Input, Popconfirm, Space, Switch, Typography } from "antd";
import React, { useState } from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";

export function UnitWeapon({ weapon, index, type }) {
  const { activeCard, updateActiveCard } = useCardStorage();
  const [dropdownVisible, setDropdownVisible] = useState();

  const handleSheetChange = (event, pIndex) => {
    const newWeapons = [...activeCard[type]];
    newWeapons[index].profiles[pIndex][event.target.name] = event.target.value;
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
                    newWeapons[index].profiles[pIndex].name = value;
                    updateActiveCard({
                      ...activeCard,
                      [type]: newWeapons,
                    });
                  },
                }}>
                {line.name}
              </Typography.Text>
            }
            bodyStyle={{ padding: 0 }}
            style={{ marginBottom: "0px" }}
            extra={
              <Space>
                <Popconfirm
                  title={"Are you sure you want to delete this weapon?"}
                  placement="topRight"
                  onConfirm={(value) =>
                    updateActiveCard(() => {
                      const newWeapons = [...activeCard[type]];
                      newWeapons[index].profiles.splice(pIndex, 1);
                      if (newWeapons[index].profiles.length === 0) {
                        newWeapons.splice(index, 1);
                      }
                      return { ...activeCard, [type]: newWeapons };
                    })
                  }>
                  <Button type="icon" shape="circle" size="small" icon={<DeleteFilled />}></Button>
                </Popconfirm>
                <Switch
                  checked={line.active}
                  onChange={(value) =>
                    updateActiveCard(() => {
                      const newWeapons = [...activeCard[type]];
                      newWeapons[index].profiles[pIndex].active = value;
                      return { ...activeCard, [type]: newWeapons };
                    })
                  }
                />
              </Space>
            }>
            {line.active && (
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
                  {line.keywords.map((keyword, kIndex) => {
                    return (
                      <div className="keyword_container" key={`keyword-${index}-${pIndex}-${kIndex}`}>
                        <Typography.Text
                          editable={{
                            onChange: (value) => {
                              const newWeapons = [...activeCard[type]];
                              newWeapons[index].profiles[pIndex].keywords[kIndex] = value;
                              updateActiveCard({
                                ...activeCard,
                                [type]: newWeapons,
                              });
                            },
                          }}>
                          {keyword}
                        </Typography.Text>
                        <Button
                          type="text"
                          size="small"
                          icon={<DeleteFilled />}
                          onClick={(value) =>
                            updateActiveCard(() => {
                              const newWeapons = [...activeCard[type]];
                              newWeapons[index].profiles[pIndex].keywords.splice(kIndex, 1);
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
                        newWeapons[index].profiles[pIndex].keywords.push(
                          `keyword ${newWeapons[index].profiles[pIndex].keywords.length + 1}`
                        );
                        return { ...activeCard, [type]: newWeapons };
                      })
                    }>
                    Add keyword
                  </Button>
                </div>
              </div>
            )}
          </Card>
        );
      })}
      <Button
        type="dashed"
        style={{ width: "100%" }}
        onClick={() =>
          updateActiveCard(() => {
            const newWeapons = [...activeCard[type]];
            newWeapons[index].profiles.push({
              active: true,
              range: "",
              attacks: "",
              skill: "",
              strength: "",
              ap: "",
              damage: "",
              name: `Profile ${newWeapons[index].profiles.length + 1}`,
              keywords: [],
            });
            return { ...activeCard, [type]: newWeapons };
          })
        }>
        Add profile
      </Button>
    </>
  );
}
