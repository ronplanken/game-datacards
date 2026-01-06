import { Trash2 } from "lucide-react";
import { Button, Card, Input, Popconfirm, Space, Switch, Typography } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";

export function WarscrollWeapon({ weapon, index, type }) {
  const { activeCard, updateActiveCard } = useCardStorage();
  const isRanged = type === "ranged";

  const handleChange = (field, value) => {
    const newWeapons = [...(activeCard.weapons?.[type] || [])];
    newWeapons[index] = { ...newWeapons[index], [field]: value };
    updateActiveCard({
      ...activeCard,
      weapons: {
        ...activeCard.weapons,
        [type]: newWeapons,
      },
    });
  };

  const deleteWeapon = () => {
    const newWeapons = (activeCard.weapons?.[type] || []).filter((_, i) => i !== index);
    updateActiveCard({
      ...activeCard,
      weapons: {
        ...activeCard.weapons,
        [type]: newWeapons,
      },
    });
  };

  const keywords = weapon.keywords || weapon.abilities || [];

  return (
    <Card
      type={"inner"}
      size={"small"}
      title={
        <Typography.Text
          editable={{
            onChange: (value) => handleChange("name", value),
          }}>
          {weapon.name}
        </Typography.Text>
      }
      bodyStyle={{ padding: 0 }}
      style={{ marginBottom: "16px" }}
      extra={
        <Space>
          <Popconfirm
            title={"Are you sure you want to delete this weapon?"}
            placement="topRight"
            onConfirm={deleteWeapon}>
            <Button type="text" size="small" icon={<Trash2 size={14} />} />
          </Popconfirm>
          <Switch checked={weapon.active !== false} onChange={(value) => handleChange("active", value)} />
        </Space>
      }>
      {weapon.active !== false && (
        <>
          <div className="editor-weapons_header">
            {isRanged && (
              <div className="editor-stat wide">
                <span>Rng</span>
              </div>
            )}
            <div className="editor-stat">
              <span>Atk</span>
            </div>
            <div className="editor-stat">
              <span>Hit</span>
            </div>
            <div className="editor-stat">
              <span>Wnd</span>
            </div>
            <div className="editor-stat">
              <span>Rnd</span>
            </div>
            <div className="editor-stat">
              <span>Dmg</span>
            </div>
          </div>
          <div className="editor-weapons_row">
            {isRanged && (
              <div className="editor-stat wide">
                <Input size="small" value={weapon.range} onChange={(e) => handleChange("range", e.target.value)} />
              </div>
            )}
            <div className="editor-stat">
              <Input size="small" value={weapon.attacks} onChange={(e) => handleChange("attacks", e.target.value)} />
            </div>
            <div className="editor-stat">
              <Input size="small" value={weapon.hit} onChange={(e) => handleChange("hit", e.target.value)} />
            </div>
            <div className="editor-stat">
              <Input size="small" value={weapon.wound} onChange={(e) => handleChange("wound", e.target.value)} />
            </div>
            <div className="editor-stat">
              <Input size="small" value={weapon.rend} onChange={(e) => handleChange("rend", e.target.value)} />
            </div>
            <div className="editor-stat">
              <Input size="small" value={weapon.damage} onChange={(e) => handleChange("damage", e.target.value)} />
            </div>
          </div>
          <div className="editor-keywords_row">
            <Input
              size="small"
              value={keywords.join(", ")}
              onChange={(e) =>
                handleChange(
                  "abilities",
                  e.target.value.split(",").map((k) => k.trim())
                )
              }
              placeholder="Keywords (e.g. Crit (Mortal), Anti-Infantry)"
              addonBefore="Keywords"
            />
          </div>
        </>
      )}
    </Card>
  );
}
