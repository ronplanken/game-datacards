import React, { useRef } from "react";

/**
 * Color swatch + hex text input for properties panel.
 * Mirrors gdc-premium Designer ColorInput with identical API.
 */
export const ColorInput = ({ value, onChange, allowTransparent = false }) => {
  const colorRef = useRef(null);

  const isTransparent = !value || value === "transparent";

  const handleSwatchClick = () => {
    if (colorRef.current) {
      colorRef.current.click();
    }
  };

  const handleColorChange = (e) => {
    onChange(e.target.value);
  };

  const handleTextChange = (e) => {
    const text = e.target.value;
    if (allowTransparent && (text === "" || text.toLowerCase() === "transparent")) {
      onChange("transparent");
    } else {
      onChange(text);
    }
  };

  return (
    <div className="props-color-input">
      <input
        ref={colorRef}
        type="color"
        value={isTransparent ? "#000000" : value}
        onChange={handleColorChange}
        style={{ display: "none" }}
      />
      <button
        className={`props-color-swatch${isTransparent ? " transparent" : ""}`}
        style={isTransparent ? {} : { backgroundColor: value }}
        onClick={handleSwatchClick}
        type="button"
        aria-label="Pick color"
      />
      <input
        type="text"
        className="props-color-text"
        value={isTransparent ? "transparent" : value || ""}
        onChange={handleTextChange}
        placeholder={allowTransparent ? "transparent" : "#000000"}
      />
    </div>
  );
};
