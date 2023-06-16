import { Col, Form, Input, Row, Select } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { FactionSelect } from "../FactionSelect";

const { Option } = Select;

export function UnitBasicInfo() {
  const { activeCard, updateActiveCard } = useCardStorage();

  return (
    <Form>
      <Form.Item label={"Variant"}>
        <Select
          value={activeCard.variant || "card"}
          onChange={(value) => updateActiveCard({ ...activeCard, variant: value })}>
          <Option value="card">Game-datacard</Option>
          <Option value="playingcard">Playingcard</Option>
          <Option value="poker">Poker / MTG</Option>
          <Option value="sheet">Sheet (A5)</Option>
          <Option value="a4">Sheet (A4)</Option>
          <Option value="letter">Sheet (US Letter)</Option>
          <Option value="letter-half">Sheet (Half US letter)</Option>
          <Option value="custom">Custom (Advanced)</Option>
        </Select>
      </Form.Item>
      {activeCard.variant === "custom" && (
        <Row gutter={8}>
          <Col span={12}>
            <Form.Item label={"Height (cm)"}>
              <Input
                type={"text"}
                placeholder={"Height in centimeters"}
                value={activeCard.height}
                onChange={(e) => updateActiveCard({ ...activeCard, height: e.target.value })}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={"Width (cm)"}>
              <Input
                type={"text"}
                placeholder={"Width in centimeters"}
                value={activeCard.width}
                onChange={(e) => updateActiveCard({ ...activeCard, width: e.target.value })}
              />
            </Form.Item>
          </Col>
        </Row>
      )}
      <Form.Item label={"Icons"}>
        <Select
          value={activeCard.icons || "icons"}
          onChange={(value) => updateActiveCard({ ...activeCard, icons: value })}>
          <Option value="icons">Icons</Option>
          <Option value="no-icons">Text</Option>
        </Select>
      </Form.Item>
      <Form.Item label={"Name"}>
        <Input
          type={"text"}
          value={activeCard.name}
          onChange={(e) => updateActiveCard({ ...activeCard, name: e.target.value })}
        />
      </Form.Item>
      <Form.Item label={"Type"}>
        <Select value={activeCard.role} onChange={(value) => updateActiveCard({ ...activeCard, role: value })}>
          <Option value="HQ">HQ</Option>
          <Option value="Troops">Troops</Option>
          <Option value="Elites">Elites</Option>
          <Option value="Heavy Support">Heavy Support</Option>
          <Option value="Fast Attack">Fast Attack</Option>
          <Option value="Dedicated Transport">Dedicated Transport</Option>
          <Option value="Flyers">Flyers</Option>
          <Option value="Fortifications">Fortifications</Option>
          <Option value="Lords of War">Lords of War</Option>
          <Option value="Unknown">Unknown</Option>
        </Select>
      </Form.Item>
      <Form.Item label={"Background"}>
        <FactionSelect
          value={activeCard.background || "NONE"}
          onChange={(value) => updateActiveCard({ ...activeCard, background: value })}
        />
      </Form.Item>
    </Form>
  );
}
