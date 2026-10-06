import React from "react";

const isMac = typeof navigator !== "undefined" && /Mac/.test(navigator.platform);

export const Kbd = ({ mod, children }) => (
  <kbd className="help-kbd">
    {mod ? `${isMac ? "Cmd" : "Ctrl"}+` : ""}
    {children}
  </kbd>
);
