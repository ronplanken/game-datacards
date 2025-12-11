import { Select } from "antd";
import React from "react";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";

const { Option } = Select;

export const FactionSelect = ({ value, onChange }) => {
  const { dataSource } = useDataSourceStorage();

  return (
    <Select value={value} onChange={onChange}>
      <Option value="NONE">None</Option>
      {dataSource?.data?.map((faction) => (
        <Option key={faction.id} value={faction.id}>
          {faction.name}
        </Option>
      ))}
    </Select>
  );
};
