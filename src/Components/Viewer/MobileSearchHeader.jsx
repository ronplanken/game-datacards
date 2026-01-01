import { Search, X, Library } from "lucide-react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import logo from "../../Images/logo.png";
import "./MobileSearchHeader.css";

export const MobileSearchHeader = ({
  searchText,
  setSearchText,
  onFocus,
  onBlur,
  onFactionSelectorClick,
  showDropdown,
}) => {
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { selectedFaction } = useDataSourceStorage();

  const handleChange = (e) => {
    setSearchText(e.target.value || "");
  };

  const handleClear = () => {
    setSearchText("");
    inputRef.current?.blur();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      handleClear();
    }
  };

  const handleLogoClick = () => {
    navigate("/mobile");
  };

  return (
    <div className="mobile-search-header">
      <img src={logo} alt="Game Datacards" className="mobile-search-logo" onClick={handleLogoClick} />

      <div className="mobile-search-input-wrapper">
        <div className={`mobile-search-input-container ${showDropdown ? "active" : ""}`}>
          <Search size={18} className="mobile-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="mobile-search-input"
            placeholder="Search all cards..."
            value={searchText}
            onChange={handleChange}
            onFocus={onFocus}
            onBlur={onBlur}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          {searchText && (
            <button className="mobile-search-clear" onClick={handleClear} type="button">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <button className="mobile-search-faction-btn" onClick={onFactionSelectorClick} type="button">
        <Library size={20} />
      </button>
    </div>
  );
};
