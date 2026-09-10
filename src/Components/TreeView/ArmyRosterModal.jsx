import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { Check, X } from "lucide-react";
import classNames from "classnames";
import {
  BATTLE_SIZES,
  canAddDetachment,
  getBattleSize,
  getDetachmentCost,
  getSpentDetachmentPoints,
  isDetachmentSelected,
  isDetachmentSelectionOverBudget,
  toggleDetachment,
} from "../../Helpers/listRoster.helpers";
import { localize } from "../../Helpers/localization.helpers";
// Reuses the unit config modal's glass shell (ucm-*); ArmyRosterModal.css layers
// the battle size / DP bits on top.
import "./UnitConfigModal.css";
import "./ArmyRosterModal.css";

/**
 * Army-wide roster settings for an 11th edition list: the battle size and the
 * detachments bought with its Detachment Points. The desktop counterpart of the
 * mobile ArmyRosterSheet — several detachments can be held at once (each granting
 * its own force disposition), the same one only once.
 */
export const ArmyRosterModal = ({
  isOpen,
  onClose,
  detachments = [],
  selectedDetachments = [],
  battleSize,
  onChangeBattleSize,
  onChangeDetachments,
  language = "en",
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const size = getBattleSize(battleSize);
  const spent = getSpentDetachmentPoints(selectedDetachments);
  const remaining = size.dp - spent;
  // Dropping to a smaller battle size can leave detachments the new budget
  // cannot pay for. They are kept — the user chose them — but flagged.
  const overBudget = isDetachmentSelectionOverBudget(selectedDetachments, size.key);

  const handleToggle = (detachment) => {
    onChangeDetachments(toggleDetachment(selectedDetachments, detachment, size.key));
  };

  const modalRoot = document.getElementById("modal-root");

  return ReactDOM.createPortal(
    <div className="ucm-overlay" onClick={onClose} data-testid="arm-overlay">
      <div className="ucm-modal" onClick={(e) => e.stopPropagation()} data-testid="arm-modal">
        <div className="ucm-header">
          <h3 className="ucm-title">Army roster</h3>
          <button className="ucm-close" onClick={onClose} type="button" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="ucm-content">
          <div>
            <div className="ucm-section-label">Battle size</div>
            <div className="arm-battle-sizes">
              {BATTLE_SIZES.map((option) => (
                <button
                  key={option.key}
                  className={classNames("arm-battle-size", { selected: option.key === size.key })}
                  onClick={() => onChangeBattleSize(option.key)}
                  type="button">
                  <span className="arm-battle-label">{option.label}</span>
                  <span className="arm-battle-meta">
                    {option.points} pts · {option.dp} DP
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="ucm-section-label">
              Detachments
              <span className={classNames("arm-dp", { "arm-dp--over": overBudget })}>
                {spent}/{size.dp} DP
              </span>
            </div>
            {detachments.length === 0 ? (
              <p className="arm-empty">This faction has no detachments.</p>
            ) : (
              <div className="ucm-enhancement-list">
                {detachments.map((detachment) => {
                  const name = localize(detachment?.name, language);
                  const cost = getDetachmentCost(detachment);
                  const selected = isDetachmentSelected(selectedDetachments, detachment);
                  // Unaffordable options stay visible but disabled so the DP
                  // budget is obvious rather than silently hiding choices.
                  const disabled = !selected && !canAddDetachment(selectedDetachments, detachment, size.key);
                  const disposition = localize(detachment?.forceDisposition?.name, language);
                  return (
                    <div
                      key={detachment.id || name}
                      className={classNames("ucm-enhancement-option", { selected, disabled })}
                      onClick={!disabled ? () => handleToggle(detachment) : undefined}>
                      <div className={classNames("ucm-radio", { checked: selected })} />
                      <div className="ucm-enhancement-text">
                        <span className="ucm-enhancement-name">
                          {name}
                          {disposition && <span className="arm-disposition">{disposition}</span>}
                        </span>
                        <span className="ucm-enhancement-cost">
                          {cost} DP
                          {selected && <Check size={14} className="arm-check" />}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {overBudget && (
              <p className="arm-hint arm-hint--over">
                This selection costs {spent} DP, more than {size.label} allows. Remove a detachment.
              </p>
            )}
            {!overBudget && remaining > 0 && selectedDetachments.length > 0 && (
              <p className="arm-hint">{remaining} DP remaining.</p>
            )}
          </div>
        </div>

        <div className="ucm-footer">
          <button className="ucm-submit" onClick={onClose} type="button">
            Done
          </button>
        </div>
      </div>
    </div>,
    modalRoot,
  );
};
