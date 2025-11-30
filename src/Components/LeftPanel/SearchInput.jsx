import React from "react";
import { Col, Row, Input } from "antd";

export const SearchInput = ({ setSearchText }) => {
  return (
    <Row style={{ marginBottom: "4px" }}>
      <Col span={24}>
        <Input.Search
          placeholder={"Search"}
          onSearch={(value) => {
            if (value.length > 0) {
              setSearchText(value);
            } else {
              setSearchText(undefined);
            }
          }}
          allowClear={true}
        />
      </Col>
    </Row>
  );
};
