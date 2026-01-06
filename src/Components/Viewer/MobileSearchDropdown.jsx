import { Search } from "lucide-react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalSearch } from "../../Hooks/useGlobalSearch";
import "./MobileSearchDropdown.css";

const getCardTypeLabel = (type) =>
  ({
    unit: "Unit",
    stratagem: "Stratagem",
    enhancement: "Enhancement",
    rule: "Rule",
    spell: "Spell",
    manifestation: "Manifestation",
  }[type] || "Card");

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

  const handleSelectResult = (card) => {
    // Normalize faction and card names for URL
    const factionSlug = card.factionName?.toLowerCase().replaceAll(" ", "-");
    const cardSlug = card.name?.toLowerCase().replaceAll(" ", "-");

    // Call the onSelectUnit callback (for adding to recent searches)
    onSelectUnit?.(card);

    // Build route based on card type
    const routeMap = {
      unit: `/${cardSlug}`,
      stratagem: `/stratagem/${cardSlug}`,
      enhancement: `/enhancement/${cardSlug}`,
      rule: `/rule/${cardSlug}`,
      spell: `/spell-lore/${cardSlug}`,
      manifestation: `/manifestation-lore/${cardSlug}`,
    };

    const path = `/mobile/${factionSlug}${routeMap[card.cardType] || `/${cardSlug}`}`;
    navigate(path);
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
          {results.map((card, index) => (
            <button
              key={`${card.factionId}-${card.cardType}-${card.id || card.name}-${index}`}
              className="search-result-item"
              onClick={() => handleSelectResult(card)}
              type="button">
              <span className="result-name">{card.name}</span>
              <div className="result-meta">
                <span className="result-faction">{card.factionName}</span>
                <span className="result-type-badge">{getCardTypeLabel(card.cardType)}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
