import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Crown } from "lucide-react";
import { message } from "../../Toast/message";
import { useDataSourceStorage } from "../../../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { getDetachmentName } from "../../../Helpers/faction.helpers";
import { getSelectablePointsTiers, isSamePointsTier } from "../../../Helpers/listPoints.helpers";
import { cardHasKeyword, isUnitEnhancementEligible } from "../../../Helpers/listCategories.helpers";
import { getEligibleSquads, isAttachableLeader } from "../../../Helpers/listAttachments.helpers";
import { localize } from "../../../Helpers/localization.helpers";
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

export const ListEditCard = ({ isVisible, setIsVisible, card }) => {
  const { lists, selectedList, updateDatacard, setCardAttachment } = useMobileList();
  const { dataSource } = useDataSourceStorage();
  const { settings, updateSettings } = useSettingsStorage();

  const [selectedEnhancement, setSelectedEnhancement] = useState();
  const [isWarlord, setIsWarlord] = useState(false);
  const [detachmentPickerOpen, setDetachmentPickerOpen] = useState(false);
  const [selectedUnitSize, setSelectedUnitSize] = useState();
  const [selectedAttachment, setSelectedAttachment] = useState();

  const cardFaction = dataSource.data.find((faction) => faction.id === card?.faction_id);
  const detachments = useMemo(() => cardFaction?.detachments || [], [cardFaction?.detachments]);

  // Check warlord — exclude current card's uuid
  const warlordAlreadyAdded = lists[selectedList]?.cards?.find((c) => c.isWarlord && c.uuid !== card?.uuid);

  const [selectedDetachment, setSelectedDetachment] = useState();

  useEffect(() => {
    if (settings?.selectedDetachment?.[card?.faction_id]) {
      const savedDetachment = settings?.selectedDetachment?.[card?.faction_id];
      const isStillValid = detachments?.some((d) => getDetachmentName(d) === savedDetachment);
      if (isStillValid) {
        setSelectedDetachment(savedDetachment);
      } else {
        setSelectedDetachment(getDetachmentName(detachments?.[0]));
      }
    } else {
      setSelectedDetachment(getDetachmentName(detachments?.[0]));
    }
  }, [settings, card?.faction_id, detachments]);

  // Pre-populate state from card when modal opens
  useEffect(() => {
    if (isVisible && card) {
      setSelectedUnitSize(card.unitSize || undefined);
      setSelectedEnhancement(card.selectedEnhancement || undefined);
      setIsWarlord(card.isWarlord || false);
      setSelectedAttachment(card.attachedTo || undefined);
    }
  }, [isVisible, card]);

  const handleClose = () => setIsVisible(false);

  const handleDetachmentSelect = (detachment) => {
    setSelectedDetachment(detachment);
    updateSettings({
      ...settings,
      selectedDetachment: { ...settings.selectedDetachment, [card.faction_id]: detachment },
    });
    setSelectedEnhancement(undefined);
  };

  const handleSave = () => {
    updateDatacard(card.uuid, selectedUnitSize, selectedEnhancement, isWarlord);
    if (isAttachableLeader(card)) {
      setCardAttachment(card.uuid, selectedAttachment);
    }
    handleClose();
    message.success(`${card.name} updated`);
  };

  const selectEnhancement = (enhancement) => {
    if (selectedEnhancement?.name === enhancement?.name) {
      setSelectedEnhancement(undefined);
    } else {
      setSelectedEnhancement(enhancement);
    }
  };

  // Check if enhancement is already used — exclude current card's uuid
  const isEnhancementDisabled = (enhancement) => {
    return lists[selectedList]?.cards?.some(
      (c) => c?.selectedEnhancement?.name === enhancement?.name && c.uuid !== card?.uuid,
    );
  };

  const isCharacter = cardHasKeyword(card, "Character");
  const isEpicHero = cardHasKeyword(card, "Epic Hero");
  const showWarlord = isCharacter || isEpicHero;

  // Characters take regular enhancements; non-character units can take upgrades
  // (equipableByNonCharacter). Epic Heroes take neither.
  const getAvailableEnhancements = () => {
    if (!cardFaction?.enhancements || isEpicHero) return [];

    return cardFaction.enhancements
      .filter(
        (enhancement) =>
          enhancement?.detachment?.toLowerCase() === selectedDetachment?.toLowerCase() || !enhancement.detachment,
      )
      .filter((enhancement) => isUnitEnhancementEligible(card, enhancement));
  };

  const availableEnhancements = getAvailableEnhancements();
  const showEnhancements = !isEpicHero && availableEnhancements.length > 0;
  const enhancementLabel = isCharacter ? "Enhancement" : "Upgrade";
  // Leaders/support units can attach to eligible squads already in this list.
  const eligibleSquads = isAttachableLeader(card) ? getEligibleSquads(card, lists[selectedList]?.cards || []) : [];

  if (!card || !Array.isArray(card?.points)) return null;

  return (
    <>
      <MobileModal isOpen={isVisible} onClose={handleClose} title={`Configure ${card.name}`}>
        <div className="list-add-content">
          {/* Unit Size Section */}
          <div className="list-add-section">
            <h4 className="list-add-section-title">Unit Size</h4>
            <div className="list-add-options">
              {getSelectablePointsTiers(card).map((point) => (
                <button
                  key={`${point.models}-${localize(point.keyword)}`}
                  className={`list-add-option ${isSamePointsTier(selectedUnitSize, point) ? "selected" : ""}`}
                  onClick={() => setSelectedUnitSize(point)}>
                  <span className="option-label">
                    {point.models} models{point.keyword ? ` (${localize(point.keyword, settings.language)})` : ""}
                  </span>
                  <span className="option-value">{point.cost} pts</span>
                </button>
              ))}
            </div>
            {card?.additionalCost?.cost != null && (
              <p className="list-add-additional-cost">
                +{card.additionalCost.cost} pts for each copy of this datasheet beyond{" "}
                {card.additionalCost.afterSelections} in your list.
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
                <Toggle checked={isWarlord} onChange={setIsWarlord} disabled={!!warlordAlreadyAdded} />
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

          {/* Attach-to Section (leaders / support units) */}
          {eligibleSquads.length > 0 && (
            <div className="list-add-section">
              <h4 className="list-add-section-title">Attach to unit</h4>
              <div className="list-add-options">
                <button
                  className={`list-add-option ${!selectedAttachment ? "selected" : ""}`}
                  onClick={() => setSelectedAttachment(undefined)}>
                  <span className="option-label">Not attached</span>
                </button>
                {eligibleSquads.map((squad) => (
                  <button
                    key={squad.uuid}
                    className={`list-add-option ${selectedAttachment === squad.uuid ? "selected" : ""}`}
                    onClick={() => setSelectedAttachment(squad.uuid)}>
                    <span className="option-label">{squad.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Save Button */}
          <button className="list-add-submit" onClick={handleSave} disabled={!selectedUnitSize}>
            Save Changes
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
      />
    </>
  );
};
