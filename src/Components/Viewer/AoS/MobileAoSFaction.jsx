import { useNavigate } from "react-router-dom";
import { ChevronRight, List, Sparkles, BookOpen } from "lucide-react";
import { useDataSourceStorage } from "../../../Hooks/useDataSourceStorage";
import "./MobileAoS.css";

export const MobileAoSFaction = () => {
  const navigate = useNavigate();
  const { selectedFaction } = useDataSourceStorage();

  if (!selectedFaction) return null;

  // Get grand alliance for theming
  const grandAlliance = selectedFaction.grandAlliance?.toLowerCase() || "order";
  const warscrollCount = selectedFaction.warscrolls?.length || 0;

  // Count total spells across all manifestation lores
  const manifestationLores = selectedFaction.manifestationLores || [];
  const manifestationSpellCount = manifestationLores.reduce((total, lore) => total + (lore.spells?.length || 0), 0);

  // Count total spells across all spell lores
  const spellLores = selectedFaction.lores || [];
  const spellLoreCount = spellLores.reduce((total, lore) => total + (lore.spells?.length || 0), 0);

  const factionSlug = selectedFaction.name?.toLowerCase().replaceAll(" ", "-");

  const handleViewUnits = () => {
    navigate(`/mobile/${factionSlug}/units`);
  };

  const handleViewManifestationLores = () => {
    navigate(`/mobile/${factionSlug}/manifestation-lores`);
  };

  const handleViewSpellLores = () => {
    navigate(`/mobile/${factionSlug}/spell-lores`);
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

      {/* Spell Lores Button */}
      {spellLoreCount > 0 && (
        <button className="aos-faction-units-button" onClick={handleViewSpellLores} type="button">
          <BookOpen size={18} />
          <span>Spell Lores</span>
          <span className="units-count">{spellLoreCount}</span>
          <ChevronRight size={18} />
        </button>
      )}

      {/* Manifestation Lores Button */}
      {manifestationSpellCount > 0 && (
        <button className="aos-faction-units-button" onClick={handleViewManifestationLores} type="button">
          <Sparkles size={18} />
          <span>Manifestation Lores</span>
          <span className="units-count">{manifestationSpellCount}</span>
          <ChevronRight size={18} />
        </button>
      )}
    </div>
  );
};
