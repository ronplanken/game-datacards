import React from "react";
import { Col, Row, Select } from "antd";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";

const { Option } = Select;

export const ContentTypeSelector = ({ isLoading, selectedContentType, setSelectedContentType }) => {
  const { selectedFaction } = useDataSourceStorage();

  if (!selectedFaction) {
    return null;
  }

  return (
    <Row style={{ marginBottom: "4px" }}>
      <Col span={24}>
        <Select
          loading={isLoading}
          style={{ width: "100%" }}
          onChange={(value) => {
            setSelectedContentType(value);
          }}
          placeholder="Select a type"
          value={selectedContentType}>
          {selectedFaction?.datasheets && selectedFaction?.datasheets.length > 0 && (
            <Option value={"datasheets"} key={`datasheets`}>
              Datasheets
            </Option>
          )}
          {selectedFaction?.stratagems && selectedFaction?.stratagems.length > 0 && (
            <Option value={"stratagems"} key={`stratagems`}>
              Stratagems
            </Option>
          )}
          {selectedFaction?.secondaries && selectedFaction?.secondaries.length > 0 && (
            <Option value={"secondaries"} key={`secondaries`}>
              Secondaries
            </Option>
          )}
          {selectedFaction?.enhancements && selectedFaction?.enhancements.length > 0 && (
            <Option value={"enhancements"} key={`enhancements`}>
              Enhancements
            </Option>
          )}
          {selectedFaction?.psychicpowers && selectedFaction?.psychicpowers.length > 0 && (
            <Option value={"psychicpowers"} key={`psychicpowers`}>
              Psychic powers
            </Option>
          )}
        </Select>
      </Col>
    </Row>
  );
};
