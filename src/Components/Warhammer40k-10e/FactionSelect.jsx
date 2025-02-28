import { Select } from "antd";
import React from "react";

const { Option } = Select;

export const FactionSelect = ({ value, onChange }) => {
  return (
    <Select value={value} onChange={onChange}>
      <Option value="NONE">None</Option>
      <Option value="basic">Basic</Option>
      <Option value="AC">Adeptus Custodes</Option>
      <Option value="AE">Aeldari</Option>
      <Option value="LGAL">Alpha Legion</Option>
      <Option value="AM">Astra Militarum</Option>
      <Option value="AS">Adepta Sororitas</Option>
      <Option value="AdM">Adeptus Mechanicus</Option>
      <Option value="AoI">Agents of the Imperium</Option>
      <Option value="CHBA">Blood Angels</Option>
      <Option value="LGBL">Black Legion</Option>
      <Option value="CHBT">Black Templar</Option>
      <Option value="CD">Chaos Daemons</Option>
      <Option value="QT">Chaos Knights</Option>
      <Option value="CSM">Chaos Space Marines</Option>
      <Option value="CHDA">Dark Angels</Option>
      <Option value="DG">Death Guard</Option>
      <Option value="DRU">Drukhari</Option>
      <Option value="CHDW">Deathwatch</Option>
      <Option value="LGEC">Emperor&apos;s Children</Option>
      <Option value="GC">Genestealer Cult</Option>
      <Option value="GK">Grey Knights</Option>
      <Option value="HAR">Harlequins</Option>
      <Option value="CHIF">Imperial Fists</Option>
      <Option value="CHIH">Iron Hands</Option>
      <Option value="QI">Imperial Knights</Option>
      <Option value="LGIW">Iron Warriors</Option>
      <Option value="LoV">Leagues of Votann</Option>
      <Option value="NEC">Necrons</Option>
      <Option value="LGNL">Night Lords</Option>
      <Option value="ORK">Orks</Option>
      <Option value="LGRC">Red Corsairs</Option>
      <Option value="CHRG">Raven Guard</Option>
      <Option value="CHSA">Salamanders</Option>
      <Option value="SM">Space Marines</Option>
      <Option value="CHSW">Space Wolves</Option>
      <Option value="TAU">Tau</Option>
      <Option value="TS">Thousand Sons</Option>
      <Option value="TYR">Tyranids</Option>
      <Option value="CHUL">Ultramarines</Option>
      <Option value="LGWB">Word Bearers</Option>
      <Option value="WE">World Eaters</Option>
      <Option value="CHWS">White Scars</Option>
    </Select>
  );
};
