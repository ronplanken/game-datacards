import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDataSourceStorage } from "../../../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { getBrowsableEnhancements } from "../../../Helpers/faction.helpers";
import "./MobileAoS.css";

// Enhancement list item component
const EnhancementItem = ({ enhancement, onClick }) => {
  const cost = enhancement.points ?? enhancement.cpCost;
  const costLabel = enhancement.points != null ? "pts" : "CP";

  return (
    <button className="aos-units-item" onClick={onClick}>
      <span className="aos-units-item-name">{enhancement.name}</span>
      {cost != null && (
        <span className="aos-units-item-points">
          {cost} {costLabel}
        </span>
      )}
    </button>
  );
};

// Section header component
const SectionHeader = ({ title, count }) => (
  <div className="aos-units-section-header">
    <span>{title}</span>
    <span className="aos-units-section-count">{count}</span>
  </div>
);

export const MobileAoSEnhancements = () => {
  const navigate = useNavigate();
  const { selectedFaction } = useDataSourceStorage();
  const { settings } = useSettingsStorage();

  const factionSlug = selectedFaction?.name?.toLowerCase().replaceAll(" ", "-");
  const grandAlliance = selectedFaction?.grandAlliance?.toLowerCase() || "order";
  const fontClass = settings.useFancyFonts === false ? "aos-regular-fonts" : "";

  const handleBack = () => {
    navigate(`/mobile/${factionSlug}`);
  };

  const handleEnhancementClick = (enhancement) => {
    const slug = enhancement.name?.toLowerCase().replaceAll(" ", "-");
    navigate(`/mobile/${factionSlug}/enhancement/${slug}`);
  };

  const enhancements = getBrowsableEnhancements(selectedFaction);

  // Keep the battletome's group order rather than sorting the groups themselves.
  const groups = enhancements.reduce((acc, enhancement) => {
    const name = enhancement.enhancementGroup || "Enhancements";
    if (!acc.some((group) => group.name === name)) acc.push({ name, items: [] });
    acc.find((group) => group.name === name).items.push(enhancement);
    return acc;
  }, []);

  if (!selectedFaction) {
    return null;
  }

  return (
    <div className={`aos-units-page ${grandAlliance} ${fontClass}`}>
      {/* Header */}
      <div className="aos-units-header">
        <button className="aos-units-back" onClick={handleBack}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="aos-units-title">Enhancements</h1>
        <div className="aos-units-count">
          {enhancements.length} {enhancements.length === 1 ? "enhancement" : "enhancements"}
        </div>
      </div>

      {/* Grouped List */}
      <div className="aos-units-list">
        {groups.map((group) => (
          <div key={group.name} className="aos-units-section">
            <SectionHeader title={group.name} count={group.items.length} />
            {[...group.items]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((enhancement) => (
                <EnhancementItem
                  key={enhancement.id || enhancement.name}
                  enhancement={enhancement}
                  onClick={() => handleEnhancementClick(enhancement)}
                />
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};
