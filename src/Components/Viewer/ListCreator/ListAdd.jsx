import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Crown } from "lucide-react";
import { message } from "antd";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { useDataSourceStorage } from "../../../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { getDetachmentName } from "../../../Helpers/faction.helpers";
import { useMobileList } from "../useMobileList";
import { BottomSheet } from "../Mobile/BottomSheet";
import { DetachmentPicker } from "../Mobile/DetachmentPicker";
import "./ListAdd.css";

// Custom toggle for warlord selection
const Toggle = ({ checked, onChange, disabled }) => (
  <button
    className={`list-add-toggle ${checked ? "active" : ""} ${disabled ? "disabled" : ""}`}
    onClick={() => !disabled && onChange(!checked)}
    disabled={disabled}>
    <span className="list-add-toggle-thumb" />
  </button>
);

export const ListAdd = ({ isVisible, setIsVisible }) => {
  const { lists, selectedList, addDatacard } = useMobileList();
  const { activeCard } = useCardStorage();
  const { dataSource } = useDataSourceStorage();
  const { settings, updateSettings } = useSettingsStorage();

  const [selectedEnhancement, setSelectedEnhancement] = useState();
  const [isWarlord, setIsWarlord] = useState(false);
  const [detachmentPickerOpen, setDetachmentPickerOpen] = useState(false);
  const [selectedUnitSize, setSelectedUnitSize] = useState(() => {
    if (Array.isArray(activeCard?.points) && activeCard.points.length === 1) {
      return activeCard.points[0];
    }
    return undefined;
  });

  const cardFaction = dataSource.data.find((faction) => faction.id === activeCard?.faction_id);
  const detachments = useMemo(() => cardFaction?.detachments || [], [cardFaction?.detachments]);
  const warlordAlreadyAdded = lists[selectedList]?.datacards?.find((card) => card.warlord);
  const epicHeroAlreadyAdded = lists[selectedList]?.datacards?.find((card) => {
    return activeCard?.keywords?.includes("Epic Hero") && activeCard.id === card.card.id;
  });

  const [selectedDetachment, setSelectedDetachment] = useState();

  useEffect(() => {
    if (settings?.selectedDetachment?.[activeCard?.faction_id]) {
      // Check if saved detachment is still valid
      const savedDetachment = settings?.selectedDetachment?.[activeCard?.faction_id];
      const isStillValid = detachments?.some((d) => getDetachmentName(d) === savedDetachment);
      if (isStillValid) {
        setSelectedDetachment(savedDetachment);
      } else {
        setSelectedDetachment(getDetachmentName(detachments?.[0]));
      }
    } else {
      setSelectedDetachment(getDetachmentName(detachments?.[0]));
    }
  }, [settings, activeCard?.faction_id, detachments]);

  // Reset state when panel opens with new card
  useEffect(() => {
    if (isVisible) {
      setSelectedEnhancement(undefined);
      setIsWarlord(false);
      if (Array.isArray(activeCard?.points) && activeCard.points.length === 1) {
        setSelectedUnitSize(activeCard.points[0]);
      } else {
        setSelectedUnitSize(undefined);
      }
    }
  }, [isVisible, activeCard]);

  const handleClose = () => setIsVisible(false);

  const handleDetachmentSelect = (detachment) => {
    setSelectedDetachment(detachment);
    updateSettings({
      ...settings,
      selectedDetachment: { ...settings.selectedDetachment, [activeCard.faction_id]: detachment },
    });
    setSelectedEnhancement(undefined); // Reset enhancement when detachment changes
  };

  const handleAddToList = () => {
    addDatacard(activeCard, selectedUnitSize, selectedEnhancement, isWarlord);
    handleClose();
    message.success(`${activeCard.name} added to list.`);
  };

  const selectEnhancement = (enhancement) => {
    if (selectedEnhancement?.name === enhancement?.name) {
      setSelectedEnhancement(undefined);
    } else {
      setSelectedEnhancement(enhancement);
    }
  };

  // Check if enhancement is already used
  const isEnhancementDisabled = (enhancement) => {
    return lists[selectedList]?.datacards?.some((card) => card?.enhancement?.name === enhancement?.name);
  };

  // Filter enhancements for current detachment and card
  const getAvailableEnhancements = () => {
    if (!cardFaction?.enhancements) return [];

    return cardFaction.enhancements
      .filter(
        (enhancement) =>
          enhancement?.detachment?.toLowerCase() === selectedDetachment?.toLowerCase() || !enhancement.detachment
      )
      .filter((enhancement) => {
        let isActiveEnhancement = false;
        enhancement.keywords?.forEach((keyword) => {
          if (activeCard?.keywords?.includes(keyword)) isActiveEnhancement = true;
          if (activeCard?.factions?.includes(keyword)) isActiveEnhancement = true;
        });
        enhancement?.excludes?.forEach((exclude) => {
          if (activeCard?.keywords?.includes(exclude)) isActiveEnhancement = false;
          if (activeCard?.factions?.includes(exclude)) isActiveEnhancement = false;
        });
        return isActiveEnhancement;
      });
  };

  const isCharacter = activeCard?.keywords?.includes("Character");
  const isEpicHero = activeCard?.keywords?.includes("Epic Hero");
  const showWarlord = isCharacter || isEpicHero;
  const showEnhancements = isCharacter && !isEpicHero;
  const availableEnhancements = showEnhancements ? getAvailableEnhancements() : [];

  // Don't show for cards without array-based points (e.g., AoS warscrolls)
  if (!activeCard || !Array.isArray(activeCard?.points)) return null;

  return (
    <>
      <BottomSheet isOpen={isVisible} onClose={handleClose} title={`Add ${activeCard.name}`}>
        <div className="list-add-content">
          {/* Unit Size Section */}
          <div className="list-add-section">
            <h4 className="list-add-section-title">Unit Size</h4>
            <div className="list-add-options">
              {activeCard?.points
                ?.filter((p) => p.active)
                .map((point) => (
                  <button
                    key={`${point.models}-${point.keyword || ""}`}
                    className={`list-add-option ${
                      selectedUnitSize?.models === point.models && selectedUnitSize?.keyword === point.keyword
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => setSelectedUnitSize(point)}>
                    <span className="option-label">
                      {point.models} models{point.keyword ? ` (${point.keyword})` : ""}
                    </span>
                    <span className="option-value">{point.cost} pts</span>
                  </button>
                ))}
            </div>
          </div>

          {/* Warlord Section */}
          {showWarlord && (
            <div className="list-add-section">
              <h4 className="list-add-section-title">Warlord</h4>
              <div className="list-add-toggle-row">
                <div className="list-add-toggle-content">
                  <Crown size={18} className={isWarlord ? "active" : ""} />
                  <span>{warlordAlreadyAdded ? "Warlord already assigned" : "Set as Warlord"}</span>
                </div>
                <Toggle checked={isWarlord} onChange={setIsWarlord} disabled={warlordAlreadyAdded} />
              </div>
            </div>
          )}

          {/* Detachment Section */}
          {showEnhancements && detachments?.length > 1 && (
            <div className="list-add-section">
              <h4 className="list-add-section-title">Detachment</h4>
              <button className="list-add-select" onClick={() => setDetachmentPickerOpen(true)}>
                <span>{selectedDetachment || "Select detachment"}</span>
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* Enhancements Section */}
          {showEnhancements && availableEnhancements.length > 0 && (
            <div className="list-add-section">
              <h4 className="list-add-section-title">Enhancement</h4>
              <div className="list-add-options">
                {availableEnhancements.map((enhancement) => {
                  const disabled = isEnhancementDisabled(enhancement);
                  return (
                    <button
                      key={enhancement.name}
                      className={`list-add-option ${selectedEnhancement?.name === enhancement.name ? "selected" : ""} ${
                        disabled ? "disabled" : ""
                      }`}
                      onClick={() => !disabled && selectEnhancement(enhancement)}
                      disabled={disabled}>
                      <span className="option-label">{enhancement.name}</span>
                      <span className="option-value">{enhancement.cost} pts</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Epic Hero Warning */}
          {epicHeroAlreadyAdded && <div className="list-add-warning">This Epic Hero is already in your list.</div>}

          {/* Add Button */}
          <button
            className="list-add-submit"
            onClick={handleAddToList}
            disabled={!selectedUnitSize || epicHeroAlreadyAdded}>
            Add to List
          </button>
        </div>
      </BottomSheet>

      {/* Detachment Picker Sub-Sheet */}
      <DetachmentPicker
        isOpen={detachmentPickerOpen}
        onClose={() => setDetachmentPickerOpen(false)}
        detachments={detachments}
        selected={selectedDetachment}
        onSelect={handleDetachmentSelect}
      />
    </>
  );
};
