import React, { useState } from "react";
import { Search, X } from "lucide-react";
import "./ViewerSearchInput.css";

export const ViewerSearchInput = ({ setSearchText }) => {
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
    <div className="viewer-search-container">
      <input
        type="text"
        className="viewer-search-input"
        placeholder="Search"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      {value ? (
        <button className="viewer-search-clear" onClick={handleClear} type="button">
          <X size={14} />
        </button>
      ) : (
        <Search size={14} className="viewer-search-icon" />
      )}
    </div>
  );
};
