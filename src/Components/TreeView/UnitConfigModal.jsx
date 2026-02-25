import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { X, Crown, ChevronDown } from "lucide-react";
import classNames from "classnames";
import { Toggle } from "../SettingsModal/Toggle";
import { getDetachmentName } from "../../Helpers/faction.helpers";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import "./UnitConfigModal.css";

export const UnitConfigModal = ({ isOpen, onClose, card, category, onSave }) => {
  const { dataSource } = useDataSourceStorage();
  const { settings, updateSettings } = useSettingsStorage();

  const cardFaction = dataSource.data.find((faction) => faction.id === card?.faction_id);
  const detachments = useMemo(() => cardFaction?.detachments || [], [cardFaction?.detachments]);

  const [selectedUnitSize, setSelectedUnitSize] = useState(undefined);
  const [isWarlord, setIsWarlord] = useState(false);
  const [selectedEnhancement, setSelectedEnhancement] = useState(undefined);
  const [selectedDetachment, setSelectedDetachment] = useState(undefined);
  const [detachmentOpen, setDetachmentOpen] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen && card) {
      setIsWarlord(card?.isWarlord || false);
      setSelectedEnhancement(card?.selectedEnhancement);
      setDetachmentOpen(false);

      if (card.unitSize) {
        setSelectedUnitSize(card.unitSize);
      } else if (card?.points?.length === 1) {
        setSelectedUnitSize(card.points[0]);
      } else {
        setSelectedUnitSize(undefined);
      }

      // Detachment selection
      if (card?.detachment) {
        setSelectedDetachment(card.detachment);
      } else if (settings?.selectedDetachment?.[card?.faction_id]) {
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
    }
  }, [isOpen, card, settings?.selectedDetachment, detachments]);

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

  const warlordAlreadyAdded = category?.cards?.find((c) => c.warlord);
  const epicHeroAlreadyAdded = category?.cards?.find((foundCard) => {
    return card?.keywords?.includes("Epic Hero") && card?.id === foundCard?.card?.id;
  });

  const isCharacter = card?.keywords?.includes("Character");
  const isEpicHero = card?.keywords?.includes("Epic Hero");
  const showWarlord = isCharacter || isEpicHero;
  const showEnhancements = isCharacter && !isEpicHero;
  const showDetachments = showEnhancements && detachments?.length > 1;

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
    onSave({ ...card, unitSize: selectedUnitSize, selectedEnhancement, isWarlord });
  };

  const filteredEnhancements = cardFaction?.enhancements
    ?.filter(
      (enhancement) =>
        enhancement?.detachment?.toLowerCase() === selectedDetachment?.toLowerCase() || !enhancement.detachment,
    )
    ?.filter((enhancement) => {
      let isActiveEnhancement = false;
      enhancement.keywords.forEach((keyword) => {
        if (card?.keywords?.includes(keyword)) {
          isActiveEnhancement = true;
        }
        if (card?.factions?.includes(keyword)) {
          isActiveEnhancement = true;
        }
      });
      enhancement?.excludes?.forEach((exclude) => {
        if (card?.keywords?.includes(exclude)) {
          isActiveEnhancement = false;
        }
        if (card?.factions?.includes(exclude)) {
          isActiveEnhancement = false;
        }
      });
      return isActiveEnhancement;
    });

  const isEnhancementDisabled = (enhancement) => {
    return category?.cards?.some((c) => c?.enhancement?.name === enhancement?.name);
  };

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
              {card?.points
                ?.filter((p) => p.active)
                .map((point) => {
                  const isSelected =
                    selectedUnitSize?.models === point.models && selectedUnitSize?.keyword === point.keyword;
                  return (
                    <div
                      key={`${point.models}-${point.keyword || ""}`}
                      className={classNames("ucm-size-option", { selected: isSelected })}
                      onClick={() => setSelectedUnitSize(point)}>
                      <div className={classNames("ucm-radio", { checked: isSelected })} />
                      <div className="ucm-size-text">
                        <span className="ucm-size-label">
                          {point.models} {point.models > 1 ? "models" : "model"}
                          {point.keyword ? ` (${point.keyword})` : ""}
                        </span>
                        <span className="ucm-size-cost">{point.cost} pts</span>
                      </div>
                    </div>
                  );
                })}
            </div>
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

          {/* Enhancements */}
          {showEnhancements && filteredEnhancements?.length > 0 && (
            <div>
              <div className="ucm-section-label">Enhancements</div>
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
        </div>

        {/* Footer */}
        <div className="ucm-footer">
          <button
            className="ucm-submit"
            onClick={handleSubmit}
            disabled={!selectedUnitSize || epicHeroAlreadyAdded}
            type="button">
            Set unit values
          </button>
        </div>
      </div>
    </div>,
    modalRoot,
  );
};
