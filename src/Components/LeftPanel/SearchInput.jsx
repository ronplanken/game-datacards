import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { useUmami } from "../../Hooks/useUmami";
import "./SearchInput.css";

export const SearchInput = ({ setSearchText }) => {
  const [value, setValue] = useState("");
  const { trackEvent } = useUmami();

  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    if (newValue.length > 0) {
      setSearchText(newValue);
      trackEvent("search-query", { queryLength: newValue.length }, { debounceMs: 1000 });
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
