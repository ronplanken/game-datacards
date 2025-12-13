import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDataSourceStorage } from "../../../Hooks/useDataSourceStorage";
import "./MobileAoS.css";

// Spell list item component
const SpellItem = ({ spell, onClick }) => {
  return (
    <button className="aos-units-item" onClick={onClick}>
      <span className="aos-units-item-name">{spell.name}</span>
      {spell.castingValue && <span className="aos-units-item-points">{spell.castingValue}+</span>}
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

export const MobileAoSSpellLores = () => {
  const navigate = useNavigate();
  const { selectedFaction } = useDataSourceStorage();

  const factionSlug = selectedFaction?.name?.toLowerCase().replaceAll(" ", "-");
  const grandAlliance = selectedFaction?.grandAlliance?.toLowerCase() || "order";

  const handleBack = () => {
    navigate(`/mobile/${factionSlug}`);
  };

  const handleSpellClick = (lore, spell) => {
    const spellSlug = spell.name?.toLowerCase().replaceAll(" ", "-");
    navigate(`/mobile/${factionSlug}/spell-lore/${spellSlug}`);
  };

  // Get spell lores data
  const spellLores = selectedFaction?.lores || [];

  // Count total spells
  const totalSpells = spellLores.reduce((total, lore) => total + (lore.spells?.length || 0), 0);

  if (!selectedFaction) {
    return null;
  }

  return (
    <div className={`aos-units-page ${grandAlliance}`}>
      {/* Header */}
      <div className="aos-units-header">
        <button className="aos-units-back" onClick={handleBack}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="aos-units-title">Spell Lores</h1>
        <div className="aos-units-count">{totalSpells} spells</div>
      </div>

      {/* Lores List */}
      <div className="aos-units-list">
        {spellLores.map((lore) => (
          <div key={lore.id} className="aos-units-section">
            <SectionHeader title={lore.name} count={lore.spells?.length || 0} />
            {lore.spells
              ?.sort((a, b) => a.name.localeCompare(b.name))
              .map((spell) => (
                <SpellItem key={spell.id} spell={spell} onClick={() => handleSpellClick(lore, spell)} />
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};
