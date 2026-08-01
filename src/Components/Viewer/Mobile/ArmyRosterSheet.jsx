import { Check } from "lucide-react";
import {
  BATTLE_SIZES,
  canAddDetachment,
  getBattleSize,
  getDetachmentCost,
  getSpentDetachmentPoints,
  isDetachmentSelected,
  toggleDetachment,
} from "../../../Helpers/listRoster.helpers";
import { localize } from "../../../Helpers/localization.helpers";
import { BottomSheet } from "./BottomSheet";
// Detachment rows reuse the picker's row styling; ArmyRosterSheet.css layers the
// DP cost / disposition bits on top.
import "./DetachmentPicker.css";
import "./ArmyRosterSheet.css";

/**
 * Army-wide roster settings for an 11th edition list: the battle size and the
 * detachments bought with its Detachment Points. Several detachments can be held
 * at once (each granting its own force disposition), the same one only once.
 */
export const ArmyRosterSheet = ({
  isOpen,
  onClose,
  detachments = [],
  selectedDetachments = [],
  battleSize,
  onChangeBattleSize,
  onChangeDetachments,
  language = "en",
  // Opened from inside the list overview modal, so the sheet has to clear that
  // layer or it renders behind it.
  elevated = true,
}) => {
  const size = getBattleSize(battleSize);
  const spent = getSpentDetachmentPoints(selectedDetachments);
  const remaining = size.dp - spent;

  const handleToggle = (detachment) => {
    onChangeDetachments(toggleDetachment(selectedDetachments, detachment, size.key));
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Army Roster" elevated={elevated}>
      <div className="army-roster">
        <div className="army-roster-section">
          <h4 className="army-roster-title">Battle size</h4>
          <div className="army-roster-battle-sizes">
            {BATTLE_SIZES.map((option) => (
              <button
                key={option.key}
                className={`army-roster-battle-size ${option.key === size.key ? "selected" : ""}`}
                onClick={() => onChangeBattleSize(option.key)}>
                <span className="army-roster-battle-label">{option.label}</span>
                <span className="army-roster-battle-meta">
                  {option.points} pts · {option.dp} DP
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="army-roster-section">
          <h4 className="army-roster-title">
            Detachments
            <span className="army-roster-dp">
              {spent}/{size.dp} DP
            </span>
          </h4>
          {detachments.length === 0 ? (
            <p className="army-roster-empty">This faction has no detachments.</p>
          ) : (
            <div className="detachment-list">
              {detachments.map((detachment) => {
                const name = localize(detachment?.name, language);
                const cost = getDetachmentCost(detachment);
                const selected = isDetachmentSelected(selectedDetachments, detachment);
                // Unaffordable options stay visible but disabled so the DP budget
                // is obvious rather than silently hiding choices.
                const disabled = !selected && !canAddDetachment(selectedDetachments, detachment, size.key);
                const disposition = localize(detachment?.forceDisposition?.name, language);
                return (
                  <button
                    key={detachment.id || name}
                    className={`detachment-option ${selected ? "selected" : ""} ${disabled ? "disabled" : ""}`}
                    onClick={() => !disabled && handleToggle(detachment)}
                    disabled={disabled}>
                    <span className="detachment-text">
                      <span className="detachment-name">{name}</span>
                      {disposition && <span className="detachment-disposition">{disposition}</span>}
                    </span>
                    <span className="detachment-cost">{cost} DP</span>
                    {selected && <Check size={18} />}
                  </button>
                );
              })}
            </div>
          )}
          {remaining > 0 && selectedDetachments.length > 0 && (
            <p className="army-roster-hint">{remaining} DP remaining.</p>
          )}
        </div>
      </div>
    </BottomSheet>
  );
};
