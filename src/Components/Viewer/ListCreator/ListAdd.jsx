import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Crown } from "lucide-react";
import { message } from "../../Toast/message";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { useDataSourceStorage } from "../../../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { getDetachmentName } from "../../../Helpers/faction.helpers";
import {
  filterPointsTiersForArmy,
  getPointsTierRestrictionLabel,
  getSelectablePointsTiers,
  isSamePointsTier,
} from "../../../Helpers/listPoints.helpers";
import {
  cardHasKeyword,
  isEnhancementAtCopyLimit,
  isUnitEnhancementEligible,
} from "../../../Helpers/listCategories.helpers";
import {
  getArmyFactionKeywords,
  getDetachmentNamesEn,
  getListFactionId,
  isEnhancementInDetachments,
} from "../../../Helpers/listRoster.helpers";
import { localize } from "../../../Helpers/localization.helpers";
import { useUmami } from "../../../Hooks/useUmami";
import { useMobileList } from "../useMobileList";
import { MobileModal } from "../Mobile/MobileModal";
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
  const { trackEvent } = useUmami();
  const { dataSource } = useDataSourceStorage();
  const { settings, updateSettings } = useSettingsStorage();

  const cardFaction = dataSource.data.find((faction) => faction.id === activeCard?.faction_id);
  // 11e armies hold several detachments; enhancements from any of them are available.
  const armyDetachments = lists[selectedList]?.detachments || [];
  // The faction the list is built for, which its faction-scoped prices key off.
  const listFaction = dataSource.data.find((faction) => faction.id === getListFactionId(lists[selectedList]));
  // Restricted prices (a detachment or a faction keyword) only apply to armies
  // that match them. The card being added counts towards the army's keywords too,
  // so the first card of a chapter-specific list already prices correctly.
  const army = useMemo(
    () => ({
      detachments: getDetachmentNamesEn(armyDetachments),
      factions: getArmyFactionKeywords([...(lists[selectedList]?.cards || []), activeCard], listFaction?.name),
    }),
    [armyDetachments, lists, selectedList, activeCard, listFaction?.name],
  );
  const availableTiers = useMemo(
    () => filterPointsTiersForArmy(getSelectablePointsTiers(activeCard), army),
    [activeCard, army],
  );

  const [selectedEnhancement, setSelectedEnhancement] = useState();
  const [isWarlord, setIsWarlord] = useState(false);
  const [detachmentPickerOpen, setDetachmentPickerOpen] = useState(false);
  const [selectedUnitSize, setSelectedUnitSize] = useState(() =>
    availableTiers.length === 1 ? availableTiers[0] : undefined,
  );

  const detachments = useMemo(() => cardFaction?.detachments || [], [cardFaction?.detachments]);
  const warlordAlreadyAdded = lists[selectedList]?.cards?.find((card) => card.isWarlord);
  const epicHeroAlreadyAdded = lists[selectedList]?.cards?.find((card) => {
    return cardHasKeyword(activeCard, "Epic Hero") && activeCard.id === card.id;
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
      setSelectedUnitSize(availableTiers.length === 1 ? availableTiers[0] : undefined);
    }
  }, [isVisible, activeCard, availableTiers]);

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
    trackEvent("list-add-unit", { unitName: activeCard.name, isWarlord });
    handleClose();
    message.success(`${activeCard.name} added to list`);
  };

  const selectEnhancement = (enhancement) => {
    if (selectedEnhancement?.name === enhancement?.name) {
      setSelectedEnhancement(undefined);
    } else {
      setSelectedEnhancement(enhancement);
    }
  };

  // Regular enhancements are once per army; Upgrades may be taken up to three
  // times (core rules, Select Enhancements).
  const isEnhancementDisabled = (enhancement) => isEnhancementAtCopyLimit(enhancement, lists[selectedList]?.cards);

  const isCharacter = cardHasKeyword(activeCard, "Character");
  const isEpicHero = cardHasKeyword(activeCard, "Epic Hero");
  const showWarlord = isCharacter || isEpicHero;

  // Filter enhancements for current detachment and card. Characters take regular
  // enhancements; non-character units can take enhancements flagged as upgrades
  // (equipableByNonCharacter). Epic Heroes take neither.
  const getAvailableEnhancements = () => {
    if (!cardFaction?.enhancements || isEpicHero) return [];

    return cardFaction.enhancements
      .filter((enhancement) => isEnhancementInDetachments(enhancement, armyDetachments, selectedDetachment))
      .filter((enhancement) => isUnitEnhancementEligible(activeCard, enhancement));
  };

  const availableEnhancements = getAvailableEnhancements();
  const showEnhancements = !isEpicHero && availableEnhancements.length > 0;
  const enhancementLabel = isCharacter ? "Enhancement" : "Upgrade";

  // Don't show for cards without array-based points (e.g., AoS warscrolls)
  if (!activeCard || !Array.isArray(activeCard?.points)) return null;

  return (
    <>
      <MobileModal isOpen={isVisible} onClose={handleClose} title={`Add ${activeCard.name}`}>
        <div className="list-add-content">
          {/* Unit Size Section */}
          <div className="list-add-section">
            <h4 className="list-add-section-title">Unit Size</h4>
            <div className="list-add-options">
              {availableTiers.map((point) => {
                const restrictionLabel = getPointsTierRestrictionLabel(point, settings.language);
                return (
                  <button
                    key={`${point.models}-${localize(point.keyword)}`}
                    className={`list-add-option ${isSamePointsTier(selectedUnitSize, point) ? "selected" : ""}`}
                    onClick={() => setSelectedUnitSize(point)}>
                    <span className="option-label">
                      {point.models} models{point.keyword ? ` (${localize(point.keyword, settings.language)})` : ""}
                      {restrictionLabel && <span className="option-sublabel">{restrictionLabel}</span>}
                    </span>
                    <span className="option-value">{point.cost} pts</span>
                  </button>
                );
              })}
            </div>
            {activeCard?.additionalCost?.cost != null && (
              <p className="list-add-additional-cost">
                +{activeCard.additionalCost.cost} pts for each copy of this datasheet beyond{" "}
                {activeCard.additionalCost.afterSelections} in your list.
              </p>
            )}
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
              <button className="list-add-select" onClick={() => setDetachmentPickerOpen(true)}>
                <span>{selectedDetachment || "Select detachment"}</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Enhancements / Upgrades Section */}
          {showEnhancements && availableEnhancements.length > 0 && (
            <div className="list-add-section">
              <h4 className="list-add-section-title">{enhancementLabel}</h4>
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
      </MobileModal>

      {/* Detachment Picker Sub-Sheet */}
      <DetachmentPicker
        isOpen={detachmentPickerOpen}
        onClose={() => setDetachmentPickerOpen(false)}
        detachments={detachments}
        selected={selectedDetachment}
        onSelect={handleDetachmentSelect}
        elevated
      />
    </>
  );
};
