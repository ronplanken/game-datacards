import { EditorTextField } from "./EditorTextField";
import { EditorSelectField } from "./EditorSelectField";
import { EditorToggle } from "./EditorToggle";

/**
 * Schema-aware field editor that mirrors the desktop SchemaFieldEditor in
 * premium. Switches on `field.type` so the same primitive can drive stats,
 * weapon columns, fields, and collection entries from a custom datasource
 * schema.
 *
 * - boolean → EditorToggle
 * - enum    → EditorSelectField (uses field.options)
 * - richtext → multiline EditorTextField
 * - string (default) → single-line EditorTextField
 */
export const SchemaFieldEditor = ({ field, value, onChange, label, className = "" }) => {
  const resolvedLabel = label ?? field.label;

  if (field.type === "boolean") {
    return <EditorToggle label={resolvedLabel} checked={!!value} onChange={onChange} />;
  }

  if (field.type === "enum" && Array.isArray(field.options) && field.options.length > 0) {
    const options = field.options.map((opt) => ({ value: opt, label: opt }));
    return (
      <EditorSelectField
        label={resolvedLabel}
        value={value}
        onChange={onChange}
        options={options}
        className={className}
      />
    );
  }

  return (
    <EditorTextField
      label={resolvedLabel}
      value={value}
      onChange={onChange}
      placeholder={resolvedLabel}
      multiline={field.type === "richtext"}
      className={className}
    />
  );
};
