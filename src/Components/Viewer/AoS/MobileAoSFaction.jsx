import { useNavigate } from "react-router-dom";
import { ChevronRight, List } from "lucide-react";
import { useDataSourceStorage } from "../../../Hooks/useDataSourceStorage";
import "./MobileAoS.css";

export const MobileAoSFaction = () => {
  const navigate = useNavigate();
  const { selectedFaction } = useDataSourceStorage();

  if (!selectedFaction) return null;

  // Get grand alliance for theming
  const grandAlliance = selectedFaction.grandAlliance?.toLowerCase() || "order";
  const warscrollCount = selectedFaction.warscrolls?.length || 0;

  const handleViewUnits = () => {
    const factionSlug = selectedFaction.name?.toLowerCase().replaceAll(" ", "-");
    navigate(`/mobile/${factionSlug}/units`);
  };

  return (
    <div className={`mobile-aos-faction ${grandAlliance}`}>
      {/* Header Banner */}
      <div className="aos-faction-header">
        <h1 className="aos-faction-title">{selectedFaction.name}</h1>
        <span className="aos-faction-alliance">{selectedFaction.grandAlliance || "Order"}</span>
      </div>

      {/* Browse Units Button - matching 40K style */}
      <button className="aos-faction-units-button" onClick={handleViewUnits} type="button">
        <List size={18} />
        <span>Browse All Warscrolls</span>
        <span className="units-count">{warscrollCount}</span>
        <ChevronRight size={18} />
      </button>
    </div>
  );
};
