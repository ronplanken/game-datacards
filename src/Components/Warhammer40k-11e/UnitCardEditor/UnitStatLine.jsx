import { Trash2, Settings } from "lucide-react";
import { Button, Card, Checkbox, Dropdown, Input, Menu, Popconfirm, Space, Typography } from "antd";
import React, { useState } from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { localize, setLocalizedField } from "../../../Helpers/localization.helpers";

// 11th edition stat lines have no `active` flag (every profile is rendered) and a
// language-keyed `name`. The numeric stats (m/t/sv/w/ld/oc) are plain strings.
export function UnitStatLine({ sheet, index }) {
  const { activeCard, updateActiveCard } = useCardStorage();
  const { settings } = useSettingsStorage();
  const lang = settings.language;
  const [dropdownVisible, setDropdownVisible] = useState();

  const handleSheetChange = (event, idx) => {
    const newStats = [...activeCard.stats];
    newStats[idx] = { ...newStats[idx], [event.target.name]: event.target.value };
    updateActiveCard({ ...activeCard, stats: newStats });
  };

  return (
    <Card
      key={`sheet-${index}`}
      type={"inner"}
      size={"small"}
      title={
        <Typography.Text
          editable={{
            onChange: (value) => {
              const newStats = [...activeCard.stats];
              newStats[index] = { ...newStats[index], name: setLocalizedField(newStats[index].name, lang, value) };
              updateActiveCard({ ...activeCard, stats: newStats });
            },
          }}>
          {localize(sheet.name, lang)}
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
                    onChange={(value) => {
                      updateActiveCard(() => {
                        const newStats = [...activeCard.stats];
                        newStats[index] = { ...newStats[index], showName: value.target.checked };
                        return { ...activeCard, stats: newStats };
                      });
                    }}>
                    Show name
                  </Checkbox>
                </Menu.Item>
                <Menu.Item key="2">
                  <Checkbox
                    checked={sheet.showDamagedMarker}
                    onChange={(value) => {
                      updateActiveCard(() => {
                        const newStats = [...activeCard.stats];
                        newStats[index] = { ...newStats[index], showDamagedMarker: value.target.checked };
                        return { ...activeCard, stats: newStats };
                      });
                    }}>
                    Show damaged marker
                  </Checkbox>
                </Menu.Item>
              </Menu>
            }>
            <Button type="icon" shape="circle" size="small" icon={<Settings size={14} />}></Button>
          </Dropdown>

          <Popconfirm
            title={"Are you sure you want to delete this datasheet?"}
            placement="topRight"
            onConfirm={() =>
              updateActiveCard(() => {
                const newStats = [...activeCard.stats];
                newStats.splice(index, 1);
                return { ...activeCard, stats: newStats };
              })
            }>
            <Button type="icon" shape="circle" size="small" icon={<Trash2 size={14} />}></Button>
          </Popconfirm>
        </Space>
      }>
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
    </Card>
  );
}
