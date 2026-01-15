/**
 * Card Designer Constants
 */

// Element types
export const ELEMENT_TYPES = {
  TEXT: "text",
  DATA_TEXT: "dataText",
  SHAPE: "shape",
  BADGE: "badge",
  IMAGE: "image",
  TABLE: "table",
  CONTAINER: "container",
};

// Shape types
export const SHAPE_TYPES = {
  RECTANGLE: "rectangle",
  CIRCLE: "circle",
  ELLIPSE: "ellipse",
  LINE: "line",
};

// Text alignment options
export const TEXT_ALIGN = {
  LEFT: "left",
  CENTER: "center",
  RIGHT: "right",
  JUSTIFY: "justify",
};

export const VERTICAL_ALIGN = {
  TOP: "top",
  MIDDLE: "middle",
  BOTTOM: "bottom",
};

// Font weights
export const FONT_WEIGHTS = {
  NORMAL: "normal",
  BOLD: "bold",
  100: "100",
  200: "200",
  300: "300",
  400: "400",
  500: "500",
  600: "600",
  700: "700",
  800: "800",
  900: "900",
};

// Game systems
export const GAME_SYSTEMS = {
  "40K_10E": "40k-10e",
  AOS: "aos",
};

// Card types per game system
export const CARD_TYPES = {
  "40k-10e": ["datasheet", "stratagem", "enhancement", "rule"],
  aos: ["warscroll", "spell", "prayer"],
};

// Default element configurations
export const DEFAULT_ELEMENTS = {
  [ELEMENT_TYPES.TEXT]: {
    properties: {
      content: "Text",
      fontSize: 16,
      fontFamily: "Arial",
      fontWeight: "normal",
      fontStyle: "normal",
      color: "#000000",
      textAlign: TEXT_ALIGN.LEFT,
      verticalAlign: VERTICAL_ALIGN.TOP,
      lineHeight: 1.2,
      letterSpacing: 0,
    },
    position: {
      x: 0,
      y: 0,
      width: 4,
      height: 2,
    },
    style: {
      opacity: 1,
      rotation: 0,
      backgroundColor: "transparent",
      padding: { top: 4, right: 4, bottom: 4, left: 4 },
    },
  },
  [ELEMENT_TYPES.SHAPE]: {
    properties: {
      shape: SHAPE_TYPES.RECTANGLE,
      fill: "#cccccc",
      stroke: "#000000",
      strokeWidth: 1,
    },
    position: {
      x: 0,
      y: 0,
      width: 4,
      height: 4,
    },
    style: {
      opacity: 1,
      rotation: 0,
    },
  },
  [ELEMENT_TYPES.DATA_TEXT]: {
    properties: {
      content: "",
      dataBinding: "",
      fallbackText: "N/A",
      prefix: "",
      suffix: "",
      fontSize: 16,
      fontFamily: "Arial",
      fontWeight: "normal",
      color: "#000000",
      textAlign: TEXT_ALIGN.LEFT,
    },
    position: {
      x: 0,
      y: 0,
      width: 4,
      height: 2,
    },
    style: {
      opacity: 1,
      backgroundColor: "transparent",
    },
  },
  [ELEMENT_TYPES.BADGE]: {
    properties: {
      icon: "",
      iconSize: 24,
      iconColor: "#000000",
      dataBinding: "",
      showLabel: true,
      labelPosition: "bottom",
      badgeShape: "circle",
      backgroundColor: "#ffffff",
      borderColor: "#000000",
      borderWidth: 2,
    },
    position: {
      x: 0,
      y: 0,
      width: 2,
      height: 2,
    },
    style: {
      opacity: 1,
    },
  },
  [ELEMENT_TYPES.IMAGE]: {
    properties: {
      imageUrl: "",
      dataBinding: "",
      objectFit: "cover",
      objectPosition: "center",
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
    },
    position: {
      x: 0,
      y: 0,
      width: 4,
      height: 4,
    },
    style: {
      opacity: 1,
      borderRadius: 0,
    },
  },
};

// Canvas defaults
export const DEFAULT_CANVAS = {
  gridColumns: 12,
  gridRows: 20,
  width: 768,
  height: 1024,
  backgroundColor: "#ffffff",
  showGrid: true,
};

// Grid display settings
export const GRID_DISPLAY = {
  LINE_COLOR: "#e0e0e0",
  LINE_WIDTH: 1,
  MAJOR_LINE_COLOR: "#b0b0b0",
  MAJOR_LINE_WIDTH: 2,
  MAJOR_LINE_INTERVAL: 4, // Every 4th line is major
};

// Zoom levels
export const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
export const DEFAULT_ZOOM = 1;

// Selection colors
export const SELECTION_COLOR = "#0066ff";
export const SELECTION_STROKE_WIDTH = 2;

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  DELETE: ["Delete", "Backspace"],
  UNDO: ["Control+z", "Meta+z"],
  REDO: ["Control+y", "Meta+y", "Control+Shift+z", "Meta+Shift+z"],
  COPY: ["Control+c", "Meta+c"],
  PASTE: ["Control+v", "Meta+v"],
  DUPLICATE: ["Control+d", "Meta+d"],
  SELECT_ALL: ["Control+a", "Meta+a"],
  SAVE: ["Control+s", "Meta+s"],
  GROUP: ["Control+g", "Meta+g"],
  UNGROUP: ["Control+Shift+g", "Meta+Shift+g"],
  BRING_FORWARD: ["]"],
  SEND_BACKWARD: ["["],
  BRING_TO_FRONT: ["Control+]", "Meta+]"],
  SEND_TO_BACK: ["Control+[", "Meta+["],
};
