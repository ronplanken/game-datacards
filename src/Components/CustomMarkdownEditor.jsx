import MDEditor, { commands } from "@uiw/react-md-editor";
import React from "react";
import { Palette } from "lucide-react";

// Custom command for line break
const lineBreakCommand = {
  name: "linebreak",
  keyCommand: "linebreak",
  buttonProps: { "aria-label": "Insert line break" },
  icon: (
    <svg width="12" height="12" viewBox="0 0 20 20">
      <path fill="currentColor" d="M17 6v3c0 1.657-1.343 3-3 3H5v2l-4-3 4-3v2h9c.551 0 1-.448 1-1V6h2z" />
    </svg>
  ),
  execute: (state, api) => {
    // Get current selection or cursor position
    const selectedText = state.selectedText;

    if (selectedText) {
      // If text is selected, add line break after it
      const modifyText = `${selectedText}\\\n`;
      api.replaceSelection(modifyText);
    } else {
      // If no text selected, just insert line break at cursor
      // Using backslash escape for line break
      api.replaceSelection(`\\\n`);
    }
  },
};

// Color presets
const colorPresets = [
  { name: "Red", value: "#ff0000" },
  { name: "Blue", value: "#0000ff" },
  { name: "Green", value: "#008000" },
  { name: "Yellow", value: "#ffff00" },
  { name: "Orange", value: "#ffa500" },
  { name: "Purple", value: "#800080" },
  { name: "Brown", value: "#964b00" },
  { name: "Pink", value: "#ffc0cb" },
  { name: "Gray", value: "#808080" },
  { name: "Black", value: "#000000" },
];

// Color commands - create individual command for each color
const colorCommands = colorPresets.map((color) => ({
  name: `color-${color.name.toLowerCase()}`,
  keyCommand: `color-${color.name.toLowerCase()}`,
  buttonProps: { "aria-label": `Color text ${color.name}` },
  icon: (
    <span style={{ display: "flex", alignItems: "center" }}>
      <span
        style={{
          display: "inline-block",
          width: "12px",
          height: "12px",
          backgroundColor: color.value,
          border: "1px solid #ccc",
          borderRadius: "2px",
        }}
      />
    </span>
  ),
  execute: (state, api) => {
    const selectedText = state.selectedText || "colored text";
    const modifyText = `<span style="color: ${color.value}">${selectedText}</span>`;
    api.replaceSelection(modifyText);
  },
}));

// Group color commands under a dropdown
const colorCommand = commands.group(colorCommands, {
  name: "color",
  groupName: "color",
  buttonProps: { "aria-label": "Color text" },
  icon: <Palette size={12} />,
});

export function CustomMarkdownEditor({ value, onChange, preview = "edit", height = 200, ...props }) {
  const customCommands = [
    commands.bold,
    commands.italic,
    commands.strikethrough,
    colorCommand,
    commands.divider,
    lineBreakCommand,
    commands.hr,
    commands.divider,
    commands.unorderedListCommand,
    commands.orderedListCommand,
    commands.divider,
  ];

  return (
    <MDEditor
      value={value}
      onChange={onChange}
      preview={preview}
      height={height}
      commands={customCommands}
      extraCommands={[]}
      {...props}
    />
  );
}
