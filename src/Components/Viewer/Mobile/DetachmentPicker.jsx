import { Check } from "lucide-react";
import { getDetachmentName } from "../../../Helpers/faction.helpers";
import { BottomSheet } from "./BottomSheet";
import "./DetachmentPicker.css";

export const DetachmentPicker = ({ isOpen, onClose, detachments, selected, onSelect }) => {
  const handleSelect = (detachmentName) => {
    onSelect(detachmentName);
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Select Detachment">
      <div className="detachment-list">
        {detachments?.map((detachment) => {
          const detachmentName = getDetachmentName(detachment);
          return (
            <button
              key={detachmentName}
              className={`detachment-option ${selected === detachmentName ? "selected" : ""}`}
              onClick={() => handleSelect(detachmentName)}>
              <span className="detachment-name">{detachmentName}</span>
              {selected === detachmentName && <Check size={18} />}
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
};
