import { EditorAccordion } from "../shared/EditorAccordion";
import { EditorTextField } from "../shared/EditorTextField";
import { EditorToggle } from "../shared/EditorToggle";

export const FieldsSection = ({ card, config, label, icon, updateField }) => {
  const { fields } = config;

  return (
    <EditorAccordion title={label} icon={icon}>
      <div className="mobile-editor-fields-list">
        {fields.map((field) => {
          if (field.type === "boolean") {
            return (
              <EditorToggle
                key={field.key}
                label={field.label}
                checked={!!card[field.key]}
                onChange={(value) => updateField(field.key, value)}
              />
            );
          }

          if (field.type === "enum" && field.options) {
            return (
              <div key={field.key} className="mobile-editor-field">
                <label className="mobile-editor-field-label">{field.label}</label>
                <select
                  className="mobile-editor-select"
                  value={card[field.key] || ""}
                  onChange={(e) => updateField(field.key, e.target.value)}>
                  <option value="">Select...</option>
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          // string or richtext
          return (
            <EditorTextField
              key={field.key}
              label={field.label}
              value={card[field.key]}
              onChange={(value) => updateField(field.key, value)}
              placeholder={field.label}
              multiline={field.type === "richtext"}
            />
          );
        })}
      </div>
    </EditorAccordion>
  );
};
