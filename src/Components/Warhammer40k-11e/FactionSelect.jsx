import { Select } from "antd";
import React from "react";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";

const { Option } = Select;

// 11th edition references factions by their datasource UUID (faction_id), not the
// 10e short codes, so the options come from the loaded datasource itself.
export const FactionSelect = ({ value, onChange }) => {
  const { dataSource } = useDataSourceStorage();
  const factions = dataSource?.data || [];

  return (
    <Select
      value={value}
      onChange={onChange}
      showSearch
      filterOption={(input, option) =>
        String(option?.children ?? "")
          .toLowerCase()
          .includes(input.toLowerCase())
      }>
      {factions.map((faction) => (
        <Option value={faction.id} key={faction.id}>
          {faction.name}
        </Option>
      ))}
    </Select>
  );
};
