import { DeleteFilled, SettingOutlined } from "@ant-design/icons";
import { Button, Card, Checkbox, Dropdown, Input, Menu, Popconfirm, Space, Switch, Typography } from "antd";
import React, { useState } from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";

export function UnitStatLine({ sheet, index }) {
  const { activeCard, updateActiveCard } = useCardStorage();
  const [dropdownVisible, setDropdownVisible] = useState();

  const handleSheetChange = (event, index) => {
    const newStats = [...activeCard.stats];
    newStats[index][event.target.name] = event.target.value;
    updateActiveCard({ ...activeCard, stats: newStats });
  };

  return (
    <Card
      key={`sheet-${sheet.stats_id}-${index}`}
      type={"inner"}
      size={"small"}
      title={
        <Typography.Text
          editable={{
            onChange: (value) => {
              const newStats = [...activeCard.stats];
              newStats[index]["name"] = value;
              updateActiveCard({
                ...activeCard,
                stats: newStats,
              });
            },
          }}>
          {sheet.name}
        </Typography.Text>
      }
      bodyStyle={{ padding: 0 }}
      style={{ marginBottom: "16px" }}
      extra={
        <Space>
          <Dropdown
            visible={dropdownVisible}
            onVisibleChange={(flag) => setDropdownVisible(flag)}
            placement={"bottomRight"}
            overlay={
              <Menu>
                <Menu.Item key="1">
                  <Checkbox
                    checked={sheet.showName}
                    disabled={!sheet.active}
                    onChange={(value) => {
                      updateActiveCard(() => {
                        const newStats = [...activeCard.stats];
                        newStats[index]["showName"] = value.target.checked;
                        return { ...activeCard, stats: newStats };
                      });
                    }}>
                    Show name
                  </Checkbox>
                </Menu.Item>
                <Menu.Item key="2">
                  <Checkbox
                    checked={sheet.showDamagedMarker}
                    disabled={!sheet.active}
                    onChange={(value) => {
                      updateActiveCard(() => {
                        const newStats = [...activeCard.stats];
                        newStats[index]["showDamagedMarker"] = value.target.checked;
                        return { ...activeCard, stats: newStats };
                      });
                    }}>
                    Show damaged marker
                  </Checkbox>
                </Menu.Item>
              </Menu>
            }>
            <Button type="icon" shape="circle" size="small" icon={<SettingOutlined />}></Button>
          </Dropdown>

          <Popconfirm
            title={"Are you sure you want to delete this datasheet?"}
            placement="topRight"
            onConfirm={(value) =>
              updateActiveCard(() => {
                const newStats = [...activeCard.stats];
                newStats.splice(index, 1);
                return { ...activeCard, stats: newStats };
              })
            }>
            <Button type="icon" shape="circle" size="small" icon={<DeleteFilled />}></Button>
          </Popconfirm>
          <Switch
            checked={sheet.active}
            onChange={(value) =>
              updateActiveCard(() => {
                const newStats = [...activeCard.stats];
                newStats[index]["active"] = value;
                return { ...activeCard, stats: newStats };
              })
            }
          />
        </Space>
      }>
      {sheet.active && (
        <div className="header">
          <div className="stats_container">
            <div className="stat">
              <div className="caption">M</div>
            </div>
            <div className="stat">
              <div className="caption">T</div>
            </div>
            <div className="stat">
              <div className="caption">SV</div>
            </div>
            <div className="stat">
              <div className="caption">W</div>
            </div>
            <div className="stat">
              <div className="caption">LD</div>
            </div>
            <div className="stat">
              <div className="caption">OC</div>
            </div>
          </div>
          <div className="stats_container">
            <div className="stat">
              <div className="value_container">
                <div className="value">
                  <Input type="text" value={sheet.m} name="m" onChange={(e) => handleSheetChange(e, index)} />
                </div>
              </div>
            </div>
            <div className="stat">
              <div className="value_container">
                <div className="value">
                  <Input type="text" value={sheet.t} name="t" onChange={(e) => handleSheetChange(e, index)} />
                </div>
              </div>
            </div>
            <div className="stat">
              <div className="value_container">
                <div className="value">
                  <Input type="text" value={sheet.sv} name="sv" onChange={(e) => handleSheetChange(e, index)} />
                </div>
              </div>
            </div>
            <div className="stat">
              <div className="value_container">
                <div className="value">
                  <Input type="text" value={sheet.w} name="w" onChange={(e) => handleSheetChange(e, index)} />
                </div>
              </div>
            </div>
            <div className="stat">
              <div className="value_container">
                <div className="value">
                  <Input type="text" value={sheet.ld} name="ld" onChange={(e) => handleSheetChange(e, index)} />
                </div>
              </div>
            </div>
            <div className="stat">
              <div className="value_container">
                <div className="value">
                  <Input type="text" value={sheet.oc} name="oc" onChange={(e) => handleSheetChange(e, index)} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
