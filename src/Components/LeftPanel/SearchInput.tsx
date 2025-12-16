import React, { useState } from "react";
import { Search, X } from "lucide-react";
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
          <X size={14} />
        </button>
      ) : (
        <Search size={14} className="search-input-icon" />
      )}
    </div>
  );
};
