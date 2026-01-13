/**
 * Grid Calculator - Core utility for grid-based positioning
 * Converts between grid coordinates and pixel coordinates
 */

export const GRID_CONFIG = {
  // Standard datacard dimensions (pixels)
  CARD_WIDTH_PX: 768,
  CARD_HEIGHT_PX: 1024,

  // Grid layout
  GRID_COLUMNS: 12,
  GRID_ROWS: 20,

  // Gutter/spacing
  GUTTER_SIZE: 4,

  // Derived values (getters for dynamic calculation)
  get CELL_WIDTH() {
    return this.CARD_WIDTH_PX / this.GRID_COLUMNS;
  },
  get CELL_HEIGHT() {
    return this.CARD_HEIGHT_PX / this.GRID_ROWS;
  },
};

/**
 * Convert grid position to pixel position
 * @param {Object} gridPos - {x, y, width, height} in grid units
 * @param {Object} gridConfig - Optional custom grid configuration
 * @returns {Object} {x, y, width, height} in pixels
 */
export function gridToPixels(gridPos, gridConfig = GRID_CONFIG) {
  return {
    x: gridPos.x * gridConfig.CELL_WIDTH,
    y: gridPos.y * gridConfig.CELL_HEIGHT,
    width: gridPos.width * gridConfig.CELL_WIDTH,
    height: gridPos.height * gridConfig.CELL_HEIGHT,
  };
}

/**
 * Convert pixel position to grid position (with snapping)
 * @param {Object} pixelPos - {x, y, width, height} in pixels
 * @param {Object} gridConfig - Optional custom grid configuration
 * @returns {Object} {x, y, width, height} in grid units
 */
export function pixelsToGrid(pixelPos, gridConfig = GRID_CONFIG) {
  return {
    x: Math.round(pixelPos.x / gridConfig.CELL_WIDTH),
    y: Math.round(pixelPos.y / gridConfig.CELL_HEIGHT),
    width: Math.max(1, Math.round(pixelPos.width / gridConfig.CELL_WIDTH)),
    height: Math.max(1, Math.round(pixelPos.height / gridConfig.CELL_HEIGHT)),
  };
}

/**
 * Snap pixel position to nearest grid cell
 * @param {Object} pixelPos - {x, y} in pixels
 * @param {Object} gridConfig - Optional custom grid configuration
 * @returns {Object} {x, y} in pixels (snapped)
 */
export function snapToGrid(pixelPos, gridConfig = GRID_CONFIG) {
  const gridPos = pixelsToGrid(pixelPos, gridConfig);
  return {
    x: gridPos.x * gridConfig.CELL_WIDTH,
    y: gridPos.y * gridConfig.CELL_HEIGHT,
  };
}

/**
 * Check if a grid position is within canvas bounds
 * @param {Object} gridPos - {x, y, width, height} in grid units
 * @param {Object} gridConfig - Optional custom grid configuration
 * @returns {boolean}
 */
export function isWithinBounds(gridPos, gridConfig = GRID_CONFIG) {
  return (
    gridPos.x >= 0 &&
    gridPos.y >= 0 &&
    gridPos.x + gridPos.width <= gridConfig.GRID_COLUMNS &&
    gridPos.y + gridPos.height <= gridConfig.GRID_ROWS
  );
}

/**
 * Constrain grid position to canvas bounds
 * @param {Object} gridPos - {x, y, width, height} in grid units
 * @param {Object} gridConfig - Optional custom grid configuration
 * @returns {Object} Constrained grid position
 */
export function constrainToBounds(gridPos, gridConfig = GRID_CONFIG) {
  return {
    x: Math.max(0, Math.min(gridPos.x, gridConfig.GRID_COLUMNS - gridPos.width)),
    y: Math.max(0, Math.min(gridPos.y, gridConfig.GRID_ROWS - gridPos.height)),
    width: Math.min(gridPos.width, gridConfig.GRID_COLUMNS - gridPos.x),
    height: Math.min(gridPos.height, gridConfig.GRID_ROWS - gridPos.y),
  };
}

/**
 * Calculate grid lines for rendering
 * @param {Object} gridConfig - Optional custom grid configuration
 * @returns {Object} {vertical: [...], horizontal: [...]} arrays of line positions in pixels
 */
export function calculateGridLines(gridConfig = GRID_CONFIG) {
  const vertical = [];
  const horizontal = [];

  // Vertical lines
  for (let i = 0; i <= gridConfig.GRID_COLUMNS; i++) {
    vertical.push(i * gridConfig.CELL_WIDTH);
  }

  // Horizontal lines
  for (let i = 0; i <= gridConfig.GRID_ROWS; i++) {
    horizontal.push(i * gridConfig.CELL_HEIGHT);
  }

  return { vertical, horizontal };
}
