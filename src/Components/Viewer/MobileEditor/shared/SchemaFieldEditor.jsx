import { EditorTextField } from "./EditorTextField";
import { EditorSelectField } from "./EditorSelectField";
import { EditorToggle } from "./EditorToggle";

// Schema-typed field input: boolean -> toggle, enum -> select, richtext/string -> text.
export const SchemaFieldEditor = ({ field, value, onChange, label }) => {
  const resolvedLabel = label ?? field.label;

  if (field.type === "boolean") {
    return <EditorToggle label={resolvedLabel} checked={!!value} onChange={onChange} />;
  }

  if (field.type === "enum" && Array.isArray(field.options) && field.options.length > 0) {
    const options = field.options.map((opt) => ({ value: opt, label: opt }));
    return <EditorSelectField label={resolvedLabel} value={value} onChange={onChange} options={options} />;
  }

  return (
    <EditorTextField
      label={resolvedLabel}
      value={value}
      onChange={onChange}
      placeholder={resolvedLabel}
      multiline={field.type === "richtext"}
    />
  );
};
