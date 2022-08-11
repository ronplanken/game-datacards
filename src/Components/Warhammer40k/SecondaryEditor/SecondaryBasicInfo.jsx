import MDEditor, { commands } from "@uiw/react-md-editor";
import { Card, Col, Form, Input, Row, Select } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";

const { Option } = Select;

export function SecondaryBasicInfo() {
  const { activeCard, updateActiveCard } = useCardStorage();

  return (
    <>
      <Form.Item label={"Name"}>
        <Input
          type={"text"}
          value={activeCard.name}
          onChange={(e) => updateActiveCard({ ...activeCard, name: e.target.value })}
        />
      </Form.Item>
      <Form.Item label={"Type"}>
        <Input
          type={"text"}
          value={activeCard.type}
          onChange={(e) => updateActiveCard({ ...activeCard, type: e.target.value })}
        />
      </Form.Item>
      <Form.Item label={"Category"}>
        <Select
          value={activeCard.category || "PURGE THE ENEMY"}
          onChange={(value) => updateActiveCard({ ...activeCard, category: value })}>
          <Option value="PURGE THE ENEMY">PURGE THE ENEMY</Option>
          <Option value="NO MERCY, NO RESPITE">NO MERCY, NO RESPITE</Option>
          <Option value="WARPCRAFT">WARPCRAFT</Option>
          <Option value="BATTLEFIELD SUPREMACY">BATTLEFIELD SUPREMACY</Option>
          <Option value="SHADOW OPERATIONS">SHADOW OPERATIONS</Option>
        </Select>
      </Form.Item>
      <Card
        type={"inner"}
        size={"small"}
        title={"Description"}
        bodyStyle={{ padding: 0 }}
        style={{ marginBottom: "16px" }}>
        <Row justify="space-between" align="middle">
          <Col span={24}>
            <MDEditor
              preview="edit"
              commands={[
                commands.bold,
                commands.italic,
                commands.strikethrough,
                commands.hr,
                commands.divider,
                commands.unorderedListCommand,
                commands.orderedListCommand,
                commands.divider,
              ]}
              extraCommands={[]}
              value={activeCard.description}
              onChange={(value) =>
                updateActiveCard(() => {
                  return { ...activeCard, description: value };
                })
              }
            />
          </Col>
        </Row>
      </Card>
      <Form.Item label={"Faction"}>
        <Select
          value={activeCard.faction || "basic"}
          onChange={(value) => updateActiveCard({ ...activeCard, faction: value })}>
          <Option value="AC">AC</Option>
          <Option value="AE">AE</Option>
          <Option value="AL">AL</Option>
          <Option value="AM">AM</Option>
          <Option value="AS">AS</Option>
          <Option value="AdM">AdM</Option>
          <Option value="BA">BA</Option>
          <Option value="BL">BL</Option>
          <Option value="BT">BT</Option>
          <Option value="CD">CD</Option>
          <Option value="CSM">CSM</Option>
          <Option value="CoB">CoB</Option>
          <Option value="DA">DA</Option>
          <Option value="DG">DG</Option>
          <Option value="DRU">DRU</Option>
          <Option value="DW">DW</Option>
          <Option value="EC">EC</Option>
          <Option value="GC">GC</Option>
          <Option value="GK">GK</Option>
          <Option value="HAR">HAR</Option>
          <Option value="IF">IF</Option>
          <Option value="IH">IH</Option>
          <Option value="IW">IW</Option>
          <Option value="NEC">NEC</Option>
          <Option value="NL">NL</Option>
          <Option value="ORK">ORK</Option>
          <Option value="QI">QI</Option>
          <Option value="QT">QT</Option>
          <Option value="RC">RC</Option>
          <Option value="RG">RG</Option>
          <Option value="SA">SA</Option>
          <Option value="SM">SM</Option>
          <Option value="SW">SW</Option>
          <Option value="TAU">TAU</Option>
          <Option value="TS">TS</Option>
          <Option value="TYR">TYR</Option>
          <Option value="UL">UL</Option>
          <Option value="WB">WB</Option>
          <Option value="WE">WE</Option>
          <Option value="WS">WS</Option>
          <Option value="basic">basic</Option>
        </Select>
      </Form.Item>
      {activeCard.subfaction && (
        <Form.Item label={"Subfaction"}>
          <Select
            value={activeCard.subfaction || "basic"}
            onChange={(value) => updateActiveCard({ ...activeCard, subfaction: value })}>
            <Option value="AC">AC</Option>
            <Option value="AE">AE</Option>
            <Option value="AL">AL</Option>
            <Option value="AM">AM</Option>
            <Option value="AS">AS</Option>
            <Option value="AdM">AdM</Option>
            <Option value="BA">BA</Option>
            <Option value="BL">BL</Option>
            <Option value="BT">BT</Option>
            <Option value="CD">CD</Option>
            <Option value="CSM">CSM</Option>
            <Option value="CoB">CoB</Option>
            <Option value="DA">DA</Option>
            <Option value="DG">DG</Option>
            <Option value="DRU">DRU</Option>
            <Option value="DW">DW</Option>
            <Option value="EC">EC</Option>
            <Option value="GC">GC</Option>
            <Option value="GK">GK</Option>
            <Option value="HAR">HAR</Option>
            <Option value="IF">IF</Option>
            <Option value="IH">IH</Option>
            <Option value="IW">IW</Option>
            <Option value="NEC">NEC</Option>
            <Option value="NL">NL</Option>
            <Option value="ORK">ORK</Option>
            <Option value="QI">QI</Option>
            <Option value="QT">QT</Option>
            <Option value="RC">RC</Option>
            <Option value="RG">RG</Option>
            <Option value="SA">SA</Option>
            <Option value="SM">SM</Option>
            <Option value="SW">SW</Option>
            <Option value="TAU">TAU</Option>
            <Option value="TS">TS</Option>
            <Option value="TYR">TYR</Option>
            <Option value="UL">UL</Option>
            <Option value="WB">WB</Option>
            <Option value="WE">WE</Option>
            <Option value="WS">WS</Option>
            <Option value="basic">basic</Option>
          </Select>
        </Form.Item>
      )}
    </>
  );
}
