import { Form, Input, Select } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";

const { Option } = Select;

export function UnitBasicInfo() {
  const { activeCard, updateActiveCard } = useCardStorage();

  return (
    <>
      <Form.Item label={"Variant"}>
        <Select
          value={activeCard.variant || "card"}
          onChange={(value) =>
            updateActiveCard({ ...activeCard, variant: value })
          }
        >
          <Option value="card">Card</Option>
          <Option value="card-no-icons">Card (No Icons)</Option>
          <Option value="sheet">Sheet</Option>
          <Option value="sheet-no-icons">Sheet (No Icons)</Option>
        </Select>
      </Form.Item>
      <Form.Item label={"Name"}>
        <Input
          type={"text"}
          value={activeCard.name}
          onChange={(e) =>
            updateActiveCard({ ...activeCard, name: e.target.value })
          }
        />
      </Form.Item>
      <Form.Item label={"Type"}>
        <Select
          value={activeCard.role}
          onChange={(value) => updateActiveCard({ ...activeCard, role: value })}
        >
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
        <Select
          value={activeCard.background || "NONE"}
          onChange={(value) => updateActiveCard({ ...activeCard, background: value })}>
          <Option value="NONE">None</Option>
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
    </>
  );
}
