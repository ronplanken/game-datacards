import { useState, useRef, useEffect } from "react";

/**
 * Auto-saving text input with debounce.
 * Debounces onChange by 300ms, but always flushes on blur.
 */
export const EditorTextField = ({ label, value, onChange, placeholder, multiline = false, className = "" }) => {
  const [localValue, setLocalValue] = useState(value ?? "");
  const timerRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const latestValueRef = useRef(localValue);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Sync from parent when value prop changes externally
  useEffect(() => {
    setLocalValue(value ?? "");
    latestValueRef.current = value ?? "";
  }, [value]);

  // Cleanup pending timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    latestValueRef.current = newValue;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChangeRef.current?.(newValue);
      timerRef.current = null;
    }, 300);
  };

  const handleBlur = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    onChangeRef.current?.(latestValueRef.current);
  };

  const Component = multiline ? "textarea" : "input";

  return (
    <div className={`mobile-editor-field ${className}`}>
      {label && <label className="mobile-editor-field-label">{label}</label>}
      <Component
        className={`mobile-editor-field-input ${multiline ? "mobile-editor-field-textarea" : ""}`}
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        rows={multiline ? 3 : undefined}
      />
    </div>
  );
};
