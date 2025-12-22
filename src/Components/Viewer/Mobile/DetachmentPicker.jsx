import { Check } from "lucide-react";
import { BottomSheet } from "./BottomSheet";
import "./DetachmentPicker.css";

export const DetachmentPicker = ({ isOpen, onClose, detachments, selected, onSelect }) => {
  const handleSelect = (detachment) => {
    onSelect(detachment);
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Select Detachment">
      <div className="detachment-list">
        {detachments?.map((detachment) => (
          <button
            key={detachment}
            className={`detachment-option ${selected === detachment ? "selected" : ""}`}
            onClick={() => handleSelect(detachment)}>
            <span className="detachment-name">{detachment}</span>
            {selected === detachment && <Check size={18} />}
          </button>
        ))}
      </div>
    </BottomSheet>
  );
};
