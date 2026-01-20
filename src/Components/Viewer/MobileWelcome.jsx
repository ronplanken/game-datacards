import { ChevronRight, Clock, Search, Trash2, List } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./MobileWelcome.css";

export const MobileWelcome = ({
  recentSearches = [],
  onClearRecent,
  lastFaction,
  hasFactionSelected,
  onBrowseFactions,
}) => {
  const navigate = useNavigate();

  const handleRecentClick = (item) => {
    // For "Core" faction (basic stratagems), use lastFaction if available
    const factionSlug =
      item.factionName === "Core" && lastFaction
        ? lastFaction.name.toLowerCase().replaceAll(" ", "-")
        : item.factionName?.toLowerCase().replaceAll(" ", "-");
    const cardSlug = item.unitName?.toLowerCase().replaceAll(" ", "-");

    // Build route based on card type (matching MobileSearchDropdown logic)
    const routeMap = {
      unit: `/${cardSlug}`,
      stratagem: `/stratagem/${cardSlug}`,
      enhancement: `/enhancement/${cardSlug}`,
      rule: `/rule/${cardSlug}`,
      spell: `/spell-lore/${cardSlug}`,
      manifestation: `/manifestation-lore/${cardSlug}`,
    };

    const path = `/mobile/${factionSlug}${routeMap[item.cardType] || `/${cardSlug}`}`;
    navigate(path);
  };

  const handleContinueToFaction = () => {
    const factionSlug = lastFaction?.name?.toLowerCase().replaceAll(" ", "-");
    navigate(`/mobile/${factionSlug}`);
  };

  return (
    <div className="mobile-welcome">
      <div className="mobile-welcome-header">
        <h1 className="mobile-welcome-title">Game Datacards</h1>
        <p className="mobile-welcome-subtitle">Search for any unit to get started</p>
      </div>

      {/* Show "Continue to" only if user has previously selected a faction */}
      {lastFaction && hasFactionSelected && (
        <button
          className="mobile-welcome-continue"
          onClick={handleContinueToFaction}
          type="button"
          style={{
            "--banner-colour": lastFaction.colours?.banner,
            "--header-colour": lastFaction.colours?.header,
          }}>
          <span className="continue-label">Continue to</span>
          <span className="continue-faction">{lastFaction.name}</span>
          <ChevronRight size={18} />
        </button>
      )}

      {/* Always show Browse Factions button */}
      <button className="mobile-welcome-browse" onClick={onBrowseFactions} type="button">
        <List size={18} />
        <span>Browse Factions</span>
        <ChevronRight size={18} />
      </button>

      {recentSearches.length > 0 && (
        <div className="recent-searches-section">
          <div className="recent-searches-header">
            <div className="recent-searches-title">
              <Clock size={16} />
              <span>Recent Searches</span>
            </div>
            {onClearRecent && (
              <button className="recent-searches-clear" onClick={onClearRecent} type="button">
                <Trash2 size={14} />
                <span>Clear</span>
              </button>
            )}
          </div>

          <div className="recent-searches-list">
            {recentSearches.map((item, index) => (
              <button
                key={`${item.unitId}-${item.factionId}-${index}`}
                className="recent-search-item"
                onClick={() => handleRecentClick(item)}
                type="button">
                <span className="recent-search-name">{item.unitName}</span>
                <span className="recent-search-faction">{item.factionName}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {recentSearches.length === 0 && (
        <div className="mobile-welcome-empty">
          <Search size={48} className="mobile-welcome-empty-icon" />
          <p>Use the search bar above to find units</p>
        </div>
      )}

      <div className="mobile-welcome-discord">
        <p>Join our Discord!</p>
        <a href="https://discord.gg/anfn4qTYC4" target="_blank" rel="noreferrer">
          <img src="https://discordapp.com/api/guilds/997166169540788244/widget.png?style=banner2" alt="Discord" />
        </a>
      </div>
    </div>
  );
};
