/**
 * Demo Template - For testing and initial development
 */

import { ELEMENT_TYPES, SHAPE_TYPES } from "./constants";

export const DEMO_TEMPLATE = {
  id: "demo-template-1",
  name: "Demo Card Template",
  description: "Example template for testing",
  version: 1,
  gameSystem: "40k-10e",
  cardType: "datasheet",

  canvas: {
    gridColumns: 12,
    gridRows: 20,
    width: 768,
    height: 1024,
    backgroundColor: "#1a1a2e",
    showGrid: true,
  },

  elements: [
    // Header background
    {
      id: "element-1",
      name: "Header Background",
      type: ELEMENT_TYPES.SHAPE,
      position: {
        x: 0,
        y: 0,
        width: 12,
        height: 2,
      },
      zIndex: 1,
      locked: false,
      visible: true,
      style: {
        opacity: 1,
        rotation: 0,
      },
      properties: {
        shape: SHAPE_TYPES.RECTANGLE,
        fill: "#2d4059",
        stroke: "#000000",
        strokeWidth: 2,
      },
    },

    // Unit name text
    {
      id: "element-2",
      name: "Unit Name",
      type: ELEMENT_TYPES.TEXT,
      position: {
        x: 1,
        y: 0,
        width: 9,
        height: 2,
      },
      zIndex: 2,
      locked: false,
      visible: true,
      style: {
        opacity: 1,
        rotation: 0,
        backgroundColor: "transparent",
        padding: { top: 8, right: 8, bottom: 8, left: 8 },
      },
      properties: {
        content: "Space Marine Intercessors",
        fontSize: 24,
        fontFamily: "Arial",
        fontWeight: "bold",
        fontStyle: "normal",
        color: "#ffffff",
        textAlign: "left",
        verticalAlign: "middle",
        lineHeight: 1.2,
        letterSpacing: 0,
      },
    },

    // Points badge circle
    {
      id: "element-3",
      name: "Points Badge Background",
      type: ELEMENT_TYPES.SHAPE,
      position: {
        x: 10,
        y: 0,
        width: 2,
        height: 2,
      },
      zIndex: 2,
      locked: false,
      visible: true,
      style: {
        opacity: 1,
        rotation: 0,
      },
      properties: {
        shape: SHAPE_TYPES.CIRCLE,
        fill: "#ffd700",
        stroke: "#000000",
        strokeWidth: 3,
      },
    },

    // Points text
    {
      id: "element-4",
      name: "Points Value",
      type: ELEMENT_TYPES.TEXT,
      position: {
        x: 10,
        y: 0,
        width: 2,
        height: 2,
      },
      zIndex: 3,
      locked: false,
      visible: true,
      style: {
        opacity: 1,
        rotation: 0,
        backgroundColor: "transparent",
      },
      properties: {
        content: "90",
        fontSize: 32,
        fontFamily: "Arial",
        fontWeight: "bold",
        fontStyle: "normal",
        color: "#000000",
        textAlign: "center",
        verticalAlign: "middle",
        lineHeight: 1,
        letterSpacing: 0,
      },
    },

    // Content area background
    {
      id: "element-5",
      name: "Content Background",
      type: ELEMENT_TYPES.SHAPE,
      position: {
        x: 0,
        y: 2,
        width: 12,
        height: 18,
      },
      zIndex: 1,
      locked: false,
      visible: true,
      style: {
        opacity: 1,
        rotation: 0,
      },
      properties: {
        shape: SHAPE_TYPES.RECTANGLE,
        fill: "#f5f5f5",
        stroke: "#000000",
        strokeWidth: 2,
      },
    },

    // Stats section label
    {
      id: "element-6",
      name: "Stats Label",
      type: ELEMENT_TYPES.TEXT,
      position: {
        x: 1,
        y: 3,
        width: 10,
        height: 1,
      },
      zIndex: 2,
      locked: false,
      visible: true,
      style: {
        opacity: 1,
        rotation: 0,
        backgroundColor: "transparent",
      },
      properties: {
        content: "Unit Stats",
        fontSize: 18,
        fontFamily: "Arial",
        fontWeight: "bold",
        fontStyle: "normal",
        color: "#2d4059",
        textAlign: "left",
        verticalAlign: "middle",
        lineHeight: 1.2,
        letterSpacing: 0,
      },
    },

    // Divider line
    {
      id: "element-7",
      name: "Divider",
      type: ELEMENT_TYPES.SHAPE,
      position: {
        x: 1,
        y: 4,
        width: 10,
        height: 0.1,
      },
      zIndex: 2,
      locked: false,
      visible: true,
      style: {
        opacity: 1,
        rotation: 0,
      },
      properties: {
        shape: SHAPE_TYPES.RECTANGLE,
        fill: "#2d4059",
        stroke: "transparent",
        strokeWidth: 0,
      },
    },

    // Abilities section
    {
      id: "element-8",
      name: "Abilities Section",
      type: ELEMENT_TYPES.TEXT,
      position: {
        x: 1,
        y: 5,
        width: 10,
        height: 4,
      },
      zIndex: 2,
      locked: false,
      visible: true,
      style: {
        opacity: 1,
        rotation: 0,
        backgroundColor: "#ffffff",
        padding: { top: 8, right: 8, bottom: 8, left: 8 },
      },
      properties: {
        content:
          "Bolt Rifles: The backbone of the Space Marine army, Intercessors are equipped with bolt rifles that can cut down infantry at range.\n\nCombat Squads: This unit can split into two smaller units.",
        fontSize: 14,
        fontFamily: "Arial",
        fontWeight: "normal",
        fontStyle: "normal",
        color: "#000000",
        textAlign: "left",
        verticalAlign: "top",
        lineHeight: 1.5,
        letterSpacing: 0,
      },
    },
  ],
};
