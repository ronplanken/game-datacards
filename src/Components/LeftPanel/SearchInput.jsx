import React, { useState } from "react";
import { SearchOutlined, CloseOutlined } from "@ant-design/icons";
import "./SearchInput.css";

export const SearchInput = ({ setSearchText }) => {
  const [value, setValue] = useState("");

  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    if (newValue.length > 0) {
      setSearchText(newValue);
    } else {
      setSearchText(undefined);
    }
  };

  const handleClear = () => {
    setValue("");
    setSearchText(undefined);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      handleClear();
    }
  };

  return (
    <div className="search-input-container">
      <input
        type="text"
        className="search-input"
        placeholder="Search"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      {value ? (
        <button className="search-input-clear" onClick={handleClear} type="button">
          <CloseOutlined />
        </button>
      ) : (
        <SearchOutlined className="search-input-icon" />
      )}
    </div>
  );
};
