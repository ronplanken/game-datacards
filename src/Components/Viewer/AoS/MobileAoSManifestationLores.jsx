import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDataSourceStorage } from "../../../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
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
const SectionHeader = ({ title, count, isGeneric }) => (
  <div className="aos-units-section-header">
    <span>
      {title}
      {isGeneric && <span className="aos-generic-badge">(Generic)</span>}
    </span>
    <span className="aos-units-section-count">{count}</span>
  </div>
);

export const MobileAoSManifestationLores = () => {
  const navigate = useNavigate();
  const { dataSource, selectedFaction } = useDataSourceStorage();
  const { settings } = useSettingsStorage();

  const factionSlug = selectedFaction?.name?.toLowerCase().replaceAll(" ", "-");
  const grandAlliance = selectedFaction?.grandAlliance?.toLowerCase() || "order";
  const fontClass = settings.useFancyFonts === false ? "aos-regular-fonts" : "";

  // Get generic data
  const genericData = dataSource?.genericData;
  const showGeneric = settings.showGenericManifestations;

  const handleBack = () => {
    navigate(`/mobile/${factionSlug}`);
  };

  const handleSpellClick = (lore, spell) => {
    const spellSlug = spell.name?.toLowerCase().replaceAll(" ", "-");
    navigate(`/mobile/${factionSlug}/manifestation-lore/${spellSlug}`);
  };

  // Get manifestation lores data (faction + generic when enabled)
  const factionManifestationLores = selectedFaction?.manifestationLores || [];
  const genericManifestationLores = (showGeneric && genericData?.manifestationLores) || [];
  const manifestationLores = [...factionManifestationLores, ...genericManifestationLores];

  // Count total spells
  const totalSpells = manifestationLores.reduce((total, lore) => total + (lore.spells?.length || 0), 0);

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
        <h1 className="aos-units-title">Manifestation Lores</h1>
        <div className="aos-units-count">{totalSpells} spells</div>
      </div>

      {/* Lores List */}
      <div className="aos-units-list">
        {manifestationLores.map((lore) => (
          <div key={lore.id} className="aos-units-section">
            <SectionHeader
              title={lore.name}
              count={lore.spells?.length || 0}
              isGeneric={lore.faction_id === "GENERIC"}
            />
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
