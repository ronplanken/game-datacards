import { useEffect, useRef, useCallback } from "react";
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
  const dialogRef = useRef(null);
  const confirmRef = useRef(null);

  useEffect(() => {
    if (open && confirmRef.current) {
      confirmRef.current.focus();
    }
  }, [open]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        onCancel?.();
        return;
      }
      // Focus trap: Tab cycles between Cancel and Confirm buttons
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll("button:not([disabled])");
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onCancel],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="designer-confirm-overlay" onClick={onCancel} role="dialog" aria-modal="true" aria-label={title}>
      <div className="designer-confirm-dialog" ref={dialogRef} onClick={(e) => e.stopPropagation()}>
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
