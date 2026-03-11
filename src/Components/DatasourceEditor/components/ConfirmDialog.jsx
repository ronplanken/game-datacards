import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";

export const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}) => {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (open && confirmRef.current) {
      confirmRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onCancel?.();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="designer-confirm-overlay" onClick={onCancel} role="dialog" aria-modal="true" aria-label={title}>
      <div className="designer-confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="designer-confirm-header">
          <AlertTriangle />
          <h3 className="designer-confirm-title">{title}</h3>
        </div>
        <div className="designer-confirm-body">{message}</div>
        <div className="designer-confirm-footer">
          <button className="designer-btn" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button className="designer-btn designer-btn-danger" onClick={onConfirm} ref={confirmRef}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
