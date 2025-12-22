import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { BottomSheet } from "./Mobile/BottomSheet";
import "./MobileSearchFactionFilter.css";

export const MobileSearchFactionFilter = ({ isOpen, onClose }) => {
  const { dataSource } = useDataSourceStorage();
  const navigate = useNavigate();

  const handleSelectFaction = (faction) => {
    const factionSlug = faction.name?.toLowerCase().replaceAll(" ", "-");
    navigate(`/mobile/${factionSlug}`);
    onClose();
  };

  const factions = dataSource?.data || [];

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Select Faction" maxHeight="70vh">
      <div className="faction-filter-content">
        {factions.map((faction) => (
          <button
            key={faction.id}
            className="faction-filter-item"
            onClick={() => handleSelectFaction(faction)}
            type="button"
            style={{
              "--faction-colour": faction.colours?.header,
            }}>
            <span className="faction-colour-indicator" />
            <span className="faction-filter-name">{faction.name}</span>
            <ChevronRight size={18} className="faction-filter-chevron" />
          </button>
        ))}
      </div>
    </BottomSheet>
  );
};
