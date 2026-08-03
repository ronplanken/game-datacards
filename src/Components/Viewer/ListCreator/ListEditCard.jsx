import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Crown, Minus, Plus } from "lucide-react";
import { message } from "../../Toast/message";
import { useDataSourceStorage } from "../../../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { getDetachmentName } from "../../../Helpers/faction.helpers";
import {
  filterPointsTiersForArmy,
  getPaidWargearOptions,
  getPointsTierRestrictionLabel,
  getSelectablePointsTiers,
  getWargearQuantity,
  getWargearQuantityMax,
  isSamePointsTier,
  setWargearQuantity,
} from "../../../Helpers/listPoints.helpers";
import {
  cardHasKeyword,
  isEnhancementAtCopyLimit,
  isUnitEnhancementEligible,
} from "../../../Helpers/listCategories.helpers";
import {
  getAttachmentType,
  getEligibleSquads,
  isAttachableLeader,
  requiresAttachment,
} from "../../../Helpers/listAttachments.helpers";
import {
  getArmyFactionKeywords,
  getDetachmentNamesEn,
  getListFactionId,
  isEnhancementInDetachments,
} from "../../../Helpers/listRoster.helpers";
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
  const { lists, selectedList, updateDatacard } = useMobileList();
  const { dataSource } = useDataSourceStorage();
  const { settings, updateSettings } = useSettingsStorage();

  const [selectedEnhancement, setSelectedEnhancement] = useState();
  const [isWarlord, setIsWarlord] = useState(false);
  const [detachmentPickerOpen, setDetachmentPickerOpen] = useState(false);
  const [selectedUnitSize, setSelectedUnitSize] = useState();
  const [selectedAttachment, setSelectedAttachment] = useState();
  const [selectedWargear, setSelectedWargear] = useState([]);

  const cardFaction = dataSource.data.find((faction) => faction.id === card?.faction_id);
  // 11e armies hold several detachments; enhancements from any of them are available.
  const armyDetachments = lists[selectedList]?.detachments || [];
  const detachments = useMemo(() => cardFaction?.detachments || [], [cardFaction?.detachments]);
  // The faction the list is built for, which its faction-scoped prices key off.
  const listFaction = dataSource.data.find((faction) => faction.id === getListFactionId(lists[selectedList]));
  // Restricted prices (a detachment or a faction keyword) only apply to armies
  // that match them.
  const army = useMemo(
    () => ({
      detachments: getDetachmentNamesEn(armyDetachments),
      factions: getArmyFactionKeywords(lists[selectedList]?.cards, listFaction?.name),
    }),
    [armyDetachments, lists, selectedList, listFaction?.name],
  );
  const availableTiers = useMemo(() => filterPointsTiersForArmy(getSelectablePointsTiers(card), army), [card, army]);
  // Only the wargear this datasheet actually charges for; free swaps are noise
  // here. Empty for every non-11e card, which hides the section entirely.
  const paidWargear = useMemo(() => getPaidWargearOptions(card), [card]);

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
      setSelectedWargear(Array.isArray(card.selectedWargear) ? card.selectedWargear : []);
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
    // Single write: passing the attachment through updateDatacard avoids a second
    // whole-category update that would overwrite this save's other changes.
    updateDatacard(card.uuid, selectedUnitSize, selectedEnhancement, isWarlord, {
      ...(isAttachableLeader(card) ? { attachedTo: selectedAttachment } : {}),
      ...(paidWargear.length > 0 ? { selectedWargear } : {}),
    });
    handleClose();
    message.success(`${card.name} updated`);
  };

  const changeWargearQuantity = (option, quantity) =>
    setSelectedWargear((current) => setWargearQuantity(current, option, quantity));

  const selectEnhancement = (enhancement) => {
    if (selectedEnhancement?.name === enhancement?.name) {
      setSelectedEnhancement(undefined);
    } else {
      setSelectedEnhancement(enhancement);
    }
  };

  // Regular enhancements are once per army; Upgrades may be taken up to three
  // times (core rules, Select Enhancements). This card's own copy is excluded.
  const isEnhancementDisabled = (enhancement) =>
    isEnhancementAtCopyLimit(enhancement, lists[selectedList]?.cards, card?.uuid);

  const isCharacter = cardHasKeyword(card, "Character");
  const isEpicHero = cardHasKeyword(card, "Epic Hero");
  const showWarlord = isCharacter || isEpicHero;

  // Characters take regular enhancements; non-character units can take upgrades
  // (equipableByNonCharacter). Epic Heroes take neither.
  const getAvailableEnhancements = () => {
    if (!cardFaction?.enhancements || isEpicHero) return [];

    return cardFaction.enhancements
      .filter((enhancement) => isEnhancementInDetachments(enhancement, armyDetachments, selectedDetachment))
      .filter((enhancement) => isUnitEnhancementEligible(card, enhancement));
  };

  const availableEnhancements = getAvailableEnhancements();
  const showEnhancements = !isEpicHero && availableEnhancements.length > 0;
  const enhancementLabel = isCharacter ? "Enhancement" : "Upgrade";
  // Leaders/support units can attach to eligible squads already in this list.
  // Support units MUST be attached; leaders may stand alone.
  const attachmentType = getAttachmentType(card);
  const mustAttach = requiresAttachment(card);
  const eligibleSquads = isAttachableLeader(card)
    ? getEligibleSquads(card, lists[selectedList]?.cards || [], { detachment: selectedDetachment })
    : [];

  if (!card || !Array.isArray(card?.points)) return null;

  return (
    <>
      <MobileModal isOpen={isVisible} onClose={handleClose} title={`Configure ${card.name}`}>
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

          {/* Wargear that costs points (11e) */}
          {paidWargear.length > 0 && (
            <div className="list-add-section">
              <h4 className="list-add-section-title">Wargear</h4>
              <div className="list-add-options">
                {paidWargear.map((option) => {
                  const name = localize(option.name, settings.language);
                  const quantity = getWargearQuantity(selectedWargear, option);
                  const max = getWargearQuantityMax(selectedUnitSize);
                  return (
                    <div
                      key={`${localize(option.name)}-${option.cost}`}
                      className={`list-add-wargear ${quantity > 0 ? "selected" : ""}`}>
                      <div className="list-add-wargear-text">
                        <span className="option-label">{name}</span>
                        <span className="option-value">+{option.cost} pts each</span>
                      </div>
                      <div className="list-add-wargear-stepper">
                        <button
                          className="list-add-wargear-step"
                          type="button"
                          aria-label={`Remove one ${name}`}
                          disabled={quantity <= 0}
                          onClick={() => changeWargearQuantity(option, quantity - 1)}>
                          <Minus size={14} />
                        </button>
                        <span className="list-add-wargear-quantity">{quantity}</span>
                        <button
                          className="list-add-wargear-step"
                          type="button"
                          aria-label={`Add one ${name}`}
                          disabled={quantity >= max}
                          onClick={() => changeWargearQuantity(option, quantity + 1)}>
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Attach-to Section (leaders / support units) */}
          {isAttachableLeader(card) && (
            <div className="list-add-section">
              <h4 className="list-add-section-title">
                {attachmentType === "support" ? "Attach to unit (required)" : "Attach to unit"}
              </h4>
              {mustAttach && !selectedAttachment && (
                <p className="list-add-warning">
                  {eligibleSquads.length > 0
                    ? "This Support unit must be attached to a unit."
                    : "This Support unit must be attached, but no eligible unit is in your list yet."}
                </p>
              )}
              <div className="list-add-options">
                {!mustAttach && (
                  <button
                    className={`list-add-option ${!selectedAttachment ? "selected" : ""}`}
                    onClick={() => setSelectedAttachment(undefined)}>
                    <span className="option-label">Not attached</span>
                  </button>
                )}
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
        elevated
      />
    </>
  );
};
