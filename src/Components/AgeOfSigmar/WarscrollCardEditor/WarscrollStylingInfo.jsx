import { Form, Switch, Input, Card, Space, Typography } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { useDataSourceStorage } from "../../../Hooks/useDataSourceStorage";

const { Text } = Typography;

export function WarscrollStylingInfo() {
  const { activeCard, updateActiveCard } = useCardStorage();
  const { dataSource } = useDataSourceStorage();

  return (
    <>
      <Card type={"inner"} title="Card Image" size="small" bodyStyle={{ padding: 16 }} style={{ marginBottom: 16 }}>
        <Form size="small">
          <Form.Item label={"External Image URL"}>
            <Input
              type={"text"}
              value={activeCard.imageUrl}
              onChange={(e) => updateActiveCard({ ...activeCard, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </Form.Item>
        </Form>
      </Card>

      <Card
        type={"inner"}
        title="Custom Colours"
        size="small"
        bodyStyle={{ padding: activeCard.useCustomColours ? 16 : 0 }}
        extra={
          <Switch
            checked={activeCard.useCustomColours || false}
            onChange={(value) => {
              const cardFaction = dataSource?.data?.find((f) => f.id === activeCard?.faction_id);
              const updates = { useCustomColours: value };
              if (value && !activeCard.customBannerColour) {
                updates.customBannerColour = cardFaction?.colours?.banner || "#4a6741";
              }
              if (value && !activeCard.customHeaderColour) {
                updates.customHeaderColour = cardFaction?.colours?.header || "#3d5a3d";
              }
              updateActiveCard({ ...activeCard, ...updates });
            }}
          />
        }>
        {activeCard.useCustomColours && (
          <Form size="small">
            <Form.Item label={"Banner Colour"}>
              <Space>
                <input
                  type="color"
                  value={activeCard.customBannerColour || "#4a6741"}
                  onChange={(e) => updateActiveCard({ ...activeCard, customBannerColour: e.target.value })}
                  style={{
                    width: 40,
                    height: 28,
                    padding: 0,
                    border: "1px solid #d9d9d9",
                    borderRadius: 4,
                    cursor: "pointer",
                  }}
                />
                <Input
                  size="small"
                  value={activeCard.customBannerColour || "#4a6741"}
                  onChange={(e) => updateActiveCard({ ...activeCard, customBannerColour: e.target.value })}
                  style={{ width: 90, fontFamily: "monospace" }}
                />
              </Space>
              <Text type="secondary" style={{ fontSize: "12px", display: "block", marginTop: 4 }}>
                Used for section headers and primary accents
              </Text>
            </Form.Item>

            <Form.Item label={"Header Colour"} style={{ marginBottom: 0 }}>
              <Space>
                <input
                  type="color"
                  value={activeCard.customHeaderColour || "#3d5a3d"}
                  onChange={(e) => updateActiveCard({ ...activeCard, customHeaderColour: e.target.value })}
                  style={{
                    width: 40,
                    height: 28,
                    padding: 0,
                    border: "1px solid #d9d9d9",
                    borderRadius: 4,
                    cursor: "pointer",
                  }}
                />
                <Input
                  size="small"
                  value={activeCard.customHeaderColour || "#3d5a3d"}
                  onChange={(e) => updateActiveCard({ ...activeCard, customHeaderColour: e.target.value })}
                  style={{ width: 90, fontFamily: "monospace" }}
                />
              </Space>
              <Text type="secondary" style={{ fontSize: "12px", display: "block", marginTop: 4 }}>
                Used for ability headers and secondary accents
              </Text>
            </Form.Item>
          </Form>
        )}
      </Card>
    </>
  );
}
