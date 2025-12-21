import { Search } from "lucide-react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalSearch } from "../../Hooks/useGlobalSearch";
import "./MobileSearchDropdown.css";

export const MobileSearchDropdown = ({ isOpen, onClose, searchText, onSelectUnit }) => {
  const { results, isSearching } = useGlobalSearch(searchText);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Don't close if clicking on the search input
        if (event.target.closest(".mobile-search-input-container")) {
          return;
        }
        onClose();
      }
    };

    if (isOpen) {
      // Use setTimeout to avoid immediate trigger
      setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
      }, 0);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSelectResult = (unit) => {
    // Normalize faction and unit names for URL
    const factionSlug = unit.factionName?.toLowerCase().replaceAll(" ", "-");
    const unitSlug = unit.name?.toLowerCase().replaceAll(" ", "-");

    // Call the onSelectUnit callback (for adding to recent searches)
    onSelectUnit?.(unit);

    // Navigate to the unit
    navigate(`/mobile/${factionSlug}/${unitSlug}`);
    onClose();
  };

  if (!isOpen) return null;

  const showResults = searchText && searchText.length >= 2;
  const hasResults = results.length > 0;

  return (
    <div ref={dropdownRef} className="mobile-search-dropdown">
      {!showResults && (
        <div className="search-dropdown-hint">
          <Search size={20} />
          <span>Type at least 2 characters to search</span>
        </div>
      )}

      {showResults && isSearching && (
        <div className="search-dropdown-loading">
          <span>Searching...</span>
        </div>
      )}

      {showResults && !isSearching && !hasResults && (
        <div className="search-dropdown-empty">
          <span>No units found for &quot;{searchText}&quot;</span>
        </div>
      )}

      {showResults && !isSearching && hasResults && (
        <div className="search-dropdown-results">
          {results.map((unit, index) => (
            <button
              key={`${unit.factionId}-${unit.id}-${index}`}
              className="search-result-item"
              onClick={() => handleSelectResult(unit)}
              type="button">
              <span className="result-name">{unit.name}</span>
              <span className="result-faction">{unit.factionName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
