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
          <Option value="AC">Adeptus Custodes</Option>
          <Option value="AE">Asuryani</Option>
          <Option value="AL">Alpha Legion</Option>
          <Option value="AM">Astra Militarum</Option>
          <Option value="AS">Adepta Sororitas</Option>
          <Option value="AdM">Adeptus Mechanicus</Option>
          <Option value="BA">Blood Angels</Option>
          <Option value="BL">Black Legion</Option>
          <Option value="BT">Black Templars</Option>
          <Option value="CD">Chaos Demons</Option>
          <Option value="CSM">Chaos Space Marines</Option>
          <Option value="CoB">Creations of Bile</Option>
          <Option value="DA">Dark Angels</Option>
          <Option value="DG">Death Guard</Option>
          <Option value="DRU">Drukhari</Option>
          <Option value="DW">Deathwatch</Option>
          <Option value="EC">Emperor&apos;s Children</Option>
          <Option value="GC">Genestealer Cult</Option>
          <Option value="GK">Grey Knights</Option>
          <Option value="HAR">Harlequins</Option>
          <Option value="IF">Imperial Fists</Option>
          <Option value="IH">Iron Hands</Option>
          <Option value="IW">Iron Warriors</Option>
          <Option value="NEC">Necrons</Option>
          <Option value="NL">Night Lords</Option>
          <Option value="ORK">Orks</Option>
          <Option value="QI">Imperial Knights</Option>
          <Option value="QT">Chaos Knights</Option>
          <Option value="RC">Red Corsairs</Option>
          <Option value="RG">Raven Guard</Option>
          <Option value="SA">Salamanders</Option>
          <Option value="SM">Space Marines</Option>
          <Option value="SW">Space Wolves</Option>
          <Option value="TAU">Tau</Option>
          <Option value="TS">Thousand Sons</Option>
          <Option value="TYR">Tyranids</Option>
          <Option value="UL">Ultramarines</Option>
          <Option value="WB">Word Bearers</Option>
          <Option value="WE">World Eaters</Option>
          <Option value="WS">White Scars</Option>
          <Option value="basic">Basic</Option>
        </Select>
      </Form.Item>
      {activeCard.subfaction && (
        <Form.Item label={"Subfaction"}>
          <Select
            value={activeCard.subfaction || "basic"}
            onChange={(value) => updateActiveCard({ ...activeCard, subfaction: value })}>
            <Option value="AC">Adeptus Custodes</Option>
            <Option value="AE">Asuryani</Option>
            <Option value="AL">Alpha Legion</Option>
            <Option value="AM">Astra Militarum</Option>
            <Option value="AS">Adepta Sororitas</Option>
            <Option value="AdM">Adeptus Mechanicus</Option>
            <Option value="BA">Blood Angels</Option>
            <Option value="BL">Black Legion</Option>
            <Option value="BT">Black Templars</Option>
            <Option value="CD">Chaos Demons</Option>
            <Option value="CSM">Chaos Space Marines</Option>
            <Option value="CoB">Creations of Bile</Option>
            <Option value="DA">Dark Angels</Option>
            <Option value="DG">Death Guard</Option>
            <Option value="DRU">Drukhari</Option>
            <Option value="DW">Deathwatch</Option>
            <Option value="EC">Emperor&apos;s Children</Option>
            <Option value="GC">Genestealer Cult</Option>
            <Option value="GK">Grey Knights</Option>
            <Option value="HAR">Harlequins</Option>
            <Option value="IF">Imperial Fists</Option>
            <Option value="IH">Iron Hands</Option>
            <Option value="IW">Iron Warriors</Option>
            <Option value="NEC">Necrons</Option>
            <Option value="NL">Night Lords</Option>
            <Option value="ORK">Orks</Option>
            <Option value="QI">Imperial Knights</Option>
            <Option value="QT">Chaos Knights</Option>
            <Option value="RC">Red Corsairs</Option>
            <Option value="RG">Raven Guard</Option>
            <Option value="SA">Salamanders</Option>
            <Option value="SM">Space Marines</Option>
            <Option value="SW">Space Wolves</Option>
            <Option value="TAU">Tau</Option>
            <Option value="TS">Thousand Sons</Option>
            <Option value="TYR">Tyranids</Option>
            <Option value="UL">Ultramarines</Option>
            <Option value="WB">Word Bearers</Option>
            <Option value="WE">World Eaters</Option>
            <Option value="WS">White Scars</Option>
            <Option value="basic">Basic</Option>
          </Select>
        </Form.Item>
      )}
    </>
  );
}
