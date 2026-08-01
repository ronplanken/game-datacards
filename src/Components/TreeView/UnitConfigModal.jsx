import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { X, Crown, ChevronDown } from "lucide-react";
import classNames from "classnames";
import { Toggle } from "../SettingsModal/Toggle";
import { getDetachmentName } from "../../Helpers/faction.helpers";
import {
  filterPointsTiersForArmy,
  getPointsTierRestrictionLabel,
  getSelectablePointsTiers,
  isSamePointsTier,
} from "../../Helpers/listPoints.helpers";
import {
  cardHasKeyword,
  isEnhancementAtCopyLimit,
  isUnitEnhancementEligible,
} from "../../Helpers/listCategories.helpers";
import { getEligibleSquads, isAttachableLeader, requiresAttachment } from "../../Helpers/listAttachments.helpers";
import {
  getArmyFactionKeywords,
  getDetachmentNamesEn,
  getListFactionId,
  isEnhancementInDetachments,
} from "../../Helpers/listRoster.helpers";
import { localize } from "../../Helpers/localization.helpers";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import "./UnitConfigModal.css";

export const UnitConfigModal = ({ isOpen, onClose, card, category, onSave }) => {
  const { dataSource } = useDataSourceStorage();
  const { settings, updateSettings } = useSettingsStorage();

  const cardFaction = dataSource.data.find((faction) => faction.id === card?.faction_id);
  const detachments = useMemo(() => cardFaction?.detachments || [], [cardFaction?.detachments]);
  // The faction the list is built for, which its faction-scoped prices key off.
  const listFaction = dataSource.data.find((faction) => faction.id === getListFactionId(category));
  // Restricted prices (a detachment or a faction keyword) only apply to armies
  // that match them.
  const army = useMemo(
    () => ({
      detachments: getDetachmentNamesEn(category?.detachments),
      factions: getArmyFactionKeywords(category?.cards, listFaction?.name),
    }),
    [category?.detachments, category?.cards, listFaction?.name],
  );
  const availableTiers = useMemo(() => filterPointsTiersForArmy(getSelectablePointsTiers(card), army), [card, army]);

  const [selectedUnitSize, setSelectedUnitSize] = useState(undefined);
  const [isWarlord, setIsWarlord] = useState(false);
  const [selectedEnhancement, setSelectedEnhancement] = useState(undefined);
  const [selectedDetachment, setSelectedDetachment] = useState(undefined);
  const [detachmentOpen, setDetachmentOpen] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState(undefined);

  // Reset the card's own selections when the modal opens for a (different) card.
  // Keyed on the card's uuid rather than the object so an unrelated re-render
  // (e.g. a fresh datasource array) cannot wipe an in-progress selection.
  useEffect(() => {
    if (isOpen && card) {
      setIsWarlord(card?.isWarlord || false);
      setSelectedEnhancement(card?.selectedEnhancement);
      setSelectedAttachment(card?.attachedTo);
      setDetachmentOpen(false);

      if (card.unitSize) {
        setSelectedUnitSize(card.unitSize);
      } else {
        setSelectedUnitSize(availableTiers.length === 1 ? availableTiers[0] : undefined);
      }
    }
  }, [isOpen, card?.uuid]);

  // Resolve the detachment separately: it depends on settings and the faction's
  // detachment list, which can arrive/refresh independently of the card.
  useEffect(() => {
    if (!isOpen || !card) return;
    if (card?.detachment) {
      setSelectedDetachment(card.detachment);
      return;
    }
    const savedDetachment = settings?.selectedDetachment?.[card?.faction_id];
    const isStillValid = savedDetachment && detachments?.some((d) => getDetachmentName(d) === savedDetachment);
    setSelectedDetachment(isStillValid ? savedDetachment : getDetachmentName(detachments?.[0]));
  }, [isOpen, card?.uuid, card?.detachment, card?.faction_id, settings?.selectedDetachment, detachments]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const warlordAlreadyAdded = category?.cards?.find((c) => c.isWarlord);
  const epicHeroAlreadyAdded = category?.cards?.find((foundCard) => {
    return foundCard.uuid !== card?.uuid && cardHasKeyword(card, "Epic Hero") && card?.id === foundCard?.id;
  });

  const isCharacter = cardHasKeyword(card, "Character");
  const isEpicHero = cardHasKeyword(card, "Epic Hero");
  const showWarlord = isCharacter || isEpicHero;

  // Characters take regular enhancements; non-character units can take upgrades
  // (equipableByNonCharacter). Epic Heroes take neither.
  const filteredEnhancements = isEpicHero
    ? []
    : cardFaction?.enhancements
        ?.filter((enhancement) => isEnhancementInDetachments(enhancement, category?.detachments, selectedDetachment))
        ?.filter((enhancement) => isUnitEnhancementEligible(card, enhancement));

  const showEnhancements = !isEpicHero && (filteredEnhancements?.length || 0) > 0;
  const showDetachments = showEnhancements && detachments?.length > 1;
  const enhancementLabel = isCharacter ? "Enhancement" : "Upgrade";
  // Leaders may stand alone; Support units must be attached to an eligible squad
  // that is already in this list.
  const mustAttach = requiresAttachment(card);
  const eligibleSquads = isAttachableLeader(card)
    ? getEligibleSquads(card, category?.cards || [], { detachment: selectedDetachment })
    : [];

  const selectEnhancement = (enhancement) => {
    if (selectedEnhancement?.name === enhancement?.name) {
      setSelectedEnhancement(undefined);
    } else {
      setSelectedEnhancement(enhancement);
    }
  };

  const handleDetachmentChange = (value) => {
    setSelectedDetachment(value);
    setDetachmentOpen(false);
    updateSettings({
      ...settings,
      selectedDetachment: { ...settings?.selectedDetachment, [card.faction_id]: value },
    });
  };

  const handleSubmit = () => {
    onSave({ ...card, unitSize: selectedUnitSize, selectedEnhancement, isWarlord, attachedTo: selectedAttachment });
  };

  // Regular enhancements are once per army; Upgrades may be taken up to three
  // times (core rules, Select Enhancements). This card's own copy is excluded.
  const isEnhancementDisabled = (enhancement) => isEnhancementAtCopyLimit(enhancement, category?.cards, card?.uuid);

  const modalRoot = document.getElementById("modal-root");

  return ReactDOM.createPortal(
    <div className="ucm-overlay" onClick={onClose} data-testid="ucm-overlay">
      <div className="ucm-modal" onClick={(e) => e.stopPropagation()} data-testid="ucm-modal">
        {/* Header */}
        <div className="ucm-header">
          <h3 className="ucm-title">Update {card.name}</h3>
          <button className="ucm-close" onClick={onClose} type="button" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="ucm-content">
          {/* Unit Size */}
          <div>
            <div className="ucm-section-label">Unit size</div>
            <div className="ucm-size-list">
              {availableTiers.map((point) => {
                const isSelected = isSamePointsTier(selectedUnitSize, point);
                const restrictionLabel = getPointsTierRestrictionLabel(point, settings.language);
                return (
                  <div
                    key={`${point.models}-${localize(point.keyword)}`}
                    className={classNames("ucm-size-option", { selected: isSelected })}
                    onClick={() => setSelectedUnitSize(point)}>
                    <div className={classNames("ucm-radio", { checked: isSelected })} />
                    <div className="ucm-size-text">
                      <span className="ucm-size-label">
                        {point.models} {point.models > 1 ? "models" : "model"}
                        {point.keyword ? ` (${localize(point.keyword, settings.language)})` : ""}
                        {restrictionLabel && <span className="ucm-size-sublabel">{restrictionLabel}</span>}
                      </span>
                      <span className="ucm-size-cost">{point.cost} pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {card?.additionalCost?.cost != null && (
              <p className="ucm-additional-cost">
                +{card.additionalCost.cost} pts for each copy of this datasheet beyond{" "}
                {card.additionalCost.afterSelections} in your list.
              </p>
            )}
          </div>

          {/* Warlord */}
          {showWarlord && (
            <div>
              <div className="ucm-section-label">Warlord</div>
              <div className={classNames("ucm-warlord-row", { disabled: warlordAlreadyAdded })}>
                <div className="ucm-warlord-info">
                  <Crown size={18} className={classNames("ucm-warlord-icon", { active: isWarlord })} />
                  {warlordAlreadyAdded ? (
                    <span className="ucm-warlord-disabled-text">You already have a warlord</span>
                  ) : (
                    <span className="ucm-warlord-label">Warlord</span>
                  )}
                </div>
                <Toggle checked={isWarlord} onChange={(val) => setIsWarlord(val)} disabled={warlordAlreadyAdded} />
              </div>
            </div>
          )}

          {/* Detachment */}
          {showDetachments && (
            <div>
              <div className="ucm-section-label">Detachment</div>
              <div className="ucm-detachment-wrapper">
                <div
                  className={classNames("ucm-detachment-trigger", { open: detachmentOpen })}
                  onClick={() => setDetachmentOpen((v) => !v)}>
                  <span>{selectedDetachment || "Select detachment"}</span>
                  <ChevronDown size={16} className="ucm-detachment-chevron" />
                </div>
                {detachmentOpen && (
                  <div className="ucm-detachment-menu">
                    {detachments?.map((d) => {
                      const name = getDetachmentName(d);
                      return (
                        <div
                          key={name}
                          className={classNames("ucm-detachment-option", {
                            selected: selectedDetachment === name,
                          })}
                          onClick={() => handleDetachmentChange(name)}>
                          {name}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Enhancements / Upgrades */}
          {showEnhancements && filteredEnhancements?.length > 0 && (
            <div>
              <div className="ucm-section-label">{enhancementLabel}s</div>
              <div className="ucm-enhancement-list">
                {filteredEnhancements.map((enhancement) => {
                  const disabled = isEnhancementDisabled(enhancement);
                  const isSelected = selectedEnhancement?.name === enhancement?.name;
                  return (
                    <div
                      key={enhancement.name}
                      className={classNames("ucm-enhancement-option", {
                        selected: isSelected,
                        disabled,
                      })}
                      onClick={!disabled ? () => selectEnhancement(enhancement) : undefined}>
                      <div className={classNames("ucm-radio", { checked: isSelected })} />
                      <div className="ucm-enhancement-text">
                        <span className="ucm-enhancement-name">{enhancement.name}</span>
                        <span className="ucm-enhancement-cost">{enhancement.cost} pts</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Attach to unit (leaders / support) */}
          {isAttachableLeader(card) && (
            <div>
              <div className="ucm-section-label">{mustAttach ? "Attach to unit (required)" : "Attach to unit"}</div>
              <div className="ucm-enhancement-list">
                {!mustAttach && (
                  <div
                    className={classNames("ucm-enhancement-option", { selected: !selectedAttachment })}
                    onClick={() => setSelectedAttachment(undefined)}>
                    <div className={classNames("ucm-radio", { checked: !selectedAttachment })} />
                    <div className="ucm-enhancement-text">
                      <span className="ucm-enhancement-name">Not attached</span>
                    </div>
                  </div>
                )}
                {eligibleSquads.map((squad) => {
                  const isSelected = selectedAttachment === squad.uuid;
                  return (
                    <div
                      key={squad.uuid}
                      className={classNames("ucm-enhancement-option", { selected: isSelected })}
                      onClick={() => setSelectedAttachment(squad.uuid)}>
                      <div className={classNames("ucm-radio", { checked: isSelected })} />
                      <div className="ucm-enhancement-text">
                        <span className="ucm-enhancement-name">{squad.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {mustAttach && !selectedAttachment && (
                <span className="ucm-epic-hero-warning">
                  {eligibleSquads.length > 0
                    ? "This Support unit must be attached to a unit."
                    : "This Support unit must be attached, but no eligible unit is in this list yet."}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="ucm-footer">
          {epicHeroAlreadyAdded && (
            <span className="ucm-epic-hero-warning">This Epic Hero has already been added to this list</span>
          )}
          <button
            className="ucm-submit"
            onClick={handleSubmit}
            disabled={!selectedUnitSize || epicHeroAlreadyAdded || (mustAttach && !selectedAttachment)}
            type="button">
            Set unit values
          </button>
        </div>
      </div>
    </div>,
    modalRoot,
  );
};
